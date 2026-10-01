import React, { useState } from 'react';
import type { Product } from '../types/store';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    const ok = addToCart(product, 1);
    if (ok) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1200);
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className={`bg-white rounded-2xl p-2.5 flex flex-col justify-between shadow-xs border border-[#ede7e3] relative group hover:shadow-md hover:border-[#ffd9dd] transition-all cursor-pointer ${
        isOutOfStock ? 'opacity-85' : ''
      }`}
    >
      <div>
        {/* Product Image & Stock Badge */}
        <div className="relative w-full aspect-square rounded-xl bg-[#fef8f4] overflow-hidden mb-2">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? 'grayscale-[35%]' : ''
            }`}
            loading="lazy"
          />

          {/* Stock Availability Badge */}
          {isOutOfStock ? (
            <span className="absolute top-2 right-2 bg-[#ded9d5] text-[#50443f] font-semibold text-[11px] px-2 py-0.5 rounded-full shadow-xs">
              نفد مؤقتاً
            </span>
          ) : isLowStock ? (
            <span className="absolute top-2 right-2 bg-[#ffd9dd] text-[#802639] font-semibold text-[11px] px-2 py-0.5 rounded-full shadow-xs animate-pulse">
              باقي {product.stock} فقط
            </span>
          ) : (
            <span className="absolute top-2 right-2 bg-[#cde9dc] text-[#072018] font-semibold text-[11px] px-2 py-0.5 rounded-full shadow-xs">
              متوفر بالمخزون
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-1">
          <span
            className="material-symbols-outlined text-[15px] text-[#9e3d50]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="text-[12px] text-[#1d1b19] font-bold">{product.rating.toFixed(1)}</span>
          <span className="text-[11px] text-[#82746e]">({product.reviewsCount})</span>
        </div>

        {/* Title */}
        <h4 className="text-[13px] sm:text-[14px] text-[#1d1b19] font-medium line-clamp-2 leading-snug h-[38px] group-hover:text-[#9e3d50] transition-colors">
          {product.name}
        </h4>
      </div>

      {/* Price & Add to Cart Action */}
      <div className="mt-3 flex items-center justify-between pt-1 border-t border-[#f8f2ef]">
        <div className="flex items-baseline gap-1">
          <span className="text-[17px] font-bold text-[#43271a]">{product.price}</span>
          <span className="text-[11px] text-[#82746e]">د.ج</span>
        </div>

        {isOutOfStock ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            aria-label="نفدت الكمية"
            className="w-8 h-8 rounded-full bg-[#f3ede9] text-[#82746e] flex items-center justify-center hover:bg-[#ede7e3] transition-colors cursor-pointer"
            title="إشعار عند التوفر"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
          </button>
        ) : (
          <button
            onClick={handleAdd}
            aria-label="أضف إلى السلة"
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#43271a] text-white hover:bg-[#9e3d50]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAdded ? 'check' : 'add'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
