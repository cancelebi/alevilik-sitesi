-- SADECE Editör ve Admin yetkisi olanların Makale (Article) ekleyebilmesi için gerekli izin kuralı

-- Önce eski bir kural varsa (çakışmaması için) silelim (opsiyonel ama güvenli)
drop policy if exists "Editörler makale ekleyebilir." on public.posts;
drop policy if exists "Editörler makale güncelleyebilir." on public.posts;

-- Makale Ekleme İzni (INSERT)
create policy "Editörler makale ekleyebilir." on public.posts for insert with check (
  auth.uid() = author_id and 
  type = 'article' and 
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('editor', 'admin')
  )
);

-- Makale Güncelleme İzni (UPDATE)
create policy "Editörler makale güncelleyebilir." on public.posts for update using (
  auth.uid() = author_id and 
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('editor', 'admin')
  )
);

-- Makale Silme İzni (DELETE)
create policy "Editörler makale silebilir." on public.posts for delete using (
  exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('editor', 'admin')
  )
);
