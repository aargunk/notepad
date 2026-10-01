-- Notepad Pro — defter/sayfa/not ilişkisini isimden ID'ye taşıma
-- Şu ana kadar pages.notebook_name ve notes.notebook_name, notebooks.name ile EŞLEŞTİRİLEREK
-- bağlanıyordu. Bu, aynı kullanıcı aynı isimde iki defter oluşturursa (hiçbir engel yoktu),
-- birini silmenin diğerinin sayfa/notlarını da silmesi gibi tehlikeli bir duruma yol açabiliyordu.
-- Bu migration sabit bir notebook_id sütunu ekliyor ve isim çakışmalarını veritabanı seviyesinde
-- de imkansız hale getiriyor. Hiçbir mevcut veri silinmez.

-- 1) notebook_id sütunları
alter table public.pages add column if not exists notebook_id uuid references public.notebooks(id) on delete cascade;
alter table public.notes add column if not exists notebook_id uuid references public.notebooks(id) on delete cascade;

create index if not exists pages_notebook_id_idx on public.pages (notebook_id);
create index if not exists notes_notebook_id_idx on public.notes (notebook_id);

-- 2) Mevcut satırları isim + kullanıcı eşleşmesine göre geriye dönük doldur (backfill)
update public.pages p
set notebook_id = nb.id
from public.notebooks nb
where p.notebook_id is null
  and p.notebook_name = nb.name
  and p.user_id = nb.user_id;

update public.notes n
set notebook_id = nb.id
from public.notebooks nb
where n.notebook_id is null
  and n.notebook_name = nb.name
  and n.user_id = nb.user_id;

-- 3) Aynı kullanıcının aynı isimde iki defter oluşturmasını veritabanı seviyesinde de engelle.
-- Önce (varsa) mevcut isim çakışmalarını otomatik olarak ayırt edilebilir hale getirir
-- (en eskisi olduğu gibi kalır, sonrakilere "(2)", "(3)" gibi bir ek eklenir), yoksa aşağıdaki
-- UNIQUE kısıtı eklenirken hata verir.
with dupes as (
  select id, user_id, name,
         row_number() over (partition by user_id, name order by created_at asc) as rn
  from public.notebooks
)
update public.notebooks nb
set name = nb.name || ' (' || d.rn || ')'
from dupes d
where nb.id = d.id and d.rn > 1;

alter table public.notebooks drop constraint if exists notebooks_user_name_unique;
alter table public.notebooks add constraint notebooks_user_name_unique unique (user_id, name);

NOTIFY pgrst, 'reload schema';
