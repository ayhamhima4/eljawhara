import { supabase } from '../supabaseClient';
import type { Order, OrderStatus } from '../types/store';

function mapOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: {
      fullName: row.customer_name,
      phone: row.phone,
      wilaya: row.wilaya,
      address: row.address,
      notes: row.notes ?? undefined,
      paymentMethod: row.payment_method,
    },
    items: row.items,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    discount: Number(row.discount),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message || 'تعذر تحميل الطلبات');
  return (data ?? []).map(mapOrder);
}

export async function updateAdminOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message || 'تعذر تحديث حالة الطلب');
  return mapOrder(data);
}