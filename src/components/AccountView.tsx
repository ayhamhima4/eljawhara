import React from 'react';

export const AccountView: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Brand Profile Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#ede7e3] shadow-xs text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#ffd9dd] mb-3 shadow-sm">
          <img
            alt="فنون الحلويات"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0KpzKcncotq32OF2gXVTnF3V5GijjSpjE_ZEbBdn2HEa3wCKh9KbI35ZKLTxW3qAquOYNllztBlb-lGffI53lIDHUTNCi_tK5Vdgxl5Fg9_vrYwiTmWkf6zLFa-2FtNESymCNs1aoDrOIeo-2wzMAAdMvOyU924A9OfHntNSDM9aGDRtWeZorLueKRAuUMlWvio1cPtiPX4g9ds94CkItpJ97AP0ipZviSmGIq6rNVP6oRBS0GcM"
          />
        </div>
        <h2 className="text-lg font-bold text-[#43271a]">فنون الحلويات - Baking & Pastry</h2>
        <p className="text-xs text-[#82746e] mt-1 max-w-sm">
          المتجر الأول المتخصص في استيراد وتوفير مستلزمات صناعة الكعك، قوالب السيليكون الحديثة، وأدوات الباتيسري الراقية في الجزائر.
        </p>

        <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
          <span className="bg-[#cde9dc] text-[#072018] px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            متجر موثق ومعتمد
          </span>
          <span className="bg-[#ffd9dd] text-[#802639] px-3 py-1 rounded-full">
            توصيل لـ 58 ولاية
          </span>
        </div>
      </div>

      {/* Guarantees & Quality Commitment */}
      <div className="bg-white p-4 rounded-3xl border border-[#ede7e3] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#43271a] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#9e3d50]">award_star</span>
          التزامات وضمانات الجودة
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#fef8f4] p-3 rounded-2xl border border-[#ede7e3] flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#cde9dc] text-[#072018] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
            </div>
            <div>
              <h4 className="font-bold text-[#43271a]">سيليكون بلاتيني نقي 100%</h4>
              <p className="text-[#50443f] text-[11px] mt-0.5">
                خالٍ تماماً من BPA وعديم الرائحة ولا يتفاعل مع المواد الدهنية أو درجات حرارة الفرن العالية.
              </p>
            </div>
          </div>

          <div className="bg-[#fef8f4] p-3 rounded-2xl border border-[#ede7e3] flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ffd9dd] text-[#9e3d50] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div>
              <h4 className="font-bold text-[#43271a]">معاينة الطلب قبل الدفع</h4>
              <p className="text-[#50443f] text-[11px] mt-0.5">
                يحق للزبون فتح الطرد ومعاينة المنتجات للتأكد من سلامتها قبل تسليم المبلغ لمندوب التوصيل.
              </p>
            </div>
          </div>

          <div className="bg-[#fef8f4] p-3 rounded-2xl border border-[#ede7e3] flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ffd9dd] text-[#9e3d50] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
            <div>
              <h4 className="font-bold text-[#43271a]">شحن سريع وآمن</h4>
              <p className="text-[#50443f] text-[11px] mt-0.5">
                تغليف كرتوني مقوى مزدوج يضمن وصول أدوات التزيين والقوالب الحساسة دون أي تلف.
              </p>
            </div>
          </div>

          <div className="bg-[#fef8f4] p-3 rounded-2xl border border-[#ede7e3] flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#cde9dc] text-[#072018] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div>
              <h4 className="font-bold text-[#43271a]">خدمة زبائن واستشارات شيف</h4>
              <p className="text-[#50443f] text-[11px] mt-0.5">
                فريقنا يقدم لك استشارات احترافية حول طريقة استخدام القوالب وتذويب الشوكولاتة والتلوين.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Support Section */}
      <div className="bg-white p-4 rounded-3xl border border-[#ede7e3] shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#43271a] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#9e3d50]">call</span>
          تواصل معنا واستفسارات الطلبات
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8f2ef]">
            <span className="text-[#82746e]">الهاتف وخدمة الزبائن:</span>
            <span className="font-bold text-[#43271a] font-mono" dir="ltr">0550 12 34 56</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8f2ef]">
            <span className="text-[#82746e]">البريد الإلكتروني:</span>
            <span className="font-bold text-[#43271a] font-mono" dir="ltr">contact@bakingpastry.dz</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8f2ef]">
            <span className="text-[#82746e]">أوقات العمل:</span>
            <span className="font-bold text-[#43271a]">يومياً من 08:30 صباحاً حتى 20:00 مساءً</span>
          </div>
        </div>
      </div>
    </div>
  );
};
