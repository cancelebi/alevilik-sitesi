import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import CommentForm from '@/components/CommentForm';
import EngagementButtons from '@/components/EngagementButtons';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('posts')
    .select('title, content')
    .eq('slug', slug)
    .single();

  if (!article) {
    return { title: 'Yazı Bulunamadı' };
  }

  // HTML etiketlerini temizle ve ilk 150 karakteri al
  const plainTextContent = article.content.replace(/<[^>]+>/g, '');
  const description = plainTextContent.length > 150 
    ? plainTextContent.substring(0, 150) + '...' 
    : plainTextContent;

  return {
    title: article.title,
    description: description,
    openGraph: {
      title: article.title,
      description: description,
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Makaleyi slug'a göre, yazarı ve kategorisi ile birlikte getir
  const { data: article } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (username),
      categories:category_id (title, slug),
      likes (id, user_id),
      bookmarks (id, user_id)
    `)
    .eq('slug', slug)
    .eq('type', 'article')
    .single();

  if (!article) {
    notFound();
  }

  // 2. Yorumları getir (Bu post'a ait)
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:author_id (username, role)
    `)
    .eq('post_id', article.id)
    .order('created_at', { ascending: true });

  const isLikedInitially = user ? article.likes.some((like: any) => like.user_id === user.id) : false;
  const isBookmarkedInitially = user ? article.bookmarks.some((bookmark: any) => bookmark.user_id === user.id) : false;
  const likesCount = article.likes.length;

  return (
    <>
      <Navbar />

      <main className="bg-parchment min-h-screen pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-5 md:px-10">
          
          {/* Üst Kısım: Kategori ve Tarih */}
          <header className="mb-10 text-center">
            {article.categories && (
              <a href={`/kategori/${article.categories.slug}`} className="inline-block eyebrow mb-5 text-copper before:bg-copper after:bg-copper after:content-[''] after:w-4 after:h-px after:inline-block">
                {article.categories.title}
              </a>
            )}
            <h1 className="text-[clamp(32px,5vw,52px)] font-serif text-dark leading-tight mb-6">
              {article.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-dark-dim text-sm mt-4 font-mono">
              <div className="flex items-center gap-4 mb-2 sm:mb-0">
                <span className="flex items-center gap-1">
                  <span className="w-5 h-5 bg-parchment-2 rounded-full flex items-center justify-center text-xs">👤</span>
                  <a href={`/uye/${article.profiles?.username || 'anonim'}`} className="hover:text-copper hover:underline">{article.profiles?.username || 'Anonim'}</a>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-5 h-5 bg-parchment-2 rounded-full flex items-center justify-center text-xs">📅</span>
                  {new Date(article.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <span className="bg-parchment-2 px-3 py-1 rounded text-dark text-xs uppercase tracking-wider font-semibold border border-line-light">
                {article.categories?.title}
              </span>
            </div>
            
            <EngagementButtons 
              postId={article.id} 
              initialLikes={likesCount} 
              isLikedInitially={isLikedInitially} 
              isBookmarkedInitially={isBookmarkedInitially} 
              userId={user?.id}
            />
          </header>

          {/* İçerik */}
          {/* Not: Gerçek projede 'dangerouslySetInnerHTML' kullanılırken güvenlik (XSS) önlemleri alınmalıdır. */}
          <div 
            className="tiptap text-dark/80 text-lg leading-relaxed mb-16"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Yorumlar Bölümü */}
          <section className="border-t border-line-dark pt-12 mt-12">
            <h3 className="text-2xl font-serif text-dark mb-8">Yorumlar ({comments?.length || 0})</h3>
            
            <div className="space-y-6 mb-12">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-6 rounded border border-line-light shadow-sm">
                    <div className="flex justify-between items-center mb-3 text-xs font-mono">
                      <span className="font-semibold text-copper">{comment.profiles?.username || 'Anonim'}</span>
                      <span className="text-dark-dim">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <p className="text-dark text-sm leading-relaxed">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-dark-dim text-sm italic">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
              )}
            </div>

            {/* Yorum Ekleme Formu */}
            <CommentForm postId={article.id} slug={article.slug} isLoggedIn={!!user} />
          </section>

        </article>
      </main>

      <Footer />
    </>
  );
}
