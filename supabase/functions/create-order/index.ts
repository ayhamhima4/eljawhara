import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  let payload: {
    customer?: Record<string, unknown>;
    items?: Array<{ productId?: string; quantity?: number }>;
    coupon?: string | null;
  };

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'بيانات الطلب غير صالحة' }, 400);
  }

  if (!payload.customer || !Array.isArray(payload.items) || payload.items.length === 0) {
    return jsonResponse({ success: false, error: 'بيانات العميل أو المنتجات غير مكتملة' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase server environment variables');
    return jsonResponse({ success: false, error: 'خدمة الطلبات غير مهيأة على الخادم' }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc('place_store_order', {
    p_customer: payload.customer,
    p_items: payload.items,
    p_coupon: payload.coupon ?? null,
  });

  if (error || !data) {
    console.error('Order creation failed:', error?.message ?? 'No order returned');
    return jsonResponse({
      success: false,
      error: error?.message || 'تعذر حفظ الطلب في قاعدة البيانات',
    }, 400);
  }

  const row = Array.isArray(data) ? data[0] : data;
  const order = {
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

  let telegramSent = false;
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (botToken && chatId) {
    const itemLines = order.items.map((item: { name: string; quantity: number; price: number }) =>
      `• ${escapeHtml(item.name)} × ${item.quantity} — ${item.price} د.ج`
    ).join('\n');
    const message = [
      '<b>طلب جديد من المتجر</b>',
      `<b>رقم الطلب:</b> ${escapeHtml(order.orderNumber)}`,
      `<b>الاسم:</b> ${escapeHtml(order.customer.fullName)}`,
      `<b>الهاتف:</b> ${escapeHtml(order.customer.phone)}`,
      `<b>الولاية:</b> ${escapeHtml(order.customer.wilaya)}`,
      `<b>العنوان:</b> ${escapeHtml(order.customer.address)}`,
      `<b>ملاحظات:</b> ${escapeHtml(order.customer.notes || 'لا توجد')}`,
      `<b>الدفع:</b> ${order.customer.paymentMethod === 'cod' ? 'عند الاستلام' : 'بطاقة'}`,
      '<b>المنتجات:</b>',
      itemLines,
      `<b>المجموع:</b> ${order.subtotal} د.ج`,
      `<b>التوصيل:</b> ${order.shippingFee} د.ج`,
      `<b>الخصم:</b> ${order.discount} د.ج`,
      `<b>الإجمالي:</b> ${order.total} د.ج`,
    ].join('\n');

    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      });
      telegramSent = telegramResponse.ok;
      if (!telegramSent) console.error('Telegram notification failed with status:', telegramResponse.status);
    } catch (telegramError) {
      console.error('Telegram notification request failed:', telegramError);
    }
  } else {
    console.error('Telegram secrets are not configured');
  }

  return jsonResponse({ success: true, order, telegramSent }, 201);
});