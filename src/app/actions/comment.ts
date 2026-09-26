'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Basit bir küfür/argo filtresi
const BAD_WORDS = [
  'küfür', 'argo', 'salak', 'aptal', 'gerizekalı', 
  // Gerçek bir sistemde bu liste daha kapsamlı olur veya yapay zeka servisine bağlanır.
];

export async function submitComment(prevState: any, formData: FormData) {
  const content = formData.get('content') as string;
  const postId = formData.get('post_id') as string;
  const slug = formData.get('slug') as string;

  if (!content || content.trim().length === 0) {
    return { error: 'Yorum alanı boş bırakılamaz.', success: false };
  }

  // Küfür / Argo Kontrolü
  const lowerContent = content.toLowerCase();
  for (const word of BAD_WORDS) {
    if (lowerContent.includes(word)) {
      return { 
        error: 'Yorumunuz topluluk kurallarına aykırı (argo/küfür) kelimeler içeriyor. Lütfen düzelterek tekrar deneyin.', 
        success: false 
      };
    }
  }

  const supabase = await createClient();

  // Kullanıcı giriş yapmış mı kontrol et
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Yorum yapmak için giriş yapmalısınız.', success: false };
  }

  // --- Eski hesaplar için (trigger öncesi açılan) profil tamamlama yaması ---
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      username: user.user_metadata?.username || `kullanici_${user.id.substring(0, 6)}`
    });
  }
  // --------------------------------------------------------------------------

  // Yorumu Veritabanına Ekle
  const { error } = await supabase
    .from('comments')
    .insert({
      content: content.trim(),
      post_id: postId,
      author_id: user.id
    });

  if (error) {
    console.error('Yorum ekleme hatası:', error);
    return { error: 'Yorumunuz eklenirken bir hata oluştu. Lütfen tekrar deneyin.', success: false };
  }

  // Sayfayı yenile ve yeni yorumların görünmesini sağla
  revalidatePath(`/yazi/${slug}`);

  return { success: true, error: null };
}
