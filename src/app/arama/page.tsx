import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';
  const supabase = await createClient();

  let posts = [];
  
  if (query.trim().length > 0) {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles:author_id(username), categories:category_id(title, slug)')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });
      
    posts = data || [];
  }

  return (
    <div className="min-h-screen bg-parchment font-sans text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-5 md:px-10 py-32">
        <h1 className="text-4xl font-serif text-dark mb-2">Arama Sonuçları</h1>
        <p className="text-dark-dim text-sm mb-10">
          "<strong className="text-dark">{query}</strong>" için arama yaptınız.
        </p>

        {query.trim().length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-line-light shadow-sm">
            <p className="text-dark-dim italic">Lütfen bir arama terimi girin.</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post: any) => (
              <div key={post.id} className="bg-white p-6 rounded-xl border border-line-light shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 text-xs font-mono text-dark-dim mb-3">
                  <span className={`px-2 py-1 rounded text-white ${post.type === 'article' ? 'bg-copper' : 'bg-bordo'}`}>
                    {post.type === 'article' ? 'Makale' : 'Forum'}
                  </span>
                  <span>{post.categories?.title}</span>
                  <span className="w-1 h-1 bg-line-dark rounded-full"></span>
                  <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                
                <h2 className="text-2xl font-serif mb-2">
                  <Link href={`/yazi/${post.slug}`} className="text-dark hover:text-copper transition-colors">
                    {post.title}
                  </Link>
                </h2>
                
                {/* Metni temizle ve ilk 120 karakteri göster */}
                <p className="text-dark-dim text-sm line-clamp-2 leading-relaxed">
                  {post.content.replace(/<[^>]+>/g, '').substring(0, 200)}...
                </p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-dark-dim flex items-center gap-1">
                    👤 <Link href={`/uye/${post.profiles?.username}`} className="hover:underline">{post.profiles?.username}</Link>
                  </span>
                  <Link href={`/yazi/${post.slug}`} className="text-copper text-xs font-semibold hover:underline">
                    Devamını Oku →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-line-light shadow-sm border-dashed">
            <span className="text-4xl block mb-4">🔍</span>
            <h3 className="text-lg font-serif mb-2">Sonuç Bulunamadı</h3>
            <p className="text-dark-dim text-sm max-w-sm mx-auto">
              Aradığınız kelimeye uygun bir makale veya forum konusu bulamadık. Başka bir kelimeyle tekrar deneyebilirsiniz.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
