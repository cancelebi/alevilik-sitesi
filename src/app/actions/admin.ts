'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

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

export async function createArticle(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const categoryId = formData.get('category_id') as string;

  if (!title || !content || !categoryId) {
    return { error: 'Lütfen tüm alanları doldurun.', success: false };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Bu işlem için giriş yapmalısınız.', success: false };
  }

  // Sadece Editor/Admin/Dede yetkisi olanlar makale ekleyebilir
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin' && profile.role !== 'dede')) {
    return { error: 'Makale ekleme yetkiniz yok.', success: false };
  }

  const slug = generateSlug(title);

  // Veritabanına Makale Olarak Ekle (type = 'article')
  const { error } = await supabase
    .from('posts')
    .insert({
      title: title.trim(),
      slug: slug,
      content: content.trim(),
      type: 'article',
      is_published: true, // Şimdilik direkt yayınlanıyor
      category_id: categoryId,
      author_id: user.id
    });

  if (error) {
    console.error('Makale ekleme hatası:', error);
    // Eğer slug çakışırsa veritabanı hata verir (unique constraint). 
    // Gerçek sistemde slug sonuna random sayı eklenerek çözülebilir, basitlik adına böyle bırakıyoruz.
    return { error: 'Makale eklenirken bir hata oluştu (Aynı başlıklı bir yazı zaten olabilir).', success: false };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  redirect(`/yazi/${slug}`);
}

export async function updateArticle(id: string, prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const categoryId = formData.get('category_id') as string;

  if (!title || !content || !categoryId) {
    return { error: 'Lütfen tüm alanları doldurun.', success: false };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Bu işlem için giriş yapmalısınız.', success: false };
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin' && profile.role !== 'dede')) {
    return { error: 'Yetkisiz işlem. Makale güncelleme yetkiniz yok.', success: false };
  }

  const slug = generateSlug(title);

  const { error } = await supabase
    .from('posts')
    .update({
      title: title.trim(),
      slug: slug,
      content: content.trim(),
      category_id: categoryId,
    })
    .eq('id', id);

  if (error) {
    console.error('Makale güncelleme hatası:', error);
    return { error: 'Makale güncellenirken bir hata oluştu (Aynı başlıklı bir yazı zaten olabilir).', success: false };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  redirect(`/yazi/${slug}`);
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Bu işlem için giriş yapmalısınız.', success: false };
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin' && profile.role !== 'dede')) {
    return { error: 'Yetkisiz işlem. Makale silme yetkiniz yok.', success: false };
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);
  
  if (error) {
    console.error('Makale silme hatası:', error);
    return { error: 'Makale silinirken bir hata oluştu.', success: false };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function unlockAdminPanel(pin: string) {
  const supabase = await createClient();
  
  // Önce DB'den oku
  const { data } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'admin_pin').single();
  
  const secret = data?.setting_value || process.env.ADMIN_SECRET || '1453'; // DB'de yoksa env veya 1453'e dön
  
  if (pin === secret) {
    const cookieStore = await cookies();
    cookieStore.set('admin_unlocked', 'true', { 
      maxAge: 60 * 60 * 2, // 2 saat geçerli
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/admin'
    });
    revalidatePath('/admin');
    return { success: true };
  }
  
  return { success: false, error: 'Hatalı şifre girdiniz.' };
}

export async function updateAdminPin(newPin: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Oturum açmadınız.' };

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') {
    return { error: 'Yetkiniz yok. Sadece yöneticiler şifre değiştirebilir.' };
  }

  const adminClient = createAdminClient();

  // site_settings tablosunda admin_pin'i upsert (ekle veya güncelle) yap
  const { error } = await adminClient
    .from('site_settings')
    .upsert(
      { setting_key: 'admin_pin', setting_value: newPin },
      { onConflict: 'setting_key' }
    );

  if (error) {
    return { error: 'Şifre güncellenirken bir hata oluştu: ' + error.message };
  }

  revalidatePath('/admin/ayarlar');
  return { success: true };
}

export async function deleteComment(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Bu işlem için giriş yapmalısınız.', success: false };
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin')) {
    return { error: 'Yetkisiz işlem. Editör yetkisine sahip olmalısınız.', success: false };
  }

  const { error } = await supabase.from('comments').delete().eq('id', id);
  
  if (error) {
    console.error('Yorum silme hatası:', error);
    return { error: 'Yorum silinirken bir hata oluştu.', success: false };
  }

  revalidatePath('/admin');
  revalidatePath('/yazi/[slug]', 'page');
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Oturum açmadınız.' };

  // Sadece admin yetki değiştirebilir
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') {
    return { error: 'Yetkiniz yok. Sadece yöneticiler rol değiştirebilir.' };
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    return { error: 'Yetki güncellenirken bir hata oluştu: ' + error.message };
  }

  revalidatePath('/admin/uyeler');
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Oturum açmadınız.' };

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') {
    return { error: 'Yetkiniz yok. Sadece yöneticiler üye silebilir.' };
  }

  const adminClient = createAdminClient();

  // 1. Auth veritabanından tamamen sil (Auth admin API)
  const { error: authError } = await adminClient.auth.admin.deleteUser(userId);
  
  if (authError) {
    return { error: 'Kullanıcı silinirken hata oluştu: ' + authError.message };
  }

  // Not: public.profiles tablosundaki satır, PostgreSQL CASCADE ayarlıysa veya 
  // auth trigger'ları düzgün çalışıyorsa otomatik silinir. 
  // Garanti olsun diye manuel de silebiliriz:
  await adminClient.from('profiles').delete().eq('id', userId);

  revalidatePath('/admin/uyeler');
  return { success: true };
}
