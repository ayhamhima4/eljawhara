import React from 'react';
import type { Category } from '../types/store';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="w-full overflow-hidden">
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`shrink-0 flex items-center gap-1.5 font-medium text-[13px] px-4 py-2 rounded-full shadow-xs active:scale-95 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#43271a] text-white shadow-sm ring-1 ring-[#43271a]'
                  : 'bg-white text-[#1d1b19] border border-[#ede7e3] hover:bg-[#ffd9dd]/30'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive ? 'text-white' : 'text-[#9e3d50]'
                }`}
              >
                {cat.icon}
              </span>
              <span>{cat.name}</span>
              {typeof cat.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#f3ede9] text-[#50443f]'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
