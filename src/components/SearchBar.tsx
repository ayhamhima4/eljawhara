import React, { useState } from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  inStockOnly,
  onInStockChange,
  sortBy,
  onSortChange,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 bg-white rounded-full shadow-sm border border-[#ede7e3] flex items-center px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#9e3d50]/30 transition-all">
          <span className="material-symbols-outlined text-[#82746e] text-[20px] ml-2 shrink-0">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن قوالب، أدوات تزيين، ملونات، شوكولاتة..."
            className="w-full bg-transparent text-[#1d1b19] placeholder:text-[#82746e] text-[13px] outline-none border-none font-normal"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-[#82746e] hover:text-[#43271a] p-1 mr-1"
              aria-label="مسح البحث"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          aria-label="تصفية وترتيب النتائج"
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-xs shrink-0 active:scale-95 transition-all cursor-pointer ${
            isFilterOpen || inStockOnly || sortBy !== 'newest'
              ? 'bg-[#9e3d50] text-white ring-2 ring-[#ffd9dd]'
              : 'bg-[#ffd9dd] text-[#400012] hover:bg-[#ffb2bb]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>
      </div>

      {/* Filter panel drawer */}
      {isFilterOpen && (
        <div className="mt-3 p-4 bg-white rounded-2xl shadow-lg border border-[#f3ede9] animate-fadeIn transition-all text-sm z-30">
          <div className="flex items-center justify-between pb-3 border-b border-[#f3ede9]">
            <span className="font-semibold text-[#43271a] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#9e3d50]">filter_alt</span>
              خيارات التصفية والترتيب
            </span>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-xs text-[#82746e] hover:text-[#1d1b19]"
            >
              إغلاق
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            {/* Stock filter */}
            <div className="flex items-center justify-between bg-[#fef8f4] p-3 rounded-xl border border-[#ede7e3]">
              <div className="flex flex-col">
                <span className="font-medium text-[#43271a]">المتوفر بالمخزن فقط</span>
                <span className="text-[11px] text-[#82746e]">إخفاء المنتجات التي نفدت مؤقتاً</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => onInStockChange(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e3d50]"></div>
              </label>
            </div>

            {/* Sort filter */}
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-[#43271a] text-xs">ترتيب المنتجات حسب:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'newest', label: 'الأحدث أولاً', icon: 'schedule' },
                  { id: 'rating', label: 'الأعلى تقييماً', icon: 'star' },
                  { id: 'price_asc', label: 'السعر: الأقل', icon: 'arrow_downward' },
                  { id: 'price_desc', label: 'السعر: الأعلى', icon: 'arrow_upward' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSortChange(s.id)}
                    className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      sortBy === s.id
                        ? 'bg-[#43271a] text-white'
                        : 'bg-[#f8f2ef] text-[#50443f] hover:bg-[#ede7e3]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
