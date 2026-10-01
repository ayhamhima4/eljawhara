import React from 'react';

interface PromoHeroProps {
  onCtaClick: () => void;
}

export const PromoHero: React.FC<PromoHeroProps> = ({ onCtaClick }) => {
  return (
    <section className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-l from-[#ffd9dd] via-[#f8f2ef] to-[#f3ede9] p-5 shadow-xs border border-[#ffd9dd]/60">
      <div className="relative z-10 flex flex-col items-start max-w-[65%] sm:max-w-[70%] space-y-2">
        <span className="inline-flex items-center gap-1 bg-[#9e3d50] text-white font-medium text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
          <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
          تشكيلة حصرية
        </span>
        <h2 className="text-[19px] sm:text-[22px] font-bold text-[#2d1509] leading-tight">
          قوالب السيليكون وأدوات الباتيسري الحديثة
        </h2>
        <p className="text-[12px] sm:text-[13px] text-[#50443f] leading-relaxed">
          ارتقِ بلمساتك مع قوالب الموس وأدوات التزيين الاحترافية الفرنسية
        </p>
        <button
          onClick={onCtaClick}
          className="mt-2 bg-[#43271a] text-white font-medium text-[13px] px-5 py-2 rounded-full shadow-md flex items-center gap-1.5 active:scale-95 hover:bg-[#5c3d2e] transition-all cursor-pointer"
        >
          <span>استكشف التشكيلة</span>
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        </button>
      </div>

      <div className="absolute -left-2 -bottom-2 w-36 h-36 sm:w-44 sm:h-44 opacity-95 pointer-events-none select-none">
        <img
          className="w-full h-full object-contain"
          alt="قوالب سيليكون وحلويات راقية"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDblY-W82YfmWcMMkI-Cdlx9yBv-6s_v4tj7kSMLLw18lqZWc8Z7sf6zVSX98c6vkTGLAedcCXrpV6UTSK8EsQPSqJuS4DcGbVded-a5LJw46xIwNpOvwyROPWx4K0BGjcgwMCf8RZLFSSOB3uEcqAYY7vMXSeIIYe0R1M1qXjNnHAA5LUQnP-pmipKxlTbK4WQvhbKt1Jx9eUHiqsRu-QNxZWC3tNLoCfYgX0vCZIVsHP7g600zuQ"
        />
      </div>
    </section>
  );
};
