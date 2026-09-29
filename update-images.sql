-- =========================================================
--  متجر أثر — تحديث صور العطور (صور بدون خلفية، محفوظة داخل الموقع)
--  الصق هذا كامل في Supabase: SQL Editor ← New query ← Run
-- =========================================================
update public.products p set image_url = v.img
from (values
  ('هرش لهب','assets/products/hersh-lahab.webp'),
  ('هرش 2','assets/products/hersh-2.webp'),
  ('وايلد كولت','assets/products/wild-colt.webp'),
  ('فرانكل أفنتوس','assets/products/frankel-aventus.webp'),
  ('9 PM ريبل','assets/products/9pm-rebel.webp'),
  ('9 PM نايت أوت','assets/products/9pm-night-out.webp'),
  ('9 PM','assets/products/9pm.webp'),
  ('سوبريمسي نوار','assets/products/supremacy-noir.webp'),
  ('تاج الأزرق','assets/products/taj-blue.webp'),
  ('تاج الأسود','assets/products/taj-black.webp'),
  ('جيمي تشو الأسود','assets/products/jimmy-choo-black.webp'),
  ('جيمي تشو الذهبي','assets/products/jimmy-choo-gold.webp'),
  ('جيمي تشو البودري','assets/products/jimmy-choo-powder.webp'),
  ('ليدي','assets/products/lady.webp'),
  ('أميرة العرب','assets/products/ameerat-al-arab.webp'),
  ('يارا','assets/products/yara.webp'),
  ('مس فلورا','assets/products/miss-flora.webp'),
  ('لادور بخور','assets/products/lador-bakhur.webp'),
  ('خمرة','assets/products/khamrah.webp'),
  ('ميجارا','assets/products/megara.webp'),
  ('ليكويد برون إيديشن','assets/products/liquid-brun-le.webp'),
  ('ليكويد برون','assets/products/liquid-brun.webp'),
  ('سينس جورجينا','assets/products/sense-georgina.webp'),
  ('ناو نسائي','assets/products/now-women.webp'),
  ('مسك الرمان','assets/products/abaq-pomegranate.webp'),
  ('نشوى','assets/products/nashwa.webp')
) v(name_ar, img)
where p.name_ar = v.name_ar;
