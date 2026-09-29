-- =========================================================
--  متجر أثر — إضافة مجموعة العطور الجديدة (27 عطر)
--  انسخه كامل في Supabase: SQL Editor ← New query ← Run
--  آمن لو شغلته أكثر من مرة: ما يكرر عطر موجود بنفس الاسم
--  الأسعار مبدئية، عدّلها من لوحة التحكم ← العطور
-- =========================================================
insert into public.products (name_ar, name_en, category, badge, notes_top, notes_heart, notes_base, sizes, image_url, color, sort)
select v.* from (values
  ('هرش لهب','Hersh Lahab','unisex','الأكثر طلباً',null,null,null,'[{"label": "100 مل", "price": 190}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.124749.jpg','#c98a2b',10),
  ('هرش 2','Hersh 2','unisex',null,'حمضيات','زهر البرتقال، زنجبيل، قرفة','شاي أسود، لبان، عود','[{"label": "100 مل", "price": 185}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.124754.jpg','#b88a3a',11),
  ('وايلد كولت','Wild Colt','unisex',null,null,null,null,'[{"label": "200 مل", "price": 210}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.75834.jpg','#1f6f78',12),
  ('فرانكل أفنتوس','Frankel Aventus','men',null,'ليمون، سوسن','بنفسج، ريحان، فيتيفر','عنبر، فانيليا، أرز، مسك','[{"label": "200 مل", "price": 220}]'::jsonb,'https://cdn.salla.sa/yrlRO/27ee9a6d-96eb-49ea-86fd-2277d8e4e40d-500x500-uEzsee7Q5jHvyqsWo5Y9tMjkpEMcK8D9aBkIGvep.png','#2a2a2a',13),
  ('9 PM ريبل','9 PM Rebel','unisex','جديد','أناناس، تفاح','زهور','فانيليا، عنبر، أخشاب','[{"label": "100 مل", "price": 165}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.99238.jpg','#8a1a1a',14),
  ('9 PM نايت أوت','9 PM Night Out','unisex','جديد',null,null,null,'[{"label": "100 مل", "price": 170}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.123313.jpg','#3a3a3a',15),
  ('9 PM','9 PM','men',null,'تفاح، قرفة، لافندر، برغموت','زهر البرتقال، زنبق الوادي','فانيليا، تونكا، عنبر، باتشولي','[{"label": "100 مل", "price": 150}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.65414.jpg','#111111',16),
  ('سوبريمسي نوار','Supremacy Noir','unisex',null,null,null,null,'[{"label": "100 مل", "price": 175}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.40683.jpg','#1a1a1a',17),
  ('تاج الأزرق','Taj Blue','men',null,'حمضيات، فلفل','زهر البرتقال، سوسن','مسك، عنبر','[{"label": "100 مل", "price": 200}]'::jsonb,'https://heavenscents.co/wp-content/uploads/2025/09/%D8%AA%D8%A7%D8%AC-%D8%A7%D9%84%D8%A7%D8%B2%D8%B1%D9%82-%D9%87%D8%AF%D9%8A%D8%A9-%D9%84%D9%8A%D8%A8%D9%8A%D8%A7-%D9%85%D8%AA%D8%B5%D8%BA%D8%B1.webp','#1d3a78',18),
  ('تاج الأسود','Taj Black','men',null,'دافانا، برغموت، فلفل وردي','عود، عنبر أبيض، إكليل الجبل','مسك','[{"label": "100 مل", "price": 200}]'::jsonb,'https://heavenscents.net/wp-content/uploads/2024/10/ChatGPT-Image-May-7-2026-07_25_32-PM.jpg','#141414',19),
  ('جيمي تشو الأسود','Jimmy Choo Fever','women',null,null,null,null,'[{"label": "100 مل", "price": 260}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.49615.jpg','#5a1f3a',20),
  ('جيمي تشو الذهبي','Jimmy Choo Illicit','women',null,'زنجبيل، برتقال مر','ورد، ياسمين، زهر البرتقال','عسل، عنبر، صندل','[{"label": "100 مل", "price": 260}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.31233.jpg','#d4a64a',21),
  ('جيمي تشو البودري','Jimmy Choo','women',null,'كمثرى، يوسفي، نفحات خضراء','سحلبية','توفي، باتشولي','[{"label": "100 مل", "price": 250}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.10573.jpg','#d9b3b0',22),
  ('ليدي','Lady','women',null,'أوركيد، هليوتروب، يوسفي','فواكه استوائية','فانيليا، مسك، صندل','[{"label": "100 مل", "price": 160}]'::jsonb,'https://heavenscents.net/wp-content/uploads/2024/10/ChatGPT-Image-May-7-2026-06_56_08-PM.jpg','#f0a070',23),
  ('أميرة العرب','Ameerat Al Arab','women',null,null,null,null,'[{"label": "100 مل", "price": 130}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.81376.jpg','#7a1a2a',24),
  ('يارا','Yara','women','الأكثر طلباً','أوركيد، هليوتروب، يوسفي','فواكه استوائية','فانيليا، مسك، صندل','[{"label": "100 مل", "price": 135}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.76880.jpg','#f2b8c6',25),
  ('قصة','Qissa','women',null,null,null,null,'[{"label": "100 مل", "price": 140}]'::jsonb,null,'#e7a3b5',26),
  ('مس فلورا','Miss Flora','women',null,'زهر البرتقال، لوز','ياسمين، بنفسج، مشمش','صندل، مسك','[{"label": "200 مل", "price": 210}]'::jsonb,'https://cdn.salla.sa/yrlRO/06f6cb5d-04de-4bf1-b77f-c74ad8d0fe41-500x500-2eLGHyoC7geVajcVQxy5G0Im7HKRgNjrj8ShFazQ.png','#e8b7c8',27),
  ('لادور بخور','La''dor Bakhur','men',null,null,null,'بخور، عود، عنبر','[{"label": "200 مل", "price": 230}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.96079.jpg','#1c3f6e',28),
  ('خمرة','Khamrah','unisex','الأكثر طلباً','قرفة، جوزة الطيب، برغموت','تمر، برالين، مسك الروم','فانيليا، تونكا، عنبر','[{"label": "100 مل", "price": 150}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.75805.jpg','#c9781a',29),
  ('ميجارا','Megara','unisex',null,null,null,null,'[{"label": "100 مل", "price": 155}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.96620.jpg','#8fb3c4',30),
  ('ليكويد برون إيديشن','Liquid Brun Limited Edition','men','إصدار محدود','برغموت، هيل، قرفة','زهر البرتقال','فانيليا، برالين، مسك','[{"label": "100 مل", "price": 210}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.123526.jpg','#6b2e14',31),
  ('ليكويد برون','Liquid Brun','men',null,'برغموت، هيل، قرفة','زهر البرتقال','فانيليا، برالين، مسك','[{"label": "100 مل", "price": 180}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.94713.jpg','#7a3a1a',32),
  ('سينس جورجينا','Sense Georgina','women',null,null,null,null,'[{"label": "75 مل", "price": 190}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.102340.jpg','#f1c6d3',33),
  ('ناو نسائي','Now Women','women',null,null,null,null,'[{"label": "100 مل", "price": 130}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.85088.jpg','#e9a6b0',34),
  ('مسك الرمان','Abaq Pomegranate Musk','unisex',null,'رمان',null,'مسك','[{"label": "75 مل", "price": 170}]'::jsonb,'https://fimgs.net/mdimg/perfume/375x500.84773.jpg','#8a1c1c',35),
  ('نشوى','Nashwa','women',null,'برغموت، كمثرى','ياسمين، ورد','أمبروكسان، مسك','[{"label": "100 مل", "price": 145}]'::jsonb,'https://sa.junaidperfumes.com/cdn/shop/files/Nashwa.png?v=1761121229&width=600','#c9a0d6',36)
) v(name_ar,name_en,category,badge,notes_top,notes_heart,notes_base,sizes,image_url,color,sort)
where not exists (select 1 from public.products p where p.name_ar = v.name_ar);

-- (اختياري) لو تبي تحذف العطور التجريبية القديمة، شيل علامتي -- من السطر اللي تحت وشغّله:
-- delete from public.products where name_ar in ('عود الليل','عنبر الصحراء','جاوي','جلد وتبغ','مسك الحرير','زهر الليمون');
