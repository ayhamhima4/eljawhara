import React, { useState, useEffect } from 'react';
import type { Order } from '../types/store';
import { fetchOrders } from '../services/api';

export const OrdersTracker: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (!searchCode.trim()) return true;
    const q = searchCode.trim().toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.full_name.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'قيد المعالجة', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'processing':
        return { label: 'جاري التجهيز', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'shipped':
        return { label: 'تم الشحن مع المندوب', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'delivered':
        return { label: 'تم التسليم بنجاح', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'cancelled':
        return { label: 'ملغي', color: 'bg-red-100 text-red-800 border-red-200' };
    }
  };

  const getStepProgress = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#ede7e3] shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#ffd9dd] flex items-center justify-center text-[#9e3d50]">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#43271a]">تتبع ومتابعة الطلبات</h2>
            <p className="text-[11px] text-[#82746e]">
              تتبع مسار شحنتك وحالة التوصيل بالرقم التعريفي
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            type="search"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="ابحث برقم الطلب (مثلاً: BK-2026-8812) أو برقم الهاتف..."
            className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-full px-4 py-2.5 text-xs text-[#1d1b19] outline-none focus:ring-1 focus:ring-[#9e3d50]"
          />
          <button
            onClick={loadOrders}
            className="absolute left-2 top-2 p-1 text-[#82746e] hover:text-[#43271a]"
            title="تحديث البيانات"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-[#82746e]">
          <span className="material-symbols-outlined text-[32px] animate-spin text-[#9e3d50]">
            progress_activity
          </span>
          <p className="text-xs mt-2">جاري جلب سجل الطلبات من قاعدة البيانات...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-[#ede7e3] text-center text-[#82746e]">
          <span className="material-symbols-outlined text-[40px] text-[#9e3d50]/60 mb-2">
            inventory_2
          </span>
          <p className="text-sm font-bold text-[#43271a]">لا توجد طلبات مطابقة</p>
          <p className="text-xs text-[#82746e] mt-1">
            لم يتم العثور على أي طلب برقم التتبع المدخل حالياً.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const step = getStepProgress(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-[#ede7e3] shadow-xs space-y-3"
              >
                {/* Top info */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#f3ede9]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#43271a]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#82746e]">
                    {new Date(order.createdAt).toLocaleDateString('ar-DZ', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Progress Stepper */}
                <div className="py-1">
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                    {[
                      { num: 1, title: 'تم الاستلام' },
                      { num: 2, title: 'التجهيز' },
                      { num: 3, title: 'الشحن' },
                      { num: 4, title: 'التسليم' },
                    ].map((s) => (
                      <div key={s.num} className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] mb-1 transition-colors ${
                            step >= s.num
                              ? 'bg-[#9e3d50] text-white'
                              : 'bg-[#f3ede9] text-[#82746e]'
                          }`}
                        >
                          {step > s.num ? '✓' : s.num}
                        </div>
                        <span
                          className={`font-medium ${
                            step >= s.num ? 'text-[#43271a]' : 'text-[#82746e]'
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-[#fef8f4] p-2.5 rounded-xl border border-[#f3ede9] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#82746e] block">
                    محتويات الشحنة:
                  </span>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-[#1d1b19]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9e3d50]"></span>
                        <span className="truncate">{item.name}</span>
                        <span className="text-[#82746e] font-mono">× {item.quantity}</span>
                      </div>
                      <span className="font-semibold shrink-0">
                        {item.price * item.quantity} د.ج
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recipient summary */}
                <div className="flex items-center justify-between text-xs text-[#50443f] pt-1">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#9e3d50]">
                      pin_drop
                    </span>
                    <span>{order.full_name} ({order.wilaya})</span>
                  </div>
                  <div className="font-bold text-sm text-[#9e3d50]">
                    الإجمالي: {order.total} د.ج
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
