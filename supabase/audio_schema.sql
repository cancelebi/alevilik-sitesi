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
