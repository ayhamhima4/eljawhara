import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { fetchAdminOrders, updateAdminOrderStatus } from '../services/orders';
import type { Product, Order, OrderStatus, StoreStats } from '../types/store';
import type { Session } from '@supabase/supabase-js';
import {
  fetchProducts,
  fetchStats,
  updateProduct,
  addProduct,
  deleteProduct,
} from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const isAdmin = session?.user.app_metadata?.role === 'admin';

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('silicone-molds');
  const [newProdPrice, setNewProdPrice] = useState(80);
  const [newProdStock, setNewProdStock] = useState(15);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResult, ordersResult, statsResult] = await Promise.allSettled([
        fetchProducts(),
        fetchAdminOrders(),
        fetchStats(),
      ]);
      if (productsResult.status === 'fulfilled') setProducts(productsResult.value);
      else console.error('Failed to load admin products', productsResult.reason);
      if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value);
      else console.error('Failed to load admin orders', ordersResult.reason);
      if (statsResult.status === 'fulfilled') setStats(statsResult.value);
      else console.error('Failed to load admin stats', statsResult.reason);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    loadData();
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchAdminOrders().then(setOrders).catch((error) => {
          console.error('Failed to refresh admin orders', error);
        });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authLoading, isAdmin]);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleUpdateStock = async (prodId: string, delta: number) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    try {
      const updated = await updateProduct(prodId, { stock: newStock });
      setProducts((prev) => prev.map((p) => (p.id === prodId ? updated : p)));
      notify(`تم تحديث مخزون "${prod.name}" إلى ${newStock}`);
      // Refresh stats
      const s = await fetchStats();
      setStats(s);
    } catch (err: any) {
      notify(err.message || 'فشل التحديث');
    }
  };

  const handleDeleteProduct = async (prodId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف منتج "${name}" نهائياً من قاعدة البيانات؟`)) return;
    try {
      await deleteProduct(prodId);
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
      notify(`تم حذف "${name}" بنجاح`);
      const s = await fetchStats();
      setStats(s);
    } catch (err: any) {
      notify(err.message || 'فشل الحذف');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updated = await updateAdminOrderStatus(orderId, newStatus as OrderStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      notify(`تم تحديث حالة الطلب ${updated.orderNumber} بنجاح`);
    } catch (err: any) {
      notify(err.message || 'فشل تحديث الحالة');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    try {
      const categoryNames: Record<Product['category'], string> = {
        'silicone-molds': 'قوالب سيليكون',
        'decorating-tools': 'أدوات التزيين',
        'baking-pans': 'صواني وقوالب قاطو',
        'chocolate-colors': 'شوكولاتة وملونات',
        packaging: 'التغليف والعلب',
      };

      const created = await addProduct({
        name: newProdName.trim(),
        category: newProdCategory,
        categoryNameAr: categoryNames[newProdCategory],
        price: Number(newProdPrice),
        stock: Number(newProdStock),
        description: newProdDesc.trim() || 'منتج عالي الجودة ومناسب لتحضير وتزيين أشهى الحلويات والكعك.',
        image:
          newProdImage.trim() ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDAHBS5UrLFS7t6XXqwAgcybLVkcRYHpPmYXsKkGdjBAwHn8gDgHMGEDFEJ7H7rWQRk294sFjIFOBgcS5QciRT7gx3m72OdsTeKi0B_g05LSJJDcONlxURvBPVtHNwRXZivR4WRXNVBZwCTFSrzaoEMT5QHEw6pYfCHZq8ANEBta3mrQ9wQhXXVYrKns_j9cBOHdZvSYnkcyKPAAgxsFDo4EGPYCbYpoZpr3dn2E_GTlizQ_DnZJ3c',
        rating: 5.0,
        reviewsCount: 1,
        specs: {
          material: 'مواد مطابقة للمواصفات الغذائية وخالية من BPA',
          foodGradeCertified: true,
        },
      });

      setProducts((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewProdName('');
      setNewProdDesc('');
      setNewProdImage('');
      notify('تمت إضافة المنتج الجديد إلى المتجر بنجاح!');
      const s = await fetchStats();
      setStats(s);
    } catch (err: any) {
      notify(err.message || 'فشل إضافة المنتج');
    }
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    if (error) setAuthError('تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.');
  };

  if (authLoading) {
    return <div className="py-12 text-center text-sm text-[#82746e]">جارٍ التحقق من صلاحية الإدارة...</div>;
  }

  if (!session) {
    return (
      <div className="max-w-sm mx-auto mt-12 bg-white p-6 rounded-2xl border border-[#ede7e3]">
        <h2 className="text-lg font-bold text-[#43271a] mb-4">دخول لوحة الإدارة</h2>
        <form onSubmit={handleSignIn} className="space-y-3">
          {authError && <p className="text-xs text-red-700">{authError}</p>}
          <input
            type="email"
            required
            autoComplete="username"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="البريد الإلكتروني الإداري"
            className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#9e3d50]"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="كلمة المرور"
            className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#9e3d50]"
          />
          <button className="w-full bg-[#43271a] text-white font-bold text-sm py-2.5 rounded-xl">
            تسجيل الدخول
          </button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-2xl border border-[#ede7e3] text-center">
        <p className="text-sm font-semibold text-[#43271a]">هذا الحساب لا يملك صلاحية الإدارة.</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-4 bg-[#43271a] text-white text-xs font-semibold px-4 py-2 rounded-full"
        >
          تسجيل الخروج
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="bg-[#43271a] text-white text-xs px-4 py-3 rounded-2xl shadow-lg border border-[#ffd9dd] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#ffd9dd]">
              check_circle
            </span>
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Dashboard Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-[#ede7e3] shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#43271a] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#43271a]">لوحة التحكم وإدارة المتجر</h2>
            <p className="text-[11px] text-[#82746e]">
              إدارة المخزون الفعلي، الأسعار، وطلبات التوصيل المباشرة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-[#f8f2ef] text-[#43271a] text-xs font-semibold px-3 py-2 rounded-full"
          >
            تسجيل الخروج
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#9e3d50] hover:bg-[#802639] text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>إضافة منتج جديد</span>
          </button>

          <button
            onClick={loadData}
            title="تحديث البيانات"
            className="w-9 h-9 rounded-full bg-[#f8f2ef] hover:bg-[#ede7e3] text-[#43271a] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3 rounded-2xl border border-[#ede7e3] shadow-xs flex flex-col">
            <span className="text-[11px] text-[#82746e] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">payments</span>
              إجمالي المبيعات
            </span>
            <span className="text-lg font-bold text-[#43271a] mt-1 font-mono">
              {stats.totalSales} <span className="text-xs font-normal text-[#82746e]">د.ج</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#ede7e3] shadow-xs flex flex-col">
            <span className="text-[11px] text-[#82746e] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#9e3d50]">receipt</span>
              إجمالي الطلبات
            </span>
            <span className="text-lg font-bold text-[#43271a] mt-1 font-mono">
              {stats.totalOrders}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#ede7e3] shadow-xs flex flex-col">
            <span className="text-[11px] text-[#82746e] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-amber-600">warning</span>
              مخزون منخفض (≤3)
            </span>
            <span className="text-lg font-bold text-amber-700 mt-1 font-mono">
              {stats.lowStockCount}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#ede7e3] shadow-xs flex flex-col">
            <span className="text-[11px] text-[#82746e] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-red-600">block</span>
              منتجات نفدت
            </span>
            <span className="text-lg font-bold text-red-700 mt-1 font-mono">
              {stats.outOfStockCount}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 border border-[#ede7e3]">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'bg-[#43271a] text-white shadow-xs'
              : 'text-[#50443f] hover:bg-[#f8f2ef]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          <span>إدارة المنتجات والمخزون ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'orders'
              ? 'bg-[#43271a] text-white shadow-xs'
              : 'text-[#50443f] hover:bg-[#f8f2ef]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">local_shipping</span>
          <span>إدارة وحالات الطلبيات ({orders.length})</span>
        </button>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-2.5">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white p-3 rounded-2xl border border-[#ede7e3] shadow-xs flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-14 h-14 rounded-xl object-cover bg-[#fef8f4] shrink-0 border border-[#f3ede9]"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#1d1b19] truncate">{prod.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#82746e]">
                    <span>{prod.categoryNameAr}</span>
                    <span>•</span>
                    <span className="font-bold text-[#43271a]">{prod.price} د.ج</span>
                  </div>
                </div>
              </div>

              {/* Stock Controls */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1 bg-[#f8f2ef] px-2 py-1 rounded-full border border-[#ede7e3]">
                  <span className="text-[11px] text-[#82746e] ml-1">المخزون:</span>
                  <button
                    onClick={() => handleUpdateStock(prod.id, -1)}
                    disabled={prod.stock <= 0}
                    className="w-6 h-6 rounded-full bg-white text-[#43271a] flex items-center justify-center hover:bg-[#ffd9dd] disabled:opacity-30 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span
                    className={`w-7 text-center font-bold text-xs ${
                      prod.stock === 0 ? 'text-red-600' : prod.stock <= 3 ? 'text-amber-700' : 'text-[#43271a]'
                    }`}
                  >
                    {prod.stock}
                  </span>
                  <button
                    onClick={() => handleUpdateStock(prod.id, 1)}
                    className="w-6 h-6 rounded-full bg-white text-[#43271a] flex items-center justify-center hover:bg-[#cde9dc] text-xs font-bold shadow-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                  title="حذف المنتج"
                  className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-xs text-[#82746e]">
              لا توجد طلبيات حتى الآن
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="bg-white p-4 rounded-2xl border border-[#ede7e3] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#43271a]">
                      {o.orderNumber || o.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px] text-[#82746e] mr-2">
                      {o.full_name} ({o.phone})
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#9e3d50]">{o.total} د.ج</span>
                </div>

                <div className="text-xs text-[#50443f] bg-[#fef8f4] p-2.5 rounded-xl border border-[#f3ede9]">
                  <p><strong>العنوان:</strong> {o.wilaya} - {o.address}</p>
                  {o.notes && <p className="text-[11px] text-[#82746e] mt-0.5"><strong>ملاحظة:</strong> {o.notes}</p>}
                  <ul className="mt-2 space-y-1">
                    {Array.isArray(o.items) && o.items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between gap-2">
                        <span>{item.name || item.productName} × {item.quantity}</span>
                        <span className="shrink-0">{(item.price || 0) * (item.quantity || 1)} د.ج</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status selector */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-[#82746e]">تغيير حالة الشحن:</span>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="bg-[#f8f2ef] border border-[#ede7e3] rounded-xl px-3 py-1.5 text-xs text-[#1d1b19] font-medium outline-none focus:ring-1 focus:ring-[#9e3d50]"
                  >
                    <option value="pending">قيد المعالجة</option>
                    <option value="processing">جاري التجهيز</option>
                    <option value="shipped">تم الشحن مع المندوب</option>
                    <option value="delivered">تم التسليم بنجاح</option>
                    <option value="cancelled">إلغاء الطلب</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#ede7e3] overflow-hidden my-auto p-5 animate-scale">
            <div className="flex items-center justify-between pb-3 border-b border-[#f3ede9]">
              <h3 className="font-bold text-sm text-[#43271a]">إضافة منتج جديد للمتجر</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-[#f8f2ef] flex items-center justify-center text-[#43271a]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-[#50443f] font-medium mb-1">اسم المنتج</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="مثال: قالب سيليكون هارت ميني كيك"
                  className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#9e3d50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#50443f] font-medium mb-1">التصنيف</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-2 py-2 outline-none focus:ring-1 focus:ring-[#9e3d50]"
                  >
                    <option value="silicone-molds">قوالب سيليكون</option>
                    <option value="decorating-tools">أدوات التزيين</option>
                    <option value="baking-pans">صواني وقوالب قاطو</option>
                    <option value="chocolate-colors">شوكولاتة وملونات</option>
                    <option value="packaging">التغليف والعلب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#50443f] font-medium mb-1">السعر (د.ج)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#9e3d50]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#50443f] font-medium mb-1">الكمية بالمخزن</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#9e3d50]"
                  />
                </div>

                <div>
                  <label className="block text-[#50443f] font-medium mb-1">رابط صورة المنتج</label>
                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    placeholder="رابط URL للصورة (اختياري)"
                    className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#9e3d50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#50443f] font-medium mb-1">الوصف والمميزات</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="وصف تفصيلي للمنتج وخاماته..."
                  className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#9e3d50]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#43271a] hover:bg-[#2d1509] text-white font-bold py-2.5 rounded-full transition-all cursor-pointer mt-2"
              >
                حفظ وإضافة المنتج للمتجر
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
