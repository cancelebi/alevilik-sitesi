'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const BAD_WORDS = [
  'küfür', 'argo', 'salak', 'aptal', 'gerizekalı'
];

// Metni URL'e uygun hale getiren basit bir fonksiyon (Slugify)
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
    .replace(/[^a-z0-9 -]/g, '') // Harf, rakam, boşluk ve tire dışındakileri sil
    .replace(/\s+/g, '-') // Boşlukları tire yap
    .replace(/-+/g, '-'); // Birden fazla tireyi tek tireye indir
}

export async function createForumThread(prevState: any, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const categoryId = formData.get('category_id') as string;

  if (!title || !content || !categoryId) {
    return { error: 'Lütfen tüm alanları doldurun.', success: false };
  }

  // Küfür / Argo Kontrolü
  const lowerContent = content.toLowerCase() + " " + title.toLowerCase();
  for (const word of BAD_WORDS) {
    if (lowerContent.includes(word)) {
      return { 
        error: 'Başlık veya içeriğiniz topluluk kurallarına aykırı (argo/küfür) kelimeler içeriyor. Lütfen düzelterek tekrar deneyin.', 
        success: false 
      };
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Konu açmak için giriş yapmalısınız.', success: false };
  }

  // --- Profil Yaması ---
  const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      username: user.user_metadata?.username || `kullanici_${user.id.substring(0, 6)}`
    });
  }
  // ---------------------

  // Benzersiz bir slug üret (Başlık + rastgele sayı)
  const baseSlug = generateSlug(title);
  const uniqueSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;

  // Veritabanına Ekle (type = 'forum_thread')
  const { error } = await supabase
    .from('posts')
    .insert({
      title: title.trim(),
      slug: uniqueSlug,
      content: content.trim(),
      type: 'forum_thread',
      is_published: true, // Forum yazıları direkt yayınlansın
      category_id: categoryId,
      author_id: user.id
    });

  if (error) {
    console.error('Konu açma hatası:', error);
    return { error: 'Konu açılırken bir hata oluştu. Lütfen tekrar deneyin.', success: false };
  }

  // Başarılıysa forum anasayfasını yenile ve yeni açılan konuya yönlendir
  revalidatePath('/forum');
  redirect(`/forum/${uniqueSlug}`);
}
