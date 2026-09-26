CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Varsayılan şifreyi ekle (Eğer yoksa)
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('admin_pin', '1453')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS ayarları
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (Admin girişi yaparken lazım)
CREATE POLICY "Herkes ayarları okuyabilir"
    ON public.site_settings FOR SELECT
    USING (true);

-- Sadece adminler güncelleyebilir
CREATE POLICY "Sadece adminler ayarları güncelleyebilir"
    ON public.site_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
