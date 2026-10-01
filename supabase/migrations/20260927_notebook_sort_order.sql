-- Notepad Pro — defter sıralamasını kalıcı hale getirme
-- Şu ana kadar sürükle-bırak ile yapılan defter sıralaması hiçbir yere kaydedilmiyordu — sadece
-- o oturumda görünüyor, sayfa yenilenince veya tekrar giriş yapılınca kayboluyordu. Bu migration
-- bir sort_order sütunu ekliyor ve mevcut defterleri oluşturulma sırasına göre numaralandırıyor.

alter table public.notebooks add column if not exists sort_order integer;

-- Mevcut defterleri, her kullanıcı için ayrı ayrı, oluşturulma sırasına göre 0'dan başlayarak numaralandır
with numbered as (
  select id, row_number() over (partition by user_id order by created_at asc) - 1 as rn
  from public.notebooks
  where sort_order is null
)
update public.notebooks nb
set sort_order = numbered.rn
from numbered
where nb.id = numbered.id;

NOTIFY pgrst, 'reload schema';
