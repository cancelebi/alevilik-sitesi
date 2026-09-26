-- Eksik profilleri (tablo kurulmadan önce kayıt olan hesapları) tamamlamak için onarıcı kod
insert into public.profiles (id, username, role)
select id, coalesce(raw_user_meta_data->>'username', 'kullanici_' || substr(id::text, 1, 6)), 'editor'
from auth.users
on conflict (id) do nothing;
