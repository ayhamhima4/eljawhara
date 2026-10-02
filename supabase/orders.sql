create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  full_name text not null,
  phone text not null,
  wilaya text not null,
  address text not null,
  notes text,
  payment_method text not null check (payment_method in ('cod', 'edahabia')),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_fee numeric(12, 2) not null check (shipping_fee >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  total numeric(12, 2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
  on public.orders for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select, update on public.orders to authenticated;
grant insert on public.orders to anon, authenticated;
grant all on public.orders to service_role;
revoke all on public.orders from anon;
grant insert on public.orders to anon;

drop policy if exists "Customers can place orders" on public.orders;
create policy "Customers can place orders"
  on public.orders for insert to anon, authenticated
  with check (
    status = 'pending'
    and length(trim(full_name)) between 2 and 150
    and length(trim(phone)) between 9 and 30
    and length(trim(wilaya)) between 2 and 100
    and length(trim(address)) between 3 and 500
    and jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) > 0
    and abs(total - greatest(0, subtotal + shipping_fee - discount)) < 0.01
  );

create or replace function public.place_store_order(
  p_customer jsonb,
  p_items jsonb,
  p_coupon text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_item jsonb;
  v_product record;
  v_quantity integer;
  v_subtotal numeric(12, 2) := 0;
  v_shipping_fee numeric(12, 2);
  v_discount numeric(12, 2) := 0;
  v_order_items jsonb := '[]'::jsonb;
  v_order public.orders;
begin
  if p_customer is null
    or nullif(trim(p_customer ->> 'fullName'), '') is null
    or nullif(trim(p_customer ->> 'phone'), '') is null
    or nullif(trim(p_customer ->> 'wilaya'), '') is null
    or nullif(trim(p_customer ->> 'address'), '') is null then
    raise exception 'يرجى استكمال بيانات العميل والعنوان';
  end if;

  if coalesce(p_customer ->> 'paymentMethod', '') not in ('cod', 'edahabia') then
    raise exception 'طريقة الدفع غير صالحة';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'السلة فارغة';
  end if;

  for v_cart_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_cart_item ->> 'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'كمية المنتج غير صالحة';
    end if;

    select id, name, price, stock, image
      into v_product
      from public.products
      where id = (v_cart_item ->> 'productId')::uuid
      for update;

    if not found then
      raise exception 'أحد المنتجات المطلوبة لم يعد متوفراً';
    end if;
    if v_product.stock < v_quantity then
      raise exception 'الكمية المطلوبة من "%" غير متوفرة. المتبقي: %', v_product.name, v_product.stock;
    end if;

    update public.products
      set stock = stock - v_quantity
      where id = v_product.id;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
    v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
      'productId', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'quantity', v_quantity,
      'image', coalesce(v_product.image, '')
    ));
  end loop;

  v_shipping_fee := case when v_subtotal > 300 then 0 else 40 end;
  v_discount := case p_coupon
    when 'CHEF10' then round(v_subtotal * 0.10, 2)
    when 'BAKER20' then round(v_subtotal * 0.20, 2)
    else 0
  end;

  insert into public.orders (
    order_number, full_name, phone, wilaya, address, notes,
    payment_method, items, subtotal, shipping_fee, discount, total, status
  ) values (
    'BK-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
    trim(p_customer ->> 'fullName'),
    trim(p_customer ->> 'phone'),
    trim(p_customer ->> 'wilaya'),
    trim(p_customer ->> 'address'),
    nullif(trim(coalesce(p_customer ->> 'notes', '')), ''),
    p_customer ->> 'paymentMethod',
    v_order_items,
    v_subtotal,
    v_shipping_fee,
    v_discount,
    greatest(0, v_subtotal + v_shipping_fee - v_discount),
    'pending'
  ) returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.place_store_order(jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.place_store_order(jsonb, jsonb, text) to service_role;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'orders'
    ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;