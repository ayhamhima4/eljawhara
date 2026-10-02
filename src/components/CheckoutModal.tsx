import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';
import type { Order } from '../types/store';

const ALGERIA_WILAYAS = [
  '01 - أدرار', '02 - الشلف', '03 - الأغواط', '04 - أم البواقي', '05 - باتنة',
  '06 - بجاية', '07 - بسكرة', '08 - بشار', '09 - البليدة', '10 - البويرة',
  '11 - تمنراست', '12 - تبسة', '13 - تلمسان', '14 - تيارت', '15 - تيزي وزو',
  '16 - الجزائر العاصمة', '17 - الجلفة', '18 - جيجل', '19 - سطيف', '20 - سعيدة',
  '21 - سكيكدة', '22 - سيدي بلعباس', '23 - عنابة', '24 - قالمة', '25 - قسنطينة',
  '26 - المدية', '27 - مستغانم', '28 - المسيلة', '29 - معسكر', '30 - ورقلة',
  '31 - وهران', '32 - البيض', '33 - إليزي', '34 - برج بوعريريج', '35 - بومرداس',
  '36 - الطارف', '37 - تندوف', '38 - تيسمسيلت', '39 - الوادي', '40 - خنشلة',
  '41 - سوق أهراس', '42 - تيبازة', '43 - ميلة', '44 - عين الدفلى', '45 - النعامة',
  '46 - عين تموشنت', '47 - غرداية', '48 - غليزان', '49 - تيميمون', '50 - برج باجي مختار',
  '51 - أولاد جلال', '52 - بني عباس', '53 - عين صالح', '54 - عين قزام', '55 - توقرت',
  '56 - جانت', '57 - المغير', '58 - المنيعة'
];

interface CheckoutModalProps {
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onOrderSuccess }) => {
  const {
    items,
    isCheckoutOpen,
    setIsCheckoutOpen,
    subtotal,
    shippingFee,
    discount,
    total,
    clearCart,
  } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('16 - الجزائر العاصمة');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'edahabia'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('يرجى إدخال الاسم واللقب الكامل');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف صحيح لتأكيد التوصيل');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('يرجى كتابة عنوان التوصيل بالتفصيل (البلدية والحي)');
      return;
    }

    try {
      setIsSubmitting(true);

      if (items.length === 0) {
        throw new Error('سلة التسوق فارغة');
      }

      const createdAt = new Date().toISOString();
      const orderNumber = `BK-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
      const orderItems = items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        }));
      const order: Order = {
        id: crypto.randomUUID(),
        orderNumber,
        full_name: fullName.trim(),
        phone: phone.trim(),
        wilaya,
        address: address.trim(),
        notes: notes.trim(),
        payment_method: paymentMethod,
        items: orderItems,
        subtotal,
        shippingFee,
        discount,
        total,
        status: 'pending',
        createdAt,
      };

      const { error } = await supabase.from('orders').insert({
        order_number: order.orderNumber,
        full_name: order.full_name,
        phone: order.phone,
        wilaya: order.wilaya,
        address: order.address,
        notes: order.notes || null,
        payment_method: order.payment_method,
        items: orderItems,
        subtotal: order.subtotal,
        shipping_fee: order.shippingFee,
        discount: order.discount,
        total: order.total,
        status: order.status,
        created_at: order.createdAt,
      });
      if (error) throw new Error(error.message || 'تعذر حفظ الطلب في قاعدة البيانات');

      clearCart();
      setIsCheckoutOpen(false);
      onOrderSuccess(order);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'حدث خطأ أثناء تأكيد الطلب، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#ede7e3] overflow-hidden my-auto animate-scale">
        {/* Modal Header */}
        <div className="p-4 bg-[#f8f2ef] border-b border-[#ede7e3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#9e3d50]">
              local_shipping
            </span>
            <h3 className="font-bold text-[#43271a] text-base">إتمام طلب الشراء والتوصيل</h3>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            disabled={isSubmitting}
            aria-label="إغلاق"
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#43271a] hover:bg-[#ede7e3] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#43271a] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#9e3d50]">person</span>
              بيانات المستلم وعنوان الشحن
            </h4>

            <div>
              <label className="block text-xs font-medium text-[#50443f] mb-1">
                الاسم واللقب الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: ياسمين بلقاسم"
                className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 text-xs text-[#1d1b19] outline-none focus:ring-1 focus:ring-[#9e3d50]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#50443f] mb-1">
                  رقم الهاتف (للاتصال والتأكيد) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05 / 06 / 07 XX XX XX XX"
                  className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 text-xs text-[#1d1b19] outline-none focus:ring-1 focus:ring-[#9e3d50] text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#50443f] mb-1">
                  الولاية <span className="text-red-500">*</span>
                </label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 text-xs text-[#1d1b19] outline-none focus:ring-1 focus:ring-[#9e3d50]"
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#50443f] mb-1">
                العنوان التفصيلي (البلدية، اسم الحي، رقم المنزل) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: بلدية الأبيار، حي النخيل، عمارة ب رقم 5"
                className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 text-xs text-[#1d1b19] outline-none focus:ring-1 focus:ring-[#9e3d50]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#50443f] mb-1">
                ملاحظات للتوصيل (اختياري)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يرجى التوصيل في الفترة المسائية"
                className="w-full bg-[#fef8f4] border border-[#ede7e3] rounded-xl px-3 py-2 text-xs text-[#1d1b19] outline-none focus:ring-1 focus:ring-[#9e3d50]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-[#f3ede9]">
            <h4 className="text-xs font-bold text-[#43271a] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#9e3d50]">payments</span>
              طريقة الدفع
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#9e3d50] bg-[#ffd9dd]/30 text-[#43271a]'
                    : 'border-[#ede7e3] bg-white text-[#50443f]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">الدفع عند الاستلام</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#9e3d50]"
                  />
                </div>
                <span className="text-[11px] text-[#82746e]">
                  ادفع نقداً لعامل التوصيل عند استلام الطلبية
                </span>
              </label>

              <label
                className={`p-3 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  paymentMethod === 'edahabia'
                    ? 'border-[#9e3d50] bg-[#ffd9dd]/30 text-[#43271a]'
                    : 'border-[#ede7e3] bg-white text-[#50443f]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">بطاقة الذهبية / CIB</span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'edahabia'}
                    onChange={() => setPaymentMethod('edahabia')}
                    className="accent-[#9e3d50]"
                  />
                </div>
                <span className="text-[11px] text-[#82746e]">
                  دفع إلكتروني آمن وسريع عبر البطاقة البنكية
                </span>
              </label>
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="bg-[#fef8f4] p-3 rounded-2xl border border-[#ede7e3] text-xs space-y-1.5">
            <span className="font-bold text-[#43271a] block mb-1">ملخص الطلب:</span>
            <div className="flex justify-between text-[#50443f]">
              <span>عدد المنتجات:</span>
              <span className="font-semibold">{items.length} منتجات</span>
            </div>
            <div className="flex justify-between text-[#50443f]">
              <span>المجموع الفرعي:</span>
              <span className="font-semibold">{subtotal} د.ج</span>
            </div>
            <div className="flex justify-between text-[#50443f]">
              <span>الشحن والتوصيل ({wilaya.split('-')[1]?.trim() || wilaya}):</span>
              <span className="font-semibold">
                {shippingFee === 0 ? 'مجاني' : `${shippingFee} د.ج`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#9e3d50] font-semibold">
                <span>الخصم المطبق:</span>
                <span>- {discount} د.ج</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[#43271a] pt-1.5 border-t border-[#ede7e3]">
              <span>الإجمالي المستحق:</span>
              <span className="text-[#9e3d50]">{total} د.ج</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#9e3d50] hover:bg-[#802639] active:scale-98 text-white font-bold text-sm py-3 rounded-full shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>جاري تسجيل طلبك وخصم المخزون...</span>
              </>
            ) : (
              <>
                <span>تأكيد الطلب الآن ({total} د.ج)</span>
                <span className="material-symbols-outlined text-[18px]">done_all</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
