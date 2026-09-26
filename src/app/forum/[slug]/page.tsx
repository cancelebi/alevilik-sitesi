import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommentForm from '@/components/CommentForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function ForumThreadPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Forum konusunu getir
  const { data: thread } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (username),
      categories:category_id (title, slug)
    `)
    .eq('slug', slug)
    .eq('type', 'forum_thread')
    .single();

  if (!thread) {
    notFound();
  }

  // 2. Yorumları getir (Bu başlığa ait)
  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(username)')
    .eq('post_id', thread.id)
    .order('created_at', { ascending: true });

  // 3. Kullanıcı giriş yapmış mı kontrol et
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />

      <main className="bg-ink min-h-screen pt-32 pb-20 text-light px-5 md:px-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Soru / Ana Konu */}
          <div className="bg-ink-2 p-8 md:p-10 rounded border border-line-light mb-12">
            <div className="flex items-center gap-4 mb-6">
               {thread.categories && (
                  <span className="font-mono text-xs px-3 py-1.5 border border-line-light rounded-full text-gold">
                    {thread.categories.title}
                  </span>
               )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif mb-6">{thread.title}</h1>
            
            <div className="text-light-dim text-lg leading-relaxed whitespace-pre-wrap mb-8">
              {thread.content}
            </div>
            
            <div className="flex items-center gap-3 text-xs font-mono text-light-dim pt-6 border-t border-line-light">
              <span>Soran: <strong className="text-light">{thread.profiles?.username || 'Anonim'}</strong></span>
              <span className="w-1 h-1 bg-line-light rounded-full"></span>
              <span>{new Date(thread.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Cevaplar (Yorumlar) Bölümü */}
          <section>
            <h3 className="text-2xl font-serif text-light mb-8">Cevaplar ({comments?.length || 0})</h3>
            
            <div className="space-y-6 mb-12">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-ink-2 p-6 rounded border border-line-light shadow-sm">
                    <div className="flex justify-between items-center mb-4 text-xs font-mono border-b border-line-light/50 pb-3">
                      <span className="font-semibold text-gold">{comment.profiles?.username || 'Anonim'}</span>
                      <span className="text-light-dim">{new Date(comment.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-light text-base leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-line-light rounded">
                  <p className="text-light-dim text-sm italic">Henüz cevap yazılmamış. İlk cevabı siz verin!</p>
                </div>
              )}
            </div>

            {/* Yorum Ekleme Formu */}
            {/* Önceden makaleler için yaptığımız CommentForm'u aynen burada da kullanabiliyoruz! */}
            <CommentForm postId={thread.id} slug={thread.slug} isLoggedIn={!!user} />
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}
