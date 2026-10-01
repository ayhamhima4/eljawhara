import React, { useState, useEffect } from 'react';
import type { Deal } from '../types/store';
import { useCart } from '../context/CartContext';

interface FlashDealProps {
  deal: Deal;
  onViewProduct?: (productId: string) => void;
}

export const FlashDeal: React.FC<FlashDealProps> = ({ deal, onViewProduct }) => {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 14,
    minutes: 22,
    seconds: 5,
  });
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  const handleAddBundle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = addToCart(deal.bundleProduct, 1);
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  return (
    <section className="bg-[#f8f2ef] rounded-2xl p-4 shadow-xs border border-[#ede7e3] relative overflow-hidden flex flex-col gap-3">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#ffd9dd] flex items-center justify-center text-[#9e3d50]">
            <span className="material-symbols-outlined text-[20px]">timer</span>
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#43271a] leading-tight">{deal.title}</h3>
            <p className="text-[12px] text-[#50443f]">{deal.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-xs border border-[#ffd9dd]">
          <span className="material-symbols-outlined text-[15px] text-[#9e3d50] animate-pulse">
            alarm
          </span>
          <span className="text-[13px] text-[#9e3d50] font-bold tracking-wider font-mono">
            {formatDigit(timeLeft.hours)}:{formatDigit(timeLeft.minutes)}:
            {formatDigit(timeLeft.seconds)}
          </span>
        </div>
      </div>

      {/* Bundle Card */}
      <div
        onClick={() => onViewProduct && onViewProduct(deal.bundleProduct.id)}
        className="bg-white rounded-xl p-3 flex gap-3 items-center shadow-xs border border-[#f3ede9] hover:border-[#ffd9dd] transition-all cursor-pointer group"
      >
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#fef8f4] shrink-0 border border-[#ede7e3] group-hover:scale-105 transition-transform">
          <img
            className="w-full h-full object-cover"
            alt={deal.bundleProduct.name}
            src={deal.bundleProduct.image}
          />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[13px] text-[#1d1b19] font-bold truncate">
            {deal.bundleProduct.name}
          </span>
          <div className="flex items-center justify-between my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[18px] text-[#43271a] font-bold">{deal.discountedPrice}</span>
              <span className="text-[11px] text-[#82746e]">د.ج</span>
              <span className="text-[12px] text-[#82746e] line-through mr-1 opacity-70">
                {deal.originalPrice} د.ج
              </span>
            </div>
            <button
              onClick={handleAddBundle}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#9e3d50] hover:bg-[#802639] text-white active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isAdded ? 'check' : 'add_shopping_cart'}
              </span>
              <span>{isAdded ? 'تمت الإضافة' : 'طلب العرض'}</span>
            </button>
          </div>
          <div className="w-full bg-[#ede7e3] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#9e3d50] h-full rounded-full transition-all duration-500"
              style={{ width: `${deal.reservedPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-[#9e3d50] font-medium mt-1">
            تم حجز {deal.reservedPercent}% من الكمية المتوفرة لهذا الأسبوع
          </span>
        </div>
      </div>
    </section>
  );
};
