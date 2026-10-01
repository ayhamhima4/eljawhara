import React from 'react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <header className="fixed top-0 w-full z-40 bg-[#fef8f4]/90 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(92,61,46,0.06)] border-b border-[#f3ede9]">
      <div className="max-w-4xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#ffd9dd] shrink-0 bg-[#ffd9dd]/30 flex items-center justify-center shadow-xs">
            <img
              alt="فنون الحلويات"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0KpzKcncotq32OF2gXVTnF3V5GijjSpjE_ZEbBdn2HEa3wCKh9KbI35ZKLTxW3qAquOYNllztBlb-lGffI53lIDHUTNCi_tK5Vdgxl5Fg9_vrYwiTmWkf6zLFa-2FtNESymCNs1aoDrOIeo-2wzMAAdMvOyU924A9OfHntNSDM9aGDRtWeZorLueKRAuUMlWvio1cPtiPX4g9ds94CkItpJ97AP0ipZviSmGIq6rNVP6oRBS0GcM"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[15px] font-bold text-[#43271a] truncate leading-tight tracking-tight">
              فنون الحلويات <span className="text-[12px] font-normal text-[#9e3d50] opacity-90 hidden sm:inline">- Baking & Pastry</span>
            </span>
            <span className="text-[11px] font-medium text-[#82746e] truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              المتجر المعتمد لمستلزمات القاطو والكعك
            </span>
          </div>
        </div>

        {/* Action icons: Cart Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="سلة المشتريات"
            className="w-11 h-11 rounded-full flex items-center justify-center text-[#43271a] relative bg-[#f8f2ef] hover:bg-[#ffd9dd] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 bg-[#9e3d50] text-white rounded-full text-[11px] font-bold flex items-center justify-center leading-none shadow-sm animate-scale">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
