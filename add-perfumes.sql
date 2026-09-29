-- =========================================================
--  متجر أثر — إضافة مجموعة العطور الجديدة (27 عطر)
--  انسخه كامل في Supabase: SQL Editor ← New query ← Run
--  آمن لو شغلته أكثر من مرة: ما يكرر عطر موجود بنفس الاسم
--  الأسعار مبدئية، عدّلها من لوحة التحكم ← العطور
-- =========================================================
insert into public.products (name_ar, name_en, category, badge, notes_top, notes_heart, notes_base, sizes, image_url, color, sort)
select v.* from (values
  ('هرش لهب','Hersh Lahab','unisex','الأكثر طلباً',null,null,null,'[{"label": "100 مل", "price": 190}]'::jsonb,'assets/products/hersh-lahab.webp','#c98a2b',10),
  ('هرش 2','Hersh 2','unisex',null,'حمضيات','زهر البرتقال، زنجبيل، قرفة','شاي أسود، لبان، عود','[{"label": "100 مل", "price": 185}]'::jsonb,'assets/products/hersh-2.webp','#b88a3a',11),
  ('وايلد كولت','Wild Colt','unisex',null,null,null,null,'[{"label": "200 مل", "price": 210}]'::jsonb,'assets/products/wild-colt.webp','#1f6f78',12),
  ('فرانكل أفنتوس','Frankel Aventus','men',null,'ليمون، سوسن','بنفسج، ريحان، فيتيفر','عنبر، فانيليا، أرز، مسك','[{"label": "200 مل", "price": 220}]'::jsonb,'assets/products/frankel-aventus.webp','#2a2a2a',13),
  ('9 PM ريبل','9 PM Rebel','unisex','جديد','أناناس، تفاح','زهور','فانيليا، عنبر، أخشاب','[{"label": "100 مل", "price": 165}]'::jsonb,'assets/products/9pm-rebel.webp','#8a1a1a',14),
  ('9 PM نايت أوت','9 PM Night Out','unisex','جديد',null,null,null,'[{"label": "100 مل", "price": 170}]'::jsonb,'assets/products/9pm-night-out.webp','#3a3a3a',15),
  ('9 PM','9 PM','men',null,'تفاح، قرفة، لافندر، برغموت','زهر البرتقال، زنبق الوادي','فانيليا، تونكا، عنبر، باتشولي','[{"label": "100 مل", "price": 150}]'::jsonb,'assets/products/9pm.webp','#111111',16),
  ('سوبريمسي نوار','Supremacy Noir','unisex',null,null,null,null,'[{"label": "100 مل", "price": 175}]'::jsonb,'assets/products/supremacy-noir.webp','#1a1a1a',17),
  ('تاج الأزرق','Taj Blue','men',null,'حمضيات، فلفل','زهر البرتقال، سوسن','مسك، عنبر','[{"label": "100 مل", "price": 200}]'::jsonb,'assets/products/taj-blue.webp','#1d3a78',18),
  ('تاج الأسود','Taj Black','men',null,'دافانا، برغموت، فلفل وردي','عود، عنبر أبيض، إكليل الجبل','مسك','[{"label": "100 مل", "price": 200}]'::jsonb,'assets/products/taj-black.webp','#141414',19),
  ('جيمي تشو الأسود','Jimmy Choo Fever','women',null,null,null,null,'[{"label": "100 مل", "price": 260}]'::jsonb,'assets/products/jimmy-choo-black.webp','#5a1f3a',20),
  ('جيمي تشو الذهبي','Jimmy Choo Illicit','women',null,'زنجبيل، برتقال مر','ورد، ياسمين، زهر البرتقال','عسل، عنبر، صندل','[{"label": "100 مل", "price": 260}]'::jsonb,'assets/products/jimmy-choo-gold.webp','#d4a64a',21),
  ('جيمي تشو البودري','Jimmy Choo','women',null,'كمثرى، يوسفي، نفحات خضراء','سحلبية','توفي، باتشولي','[{"label": "100 مل", "price": 250}]'::jsonb,'assets/products/jimmy-choo-powder.webp','#d9b3b0',22),
  ('ليدي','Lady','women',null,'أوركيد، هليوتروب، يوسفي','فواكه استوائية','فانيليا، مسك، صندل','[{"label": "100 مل", "price": 160}]'::jsonb,'assets/products/lady.webp','#f0a070',23),
  ('أميرة العرب','Ameerat Al Arab','women',null,null,null,null,'[{"label": "100 مل", "price": 130}]'::jsonb,'assets/products/ameerat-al-arab.webp','#7a1a2a',24),
  ('يارا','Yara','women','الأكثر طلباً','أوركيد، هليوتروب، يوسفي','فواكه استوائية','فانيليا، مسك، صندل','[{"label": "100 مل", "price": 135}]'::jsonb,'assets/products/yara.webp','#f2b8c6',25),
  ('قصة','Qissa','women',null,null,null,null,'[{"label": "100 مل", "price": 140}]'::jsonb,null,'#e7a3b5',26),
  ('مس فلورا','Miss Flora','women',null,'زهر البرتقال، لوز','ياسمين، بنفسج، مشمش','صندل، مسك','[{"label": "200 مل", "price": 210}]'::jsonb,'assets/products/miss-flora.webp','#e8b7c8',27),
  ('لادور بخور','La''dor Bakhur','men',null,null,null,'بخور، عود، عنبر','[{"label": "200 مل", "price": 230}]'::jsonb,'assets/products/lador-bakhur.webp','#1c3f6e',28),
  ('خمرة','Khamrah','unisex','الأكثر طلباً','قرفة، جوزة الطيب، برغموت','تمر، برالين، مسك الروم','فانيليا، تونكا، عنبر','[{"label": "100 مل", "price": 150}]'::jsonb,'assets/products/khamrah.webp','#c9781a',29),
  ('ميجارا','Megara','unisex',null,null,null,null,'[{"label": "100 مل", "price": 155}]'::jsonb,'assets/products/megara.webp','#8fb3c4',30),
  ('ليكويد برون إيديشن','Liquid Brun Limited Edition','men','إصدار محدود','برغموت، هيل، قرفة','زهر البرتقال','فانيليا، برالين، مسك','[{"label": "100 مل", "price": 210}]'::jsonb,'assets/products/liquid-brun-le.webp','#6b2e14',31),
  ('ليكويد برون','Liquid Brun','men',null,'برغموت، هيل، قرفة','زهر البرتقال','فانيليا، برالين، مسك','[{"label": "100 مل", "price": 180}]'::jsonb,'assets/products/liquid-brun.webp','#7a3a1a',32),
  ('سينس جورجينا','Sense Georgina','women',null,null,null,null,'[{"label": "75 مل", "price": 190}]'::jsonb,'assets/products/sense-georgina.webp','#f1c6d3',33),
  ('ناو نسائي','Now Women','women',null,null,null,null,'[{"label": "100 مل", "price": 130}]'::jsonb,'assets/products/now-women.webp','#e9a6b0',34),
  ('مسك الرمان','Abaq Pomegranate Musk','unisex',null,'رمان',null,'مسك','[{"label": "75 مل", "price": 170}]'::jsonb,'assets/products/abaq-pomegranate.webp','#8a1c1c',35),
  ('نشوى','Nashwa','women',null,'برغموت، كمثرى','ياسمين، ورد','أمبروكسان، مسك','[{"label": "100 مل", "price": 145}]'::jsonb,'assets/products/nashwa.webp','#c9a0d6',36)
) v(name_ar,name_en,category,badge,notes_top,notes_heart,notes_base,sizes,image_url,color,sort)
where not exists (select 1 from public.products p where p.name_ar = v.name_ar);

-- (اختياري) لو تبي تحذف العطور التجريبية القديمة، شيل علامتي -- من السطر اللي تحت وشغّله:
-- delete from public.products where name_ar in ('عود الليل','عنبر الصحراء','جاوي','جلد وتبغ','مسك الحرير','زهر الليمون');
