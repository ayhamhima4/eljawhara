import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    total,
    setIsCheckoutOpen,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const freeShippingThreshold = 300;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* Backdrop click */}
      <div
        className="fixed inset-0"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-[#fef8f4] h-full shadow-2xl flex flex-col z-10 border-s border-[#ede7e3] animate-slideIn">
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#f3ede9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#43271a]">
              shopping_bag
            </span>
            <h2 className="text-base font-bold text-[#43271a]">سلة المشتريات</h2>
            <span className="bg-[#ffd9dd] text-[#802639] text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'منتج' : 'منتجات'}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="إغلاق السلة"
            className="w-9 h-9 rounded-full bg-[#f8f2ef] hover:bg-[#ede7e3] flex items-center justify-center text-[#43271a] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Free Shipping Progress Alert */}
        {subtotal > 0 && (
          <div className="bg-[#f8f2ef] px-4 py-2.5 border-b border-[#ede7e3]">
            <div className="flex items-center justify-between text-xs font-medium text-[#43271a] mb-1.5">
              <span>
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    مبروك! لقد حصلت على توصيل مجاني!
                  </span>
                ) : (
                  <span>
                    أضف بقيمة <strong className="text-[#9e3d50]">{remainingForFreeShipping} د.ج</strong> إضافية للحصول على توصيل مجاني
                  </span>
                )}
              </span>
              <span className="font-bold text-[11px] text-[#82746e]">
                {freeShippingProgress}%
              </span>
            </div>
            <div className="w-full bg-[#ede7e3] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  remainingForFreeShipping === 0 ? 'bg-emerald-600' : 'bg-[#9e3d50]'
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#82746e]">
              <div className="w-20 h-20 rounded-full bg-[#ffd9dd]/40 flex items-center justify-center text-[#9e3d50] mb-3">
                <span className="material-symbols-outlined text-[40px]">remove_shopping_cart</span>
              </div>
              <p className="text-base font-bold text-[#43271a]">سلتك فارغة حالياً</p>
              <p className="text-xs text-[#82746e] mt-1 max-w-xs">
                استكشف قوالب السيليكون وأدوات التزيين الاحترافية وأضف ما يحلو لك
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 bg-[#43271a] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-[#5c3d2e] transition-all cursor-pointer shadow-sm"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl p-3 border border-[#ede7e3] shadow-xs flex gap-3 items-center"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-18 h-18 rounded-xl object-cover bg-[#fef8f4] shrink-0 border border-[#f3ede9]"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#1d1b19] line-clamp-1">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-1.5 my-1">
                    <span className="text-sm font-bold text-[#43271a]">
                      {item.product.price} د.ج
                    </span>
                    <span className="text-[11px] text-[#82746e]">لكل قطعة</span>
                  </div>

                  {/* Quantity & Trash */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center bg-[#f8f2ef] rounded-full border border-[#ede7e3] px-1.5 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#43271a] hover:bg-white transition-colors cursor-pointer"
                        title="إنقاص الكمية"
                      >
                        <span className="material-symbols-outlined text-[15px]">remove</span>
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-[#43271a]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[#43271a] hover:bg-white disabled:opacity-30 transition-colors cursor-pointer"
                        title="زيادة الكمية"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[#82746e] hover:text-[#ba1a1a] p-1 transition-colors cursor-pointer"
                      title="حذف المنتج"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Calculations */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-[#f3ede9] flex flex-col gap-3 shadow-lg">
            {/* Coupon Code Section */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#cde9dc]/50 border border-[#cde9dc] px-3 py-1.5 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>تم تطبيق الكوبون ({appliedCoupon})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-[#ba1a1a] hover:underline cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="كود الخصم (جرب CHEF10 أو BAKER20)"
                    className="flex-1 bg-[#f8f2ef] border border-[#ede7e3] rounded-xl px-3 py-1.5 text-xs text-[#1d1b19] outline-none focus:ring-1 focus:ring-[#9e3d50]"
                  />
                  <button
                    type="submit"
                    className="bg-[#43271a] text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#5c3d2e] transition-colors cursor-pointer"
                  >
                    تطبيق
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-[#ba1a1a] mt-1">{couponError}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-[#f3ede9]">
              <div className="flex justify-between text-[#50443f]">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{subtotal} د.ج</span>
              </div>
              <div className="flex justify-between text-[#50443f]">
                <span>تكلفة التوصيل:</span>
                <span className="font-semibold">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold">مجاني</span>
                  ) : (
                    `${shippingFee} د.ج`
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#9e3d50] font-semibold">
                  <span>خصم الكوبون:</span>
                  <span>- {discount} د.ج</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#43271a] pt-2 border-t border-[#ede7e3]">
                <span>المجموع الكلي:</span>
                <span className="text-[#9e3d50]">{total} د.ج</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-[#9e3d50] hover:bg-[#802639] active:scale-98 text-white font-bold text-sm py-3 rounded-full shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>متابعة الشراء وإتمام الطلب</span>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
