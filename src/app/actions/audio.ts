'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function uploadAudio(formData: FormData) {
  const title = formData.get('title') as string;
  const artist = (formData.get('artist') as string) || 'Anonim';
  const externalUrl = formData.get('externalUrl') as string | null;

  if (!title || !externalUrl) {
    return { error: 'Lütfen bir link girin ve başlık alanını doldurun.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Giriş yapmalısınız.' };
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin' && profile.role !== 'dede')) {
    return { error: 'Bu işlem için yetkiniz yok.' };
  }

  // 2. Veritabanına kaydet
  const { error: dbError } = await supabase
    .from('audio_tracks')
    .insert({
      title,
      artist,
      audio_url: externalUrl,
      uploaded_by: user.id
    });

  if (dbError) {
    console.error('Audio DB insert error:', dbError);
    return { error: 'Veritabanına kaydedilemedi: ' + dbError.message };
  }

  revalidatePath('/admin/sesler');
  revalidatePath('/'); // Radyo her sayfada var
  return { success: true };
}

export async function deleteAudioTrack(id: string, url: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Giriş yapmalısınız.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin' && profile.role !== 'dede')) {
    return { error: 'Yetkiniz yok.' };
  }

  const adminClient = createAdminClient();

  // Eğer bu URL bizim storage'daysa dosyayı sil
  if (url && url.includes('supabase.co/storage/v1/object/public/audio/')) {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName) {
        await adminClient.storage.from('audio').remove([fileName]);
      }
    } catch (err) {
      console.error("Storage silme hatası", err);
    }
  }

  // Veritabanından sil
  const { error } = await adminClient.from('audio_tracks').delete().eq('id', id);
  
  if (error) {
    return { error: 'Kayıt silinirken hata oluştu: ' + error.message };
  }

  revalidatePath('/admin/sesler');
  revalidatePath('/');
  return { success: true };
}

export async function editAudioTrack(id: string, title: string, artist: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Giriş yapmalısınız.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin' && profile.role !== 'dede')) {
    return { error: 'Yetkiniz yok.' };
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('audio_tracks')
    .update({ title, artist })
    .eq('id', id);

  if (error) {
    return { error: 'Güncelleme hatası: ' + error.message };
  }

  revalidatePath('/admin/sesler');
  revalidatePath('/');
  return { success: true };
}
