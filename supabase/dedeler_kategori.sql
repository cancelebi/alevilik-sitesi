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
