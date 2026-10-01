import React, { useState } from 'react';
import type { Order } from '../types/store';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#ede7e3] overflow-hidden my-auto p-6 text-center animate-scale">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>

        <h3 className="text-xl font-bold text-[#43271a] mb-1">تم تأكيد طلبك بنجاح!</h3>
        <p className="text-xs text-[#50443f] max-w-xs mx-auto">
          شكراً لطلبك من متجر فنون الحلويات، تم تسجيل طلبك وسيتصل بك مندوب التوصيل لتأكيد الشحن.
        </p>

        {/* Order Number Badge */}
        <div className="my-4 bg-[#f8f2ef] p-3 rounded-2xl border border-[#ede7e3] flex flex-col items-center">
          <span className="text-[11px] text-[#82746e]">رقم الطلب الخاص بك:</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-[#9e3d50] font-mono tracking-wider">
              {order.orderNumber}
            </span>
            <button
              onClick={handleCopyCode}
              title="نسخ رقم الطلب"
              className="p-1 hover:bg-white rounded-md text-[#82746e] hover:text-[#43271a] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'done' : 'content_copy'}
              </span>
            </button>
          </div>
          {copied && (
            <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
              تم نسخ رقم الطلب
            </span>
          )}
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 font-medium">
            حالة الطلب: قيد التجهيز (تم حجز المنتجات)
          </span>
        </div>

        {/* Details preview */}
        <div className="bg-[#fef8f4] p-3 rounded-2xl border border-[#f3ede9] text-xs space-y-1 text-right mb-5">
          <div className="flex justify-between text-[#82746e]">
            <span>المستلم:</span>
            <span className="font-semibold text-[#1d1b19]">{order.customer.fullName}</span>
          </div>
          <div className="flex justify-between text-[#82746e]">
            <span>الولاية:</span>
            <span className="font-semibold text-[#1d1b19]">{order.customer.wilaya}</span>
          </div>
          <div className="flex justify-between text-[#82746e]">
            <span>طريقة الدفع:</span>
            <span className="font-semibold text-[#1d1b19]">
              {order.customer.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة بنكية'}
            </span>
          </div>
          <div className="flex justify-between text-[#82746e] pt-1 border-t border-[#ede7e3]">
            <span className="font-bold text-[#43271a]">المبلغ الإجمالي:</span>
            <span className="font-bold text-[#9e3d50] text-sm">{order.total} د.ج</span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onClose}
          className="w-full bg-[#43271a] hover:bg-[#5c3d2e] text-white font-bold text-xs py-3 rounded-full shadow-sm transition-all cursor-pointer"
        >
          متابعة التسوق في المتجر
        </button>
      </div>
    </div>
  );
};
