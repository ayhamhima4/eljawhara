import React, { useState } from 'react';
import type { Product } from '../types/store';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addToCart(product, quantity);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
      }, 1500);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const ok = addToCart(product, quantity);
    if (ok) {
      onClose();
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#ede7e3] relative my-auto animate-scale">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-[#43271a] flex items-center justify-center shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Product Image Header */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-[#fef8f4] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <span
              className={`absolute top-4 right-4 font-bold text-xs px-3 py-1 rounded-full shadow-sm ${
                product.stock <= 0
                  ? 'bg-[#ded9d5] text-[#50443f]'
                  : product.stock <= 3
                  ? 'bg-[#ffd9dd] text-[#802639]'
                  : 'bg-[#cde9dc] text-[#072018]'
              }`}
            >
              {product.badge}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f8f2ef] text-[#9e3d50] border border-[#ffd9dd]">
                {product.categoryNameAr}
              </span>
              <div className="flex items-center gap-1 text-xs">
                <span
                  className="material-symbols-outlined text-[16px] text-[#9e3d50]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-bold text-[#1d1b19]">{product.rating.toFixed(1)}</span>
                <span className="text-[#82746e]">({product.reviewsCount} تقييم حقيقي)</span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[#43271a] leading-snug">
              {product.name}
            </h3>
            {product.nameEn && (
              <p className="text-xs text-[#82746e] font-sans mt-0.5" dir="ltr">
                {product.nameEn}
              </p>
            )}

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-[#43271a]">{product.price}</span>
              <span className="text-sm font-semibold text-[#82746e]">دينار جزائري (د.ج)</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#fef8f4] p-3.5 rounded-2xl border border-[#ede7e3]">
            <h4 className="text-xs font-bold text-[#43271a] mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#9e3d50]">info</span>
              الوصف والمواصفات التفصيلية
            </h4>
            <p className="text-xs sm:text-sm text-[#50443f] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Technical Specs List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {product.specs.material && (
              <div className="bg-white p-2.5 rounded-xl border border-[#ede7e3] flex flex-col">
                <span className="text-[#82746e]">الخامة والمادة المصنوعة:</span>
                <span className="font-semibold text-[#1d1b19] mt-0.5">{product.specs.material}</span>
              </div>
            )}
            {product.specs.temperatureRange && (
              <div className="bg-white p-2.5 rounded-xl border border-[#ede7e3] flex flex-col">
                <span className="text-[#82746e]">تحمل درجات الحرارة:</span>
                <span className="font-semibold text-[#1d1b19] mt-0.5" dir="ltr">
                  {product.specs.temperatureRange}
                </span>
              </div>
            )}
            {product.specs.dimensions && (
              <div className="bg-white p-2.5 rounded-xl border border-[#ede7e3] flex flex-col">
                <span className="text-[#82746e]">المقاس والأبعاد:</span>
                <span className="font-semibold text-[#1d1b19] mt-0.5">{product.specs.dimensions}</span>
              </div>
            )}
            {product.specs.piecesCount && (
              <div className="bg-white p-2.5 rounded-xl border border-[#ede7e3] flex flex-col">
                <span className="text-[#82746e]">محتوى العبوة:</span>
                <span className="font-semibold text-[#1d1b19] mt-0.5">{product.specs.piecesCount}</span>
              </div>
            )}
          </div>

          {/* Safety & Food Grade Guarantee */}
          {product.expiryDate && (
            <div className="flex items-center justify-between bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                <span className="material-symbols-outlined text-[18px] text-amber-700">event_available</span>
                <span>تاريخ انتهاء الصلاحية المعتمد:</span>
              </div>
              <span className="font-bold font-mono text-amber-950 text-xs" dir="ltr">
                {product.expiryDate}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5 bg-[#cde9dc]/40 p-2.5 rounded-xl border border-[#cde9dc]">
            <span className="material-symbols-outlined text-[20px] text-[#072018]">verified</span>
            <div className="text-xs text-[#072018]">
              <span className="font-bold">ضمان الجودة الغذائية 100%:</span> خالٍ تماماً من مادة BPA ومصرح للاستخدام مع المخبوزات والحلويات الساخنة والباردة.
            </div>
          </div>

          {/* Stock inventory note */}
          <div className="text-xs flex items-center justify-between text-[#82746e] pt-1">
            <span>حالة المخزون الفعلي:</span>
            <span className={`font-bold ${product.stock <= 3 ? 'text-[#ba1a1a]' : 'text-emerald-700'}`}>
              {product.stock > 0 ? `${product.stock} قطعة متبقية بالمستودع` : 'الكمية غير متوفرة حالياً'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#f8f2ef] border-t border-[#ede7e3] flex flex-col sm:flex-row items-center gap-3">
          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center bg-white rounded-full border border-[#ede7e3] px-2 py-1 shadow-xs">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#43271a] hover:bg-[#f3ede9] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="w-10 text-center font-bold text-sm text-[#43271a]">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.stock}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#43271a] hover:bg-[#f3ede9] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full flex-1">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full bg-[#ded9d5] text-[#50443f] font-semibold text-sm py-3 rounded-full flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">notifications</span>
                <span>نفد من المخزون حالياً</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 font-semibold text-sm py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#9e3d50] hover:bg-[#802639] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {justAdded ? 'check' : 'shopping_bag'}
                  </span>
                  <span>{justAdded ? 'تمت الإضافة' : `أضف للسلة (${product.price * quantity} د.ج)`}</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-[#43271a] hover:bg-[#2d1509] text-white font-semibold text-sm py-2.5 px-4 rounded-full active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  شراء فوري
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
