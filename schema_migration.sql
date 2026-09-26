-- 1. PROFILES TABLOSU
-- auth.users tablosu ile 1-1 ilişkilidir
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  role text default 'user'::text not null, -- 'user', 'editor', 'admin'
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS (Row Level Security) Politikaları - Profiles
alter table public.profiles enable row level security;
create policy "Profilleri herkes görebilir." on public.profiles for select using (true);
create policy "Kullanıcılar kendi profillerini güncelleyebilir." on public.profiles for update using (auth.uid() = id);

-- TRIGGER: Yeni üye kayıt olduğunda otomatik profil oluşturma
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'kullanici_' || substr(new.id::text, 1, 6)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. CATEGORIES TABLOSU
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS - Categories
alter table public.categories enable row level security;
create policy "Kategorileri herkes görebilir." on public.categories for select using (true);


-- 3. POSTS TABLOSU (Makale ve Forum Başlıkları)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  type text not null default 'forum_thread', -- 'article' veya 'forum_thread'
  is_published boolean default true not null,
  category_id uuid references public.categories on delete set null,
  author_id uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS - Posts
alter table public.posts enable row level security;
create policy "Yayınlanmış gönderileri herkes görebilir." on public.posts for select using (is_published = true);
create policy "Üyeler forum başlığı açabilir." on public.posts for insert with check (auth.uid() = author_id and type = 'forum_thread');
create policy "Kullanıcılar kendi gönderilerini güncelleyebilir." on public.posts for update using (auth.uid() = author_id);


-- 4. COMMENTS TABLOSU (Yorumlar ve Cevaplar)
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  post_id uuid references public.posts on delete cascade not null,
  author_id uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS - Comments
alter table public.comments enable row level security;
create policy "Yorumları herkes görebilir." on public.comments for select using (true);
create policy "Giriş yapan üyeler yorum yazabilir." on public.comments for insert with check (auth.uid() = author_id);
create policy "Kullanıcılar kendi yorumlarını silebilir/güncelleyebilir." on public.comments for update using (auth.uid() = author_id);
create policy "Kullanıcılar kendi yorumlarını silebilir (delete)." on public.comments for delete using (auth.uid() = author_id);


-- 5. ÖRNEK KATEGORİ VERİLERİNİ EKLEYELİM
insert into public.categories (slug, title, description) values
('tarihce', 'Tarihçe', 'Anadolu''ya geliş süreci, Hacı Bektaş Veli ve dönüm noktaları.'),
('inanc-esaslari', 'İnanç Esasları', 'Hakk-Muhammed-Ali anlayışı, dört kapı kırk makam, insan-ı kamil.'),
('cem-ve-semah', 'Cem & Semah', 'Cem ayininin aşamaları, on iki hizmet, semah türleri.'),
('edebiyat-ve-muzik', 'Edebiyat & Müzik', 'Deyişler, nefesler, Pir Sultan Abdal, bağlama geleneği.'),
('harita', 'Harita', 'Türkiye ve dünyada cemevleri, bölgesel çeşitlilik.'),
('guncel-yasam', 'Güncel Yaşam', 'Bugünkü Alevi toplumu, diaspora, güncel gündem yazıları.');


-- 1. Create the `audio_tracks` table
CREATE TABLE IF NOT EXISTS public.audio_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Anonim',
    audio_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.audio_tracks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for audio_tracks
-- Everyone can read audio tracks (for the radio player)
CREATE POLICY "Anyone can view audio tracks" 
ON public.audio_tracks FOR SELECT 
USING (true);

-- Only admins and editors can insert/delete audio tracks
CREATE POLICY "Admins and editors can insert audio tracks" 
ON public.audio_tracks FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
);

CREATE POLICY "Admins and editors can delete audio tracks" 
ON public.audio_tracks FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
);

-- 4. Create the `audio` storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies for `audio` bucket
-- Anyone can read from the audio bucket
CREATE POLICY "Public Access to audio bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'audio');

-- Only admins/editors can upload to the audio bucket
CREATE POLICY "Admins can upload audio" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'audio' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
);

CREATE POLICY "Admins can delete audio" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'audio' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.role = 'editor')
  )
);


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


-- 1. 'kose-yazilari' kategorisini ekle
INSERT INTO public.categories (slug, title, description)
VALUES (
  'kose-yazilari', 
  'Köşe Yazıları & Dualar', 
  'Dedelerimizin ve inanç önderlerimizin kaleminden dökülen dualar, nefesler ve öğütler.'
) ON CONFLICT (slug) DO NOTHING;

-- 2. Eğer gerekiyorsa 'profiles' tablosundaki 'role' check constraint'ini güncelle (dede rolü eklemek için)
-- Mevcut constraint'i bulup düşürmek güvenli bir yoldur, ancak basitçe admin panelinden 'editor' rolü vererek de köşe yazarı yapabiliriz.
-- Daha havalı olması için 'dede' rolünü sisteme tanıtalım:
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'editor', 'admin', 'dede'));


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


-- Yeni roller için Insert ve Delete politikalarını güncelle
DROP POLICY IF EXISTS "Admins and editors can insert audio tracks" ON public.audio_tracks;
CREATE POLICY "Admins and editors can insert audio tracks" ON public.audio_tracks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role IN ('admin', 'editor', 'dede')))
);

DROP POLICY IF EXISTS "Admins and editors can delete audio tracks" ON public.audio_tracks;
CREATE POLICY "Admins and editors can delete audio tracks" ON public.audio_tracks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role IN ('admin', 'editor', 'dede')))
);

-- Düzenleme özelliği için UPDATE politikası ekle
DROP POLICY IF EXISTS "Admins and editors can update audio tracks" ON public.audio_tracks;
CREATE POLICY "Admins and editors can update audio tracks" ON public.audio_tracks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role IN ('admin', 'editor', 'dede')))
);

-- Storage için yetkileri güncelle
DROP POLICY IF EXISTS "Admins can upload audio" ON storage.objects;
CREATE POLICY "Admins can upload audio" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'audio' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role IN ('admin', 'editor', 'dede')))
);

DROP POLICY IF EXISTS "Admins can delete audio" ON storage.objects;
CREATE POLICY "Admins can delete audio" ON storage.objects FOR DELETE USING (
  bucket_id = 'audio' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND (profiles.role IN ('admin', 'editor', 'dede')))
);


