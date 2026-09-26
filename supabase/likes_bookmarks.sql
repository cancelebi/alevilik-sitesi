-- 1. LIKES (BEĞENİLER) TABLOSU
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id) -- Bir kullanıcı bir gönderiyi sadece bir kez beğenebilir
);

-- RLS - Likes
alter table public.likes enable row level security;
create policy "Beğenileri herkes görebilir." on public.likes for select using (true);
create policy "Kullanıcılar beğeni ekleyebilir." on public.likes for insert with check (auth.uid() = user_id);
create policy "Kullanıcılar kendi beğenilerini kaldırabilir." on public.likes for delete using (auth.uid() = user_id);

-- 2. BOOKMARKS (KAYDEDİLENLER) TABLOSU
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id) -- Bir kullanıcı bir gönderiyi sadece bir kez kaydedebilir
);

-- RLS - Bookmarks
alter table public.bookmarks enable row level security;
create policy "Kullanıcılar sadece kendi kaydettiklerini görebilir." on public.bookmarks for select using (auth.uid() = user_id);
create policy "Kullanıcılar gönderi kaydedebilir." on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Kullanıcılar kendi kaydettiklerini silebilir." on public.bookmarks for delete using (auth.uid() = user_id);
