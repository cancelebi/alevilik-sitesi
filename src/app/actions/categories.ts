'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Slug oluşturucu (Türkçe karakterleri vs. temizler)
function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 -]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-'); 
}

export async function addCategory(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;

  if (!title) {
    return { error: 'Kategori adı boş olamaz.', success: false };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Giriş yapmalısınız.', success: false };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin' && profile?.role !== 'editor') {
    return { error: 'Yetkiniz yok.', success: false };
  }

  const slug = generateSlug(title);

  const { error } = await supabase
    .from('categories')
    .insert({ title: title.trim(), slug: slug });

  if (error) {
    return { error: 'Kategori eklenirken hata oluştu (Aynı isimde kategori olabilir).', success: false };
  }

  revalidatePath('/admin/kategoriler');
  return { success: true, error: '' };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Giriş yapmalısınız.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return { error: 'Kategori silmek için Admin olmalısınız.' };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from('categories').delete().eq('id', id);

  if (error) {
    return { error: 'Kategori silinirken hata oluştu. İçinde yazı olan kategoriler silinemeyebilir.' };
  }

  revalidatePath('/admin/kategoriler');
  return { success: true };
}
