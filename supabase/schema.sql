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
