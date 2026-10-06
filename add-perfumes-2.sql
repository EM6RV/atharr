-- =========================================================
--  متجر أثر — الدفعة الثانية: 5 عطور جديدة + تحديث أسعار
--  انسخه كامل في Supabase: SQL Editor ← New query ← Run
--  آمن لو شغلته أكثر من مرة: ما يكرر عطر موجود بنفس الاسم
--  التخفيض: "old" هو السعر قبل التخفيض، و"price" السعر الحالي
-- =========================================================

-- 1) العطور الجديدة
insert into public.products (name_ar, name_en, category, badge, notes_top, notes_heart, notes_base, sizes, image_url, color, sort)
select v.* from (values
  ('جان بول غوتييه لو مال إليكسير','Jean Paul Gaultier Le Male Elixir','men','جديد','لافندر، نعناع','فانيليا، بنزوين','عسل، تونكا، تبغ',
     '[{"label": "75 مل", "price": 950}, {"label": "تقسيمة 10 مل", "price": 110}]'::jsonb,'assets/products/jpg-le-male-elixir.webp','#b8862b',40),
  ('هوكيد إنتنسلي','Hooked Intensely','men','جديد',null,null,null,
     '[{"label": "100 مل", "price": 140}]'::jsonb,'assets/products/hooked-intensely.webp','#a8501a',41),
  ('هوكيد أزور','Hooked Azure','men','جديد',null,null,null,
     '[{"label": "100 مل", "price": 140}]'::jsonb,'assets/products/hooked-azure.webp','#1d4fa8',42),
  ('هوكيد بور هوم','Hooked Pour Homme','men',null,null,null,null,
     '[{"label": "100 مل", "price": 130, "old": 175}]'::jsonb,'assets/products/hooked-pour-homme.webp','#3d4a2e',43),
  ('أسد إليكسير','Asad Elixir','men',null,'فلفل وردي، زعفران، جريب فروت','تبغ، أرز، فانيليا','باتشولي، لبان، كشميران، عنبر',
     '[{"label": "100 مل", "price": 120, "old": 155}]'::jsonb,'assets/products/asad-elixir.webp','#2a2a2a',44)
) v(name_ar,name_en,category,badge,notes_top,notes_heart,notes_base,sizes,image_url,color,sort)
where not exists (select 1 from public.products p where p.name_ar = v.name_ar);

-- 2) تحديث الأسعار
update public.products set sizes = '[{"label": "200 مل", "price": 295}]'::jsonb where name_ar = 'فرانكل أفنتوس';
update public.products set sizes = '[{"label": "200 مل", "price": 315}]'::jsonb where name_ar = 'وايلد كولت';
update public.products set sizes = '[{"label": "100 مل", "price": 190, "old": 240}]'::jsonb where name_ar = 'ميجارا';
