import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  // `params` objesi asenkron değildir ancak Next.js 15+ sürümlerinde Promise tabanlı çalışmaya hazırlanmaktadır.
  // Bu nedenle bazen await params gerekebilir ancak standart Next.js App Router'da params doğrudan kullanılır.
  const { slug } = await params;
  
  const supabase = await createClient();

  // 1. Kategoriyi slug'a göre getir
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) {
    notFound(); // Eğer kategori yoksa 404 sayfasına yönlendir
  }

  // 2. Bu kategoriye ait "yayınlanmış makaleleri" getir
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(username)')
    .eq('category_id', category.id)
    .eq('type', 'article')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />

      {/* ---------- CATEGORY HERO ---------- */}
      <section className="bg-ink text-light px-5 md:px-10 pt-32 pb-20 text-center border-b border-line-light">
        <div className="max-w-3xl mx-auto">
          <div className="eyebrow justify-center mb-5 text-gold before:bg-gold after:bg-gold after:content-[''] after:w-4 after:h-px after:inline-block">Kategori</div>
          <h1 className="text-4xl md:text-5xl font-serif text-light mb-6">{category.title}</h1>
          <p className="text-lg text-light-dim leading-relaxed max-w-2xl mx-auto">
            {category.description}
          </p>
        </div>
      </section>

      {/* ---------- POSTS LIST ---------- */}
      <section className="px-5 md:px-10 py-20 max-w-5xl mx-auto min-h-[50vh]">
        <div className="flex justify-between items-end mb-10 border-b border-line-dark pb-5">
          <h2 className="text-2xl font-serif text-dark">Makaleler ve İçerikler</h2>
          <span className="text-sm font-mono text-dark-dim">{posts?.length || 0} İçerik bulundu</span>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <a key={post.id} href={`/yazi/${post.slug}`} className="block group">
                <div className="bg-parchment p-8 border border-line-dark hover:bg-parchment-2 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif text-dark mb-3 group-hover:text-bordo transition-colors">{post.title}</h3>
                    <p className="text-dark-dim text-sm line-clamp-3 leading-relaxed mb-6">
                      {/* Metnin sadece düz yazı kısmını kırpıp göstermek için özet yapılabilir, 
                          şimdilik content'i kırpıyoruz. */}
                      {post.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-dark-dim">
                    <span>Yazar: {post.profiles?.username || 'Anonim'}</span>
                    <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-parchment border border-line-dark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 mx-auto text-copper mb-4 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-lg font-serif text-dark mb-2">Henüz içerik eklenmemiş</h3>
            <p className="text-dark-dim text-sm">Bu kategoriye ait makaleler yakında eklenecektir.</p>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
