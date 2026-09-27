-- =========================================================
--  متجر أثر ATHAR — إعداد قاعدة البيانات في Supabase
--  انسخ هذا الملف كاملاً في: SQL Editor ← New query ← Run
-- =========================================================

-- ---------- الجداول ----------
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  name_ar     text not null,
  name_en     text,
  category    text not null default 'unisex',        -- men | women | unisex | oud
  badge       text,                                   -- مثال: الأكثر طلباً / جديد
  notes_top   text,
  notes_heart text,
  notes_base  text,
  description text,
  sizes       jsonb not null default '[{"label":"50 مل","price":150}]'::jsonb,
  image_url   text,
  color       text default '#8a5a2b',                 -- لون الزجاجة لو ما فيه صورة
  in_stock    boolean not null default true,
  active      boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id            bigint generated always as identity primary key,
  code          text unique,
  customer_name text not null,
  phone         text not null,
  city          text not null,
  address       text,
  note          text,
  items         jsonb not null,
  subtotal      numeric not null,
  delivery_fee  numeric not null default 0,
  total         numeric not null,
  status        text not null default 'new',          -- new | confirmed | shipped | delivered | cancelled
  created_at    timestamptz not null default now()
);

create table if not exists public.settings (
  key   text primary key,
  value jsonb not null
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------- دالة: هل المستخدم الحالي مدير؟ ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- دالة إنشاء الطلب (الأسعار تُحسب من قاعدة البيانات، مش من المتصفح) ----------
create or replace function public.place_order(
  p_name text, p_phone text, p_city text, p_address text, p_note text, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  it        jsonb;
  prod      public.products%rowtype;
  sz        jsonb;
  qty       int;
  line_tot  numeric;
  sub       numeric := 0;
  fee       numeric := 0;
  out_items jsonb := '[]'::jsonb;
  new_id    bigint;
  new_code  text;
begin
  if coalesce(trim(p_name),'') = '' or coalesce(trim(p_phone),'') = '' or coalesce(trim(p_city),'') = '' then
    raise exception 'الاسم ورقم الهاتف والمدينة مطلوبة';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'السلة فاضية أو فيها عناصر كثيرة';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    select * into prod from public.products where id = (it->>'id')::bigint and active and in_stock;
    if not found then raise exception 'منتج غير متوفر'; end if;
    sz := null;
    select s into sz from jsonb_array_elements(prod.sizes) s where s->>'label' = it->>'size' limit 1;
    if sz is null then raise exception 'الحجم غير موجود'; end if;
    qty := greatest(1, least(20, coalesce((it->>'qty')::int, 1)));
    line_tot := (sz->>'price')::numeric * qty;
    sub := sub + line_tot;
    out_items := out_items || jsonb_build_object('id', prod.id, 'name', prod.name_ar, 'size', sz->>'label',
                                                  'price', (sz->>'price')::numeric, 'qty', qty, 'total', line_tot);
  end loop;

  select coalesce((value->>p_city)::numeric, (value->>'default')::numeric, 0)
    into fee from public.settings where key = 'delivery_fees';
  fee := coalesce(fee, 0);

  insert into public.orders (customer_name, phone, city, address, note, items, subtotal, delivery_fee, total)
  values (left(trim(p_name),80), left(trim(p_phone),30), left(trim(p_city),40), left(p_address,200), left(p_note,300),
          out_items, sub, fee, sub + fee)
  returning id into new_id;

  new_code := 'ATH-' || (1000 + new_id);
  update public.orders set code = new_code where id = new_id;

  return jsonb_build_object('code', new_code, 'items', out_items, 'subtotal', sub, 'delivery_fee', fee, 'total', sub + fee);
end $$;

revoke all on function public.place_order(text,text,text,text,text,jsonb) from public;
grant execute on function public.place_order(text,text,text,text,text,jsonb) to anon, authenticated;

-- ---------- الحماية (Row Level Security) ----------
alter table public.products enable row level security;
alter table public.orders   enable row level security;
alter table public.settings enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (active or public.is_admin());
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders for select using (public.is_admin());
drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin delete orders" on public.orders;
create policy "admin delete orders" on public.orders for delete using (public.is_admin());

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);
drop policy if exists "admin write settings" on public.settings;
create policy "admin write settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin sees admins" on public.admins;
create policy "admin sees admins" on public.admins for select using (user_id = auth.uid());

-- ---------- مكان صور المنتجات ----------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects for update using (bucket_id = 'products' and public.is_admin());
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects for delete using (bucket_id = 'products' and public.is_admin());

-- ---------- الإعدادات الأولية ----------
insert into public.settings (key, value) values
  ('store', '{"whatsapp":"218910000000","instagram":"athar.ly","announcement":"توصيل لكل المدن الليبية · الدفع عند الاستلام","hero_title":"خلّي أثرك","hero_text":"عطور أصلية مختارة بعناية، من العود والعنبر إلى المسك والجاوي. رائحة تبقى في المكان بعد ما تمشي، وتوصل لباب بيتك في كل ليبيا."}'),
  ('delivery_fees', '{"طرابلس":15,"بنغازي":15,"مصراتة":20,"الزاوية":20,"البيضاء":25,"سبها":35,"طبرق":30,"درنة":25,"سرت":25,"default":30}')
on conflict (key) do nothing;

-- ---------- عطور تجريبية (عدّلها أو احذفها من لوحة التحكم) ----------
insert into public.products (name_ar, name_en, category, badge, notes_top, notes_heart, notes_base, sizes, color, sort)
select * from (values
  ('عود الليل','Midnight Oud','oud','الأكثر طلباً','زعفران، هيل','ورد طائفي','عود، عنبر','[{"label":"50 مل","price":220},{"label":"100 مل","price":350}]'::jsonb,'#5a2410',1),
  ('عنبر الصحراء','Desert Amber','unisex',null,'بيرغموت','زعفران، قرفة','عنبر، فانيليا','[{"label":"50 مل","price":185},{"label":"100 مل","price":295}]'::jsonb,'#c9861a',2),
  ('جاوي','Jawi Incense','oud','روح ليبية','لبان','جاوي (بنزوين)','صندل، مسك','[{"label":"50 مل","price":175},{"label":"100 مل","price":280}]'::jsonb,'#8a5a2b',3),
  ('جلد وتبغ','Leather & Tobacco','men',null,'فلفل أسود','تبغ، هيل','جلد، فيتيفر','[{"label":"50 مل","price":195},{"label":"100 مل","price":310}]'::jsonb,'#4a2a1a',4),
  ('مسك الحرير','Silk Musk','women',null,'كمثرى','ياسمين، بودرة','مسك أبيض','[{"label":"50 مل","price":160},{"label":"100 مل","price":255}]'::jsonb,'#d9bf9c',5),
  ('زهر الليمون','Neroli Blossom','women','جديد','زهر البرتقال، ليمون','نيرولي','مسك، خشب أبيض','[{"label":"50 مل","price":150},{"label":"100 مل","price":240}]'::jsonb,'#e0b04f',6)
) v(name_ar,name_en,category,badge,notes_top,notes_heart,notes_base,sizes,color,sort)
where not exists (select 1 from public.products);

-- =========================================================
--  بعد ما تسوي حساب المدير من Authentication ← Users ← Add user
--  شغّل السطر هذا (غيّر الإيميل لإيميلك):
--
--  insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
-- =========================================================
