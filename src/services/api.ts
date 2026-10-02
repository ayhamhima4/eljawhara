import type { Product, Order, Deal, Category, StoreStats } from '../types/store';

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  sort?: string;
  in_stock?: boolean;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.in_stock) query.set('in_stock', 'true');

  const res = await fetch(`/api/products?${query.toString()}`);
  if (!res.ok) throw new Error('فشل جلب المنتجات من الخادم');
  return res.json();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('فشل جلب تفاصيل المنتج');
  return res.json();
}

export async function addProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل إضافة المنتج');
  }
  return res.json();
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'فشل تحديث المنتج');
  }
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('فشل حذف المنتج');
}

export async function trackProductView(productId: string): Promise<{ viewsCount: number }> {
  try {
    const res = await fetch(`/api/products/${productId}/view`, { method: 'POST' });
    if (!res.ok) return { viewsCount: 0 };
    return res.json();
  } catch {
    return { viewsCount: 0 };
  }
}

export async function sendHeartbeat(sessionId: string): Promise<{ activeUsersCount: number }> {
  try {
    const res = await fetch('/api/analytics/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return { activeUsersCount: 1 };
    return res.json();
  } catch {
    return { activeUsersCount: 1 };
  }
}

export async function fetchExpiringProducts(): Promise<(Product & { daysUntilExpiry: number; isUrgent: boolean })[]> {
  const res = await fetch('/api/products/expiring-soon');
  if (!res.ok) throw new Error('فشل جلب المنتجات القريبة من انتهاء الصلاحية');
  return res.json();
}

export async function fetchSyncVersion(): Promise<{ version: number }> {
  const res = await fetch('/api/sync/version');
  if (!res.ok) return { version: 0 };
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('فشل جلب التصنيفات');
  return res.json();
}

export async function fetchDeal(): Promise<Deal> {
  const res = await fetch('/api/deal');
  if (!res.ok) throw new Error('فشل جلب عرض الأسبوع');
  return res.json();
}

export async function createOrder(payload: {
  customer: any;
  items: any[];
  shippingFee: number;
  discount: number;
}): Promise<{ success: boolean; message: string; order: Order }> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'فشل تأكيد الطلب');
  }
  return data;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('فشل جلب الطلبات');
  const rows = await res.json();
  return rows.map((row: any): Order => ({
    id: row.id,
    orderNumber: row.orderNumber ?? row.order_number,
    full_name: row.full_name ?? row.customer_name ?? row.customer?.fullName ?? '',
    phone: row.phone ?? row.customer?.phone ?? '',
    wilaya: row.wilaya ?? row.customer?.wilaya ?? '',
    address: row.address ?? row.customer?.address ?? '',
    notes: row.notes ?? row.customer?.notes ?? undefined,
    payment_method: row.payment_method ?? row.customer?.paymentMethod ?? 'cod',
    items: row.items,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shippingFee ?? row.shipping_fee),
    discount: Number(row.discount),
    total: Number(row.total),
    status: row.status,
    createdAt: row.createdAt ?? row.created_at,
  }));
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('فشل تحديث حالة الطلب');
  return res.json();
}

export async function fetchStats(): Promise<StoreStats> {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error('فشل جلب إحصائيات المتجر');
  return res.json();
}
