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
