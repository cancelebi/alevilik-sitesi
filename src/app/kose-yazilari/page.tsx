import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Köşe Yazıları & Dualar | Oruç',
  description: 'İnanç önderlerimizin ve dedelerimizin kaleminden dökülen dualar, nefesler ve güncel yazılar.',
};

export default async function KoseYazilariPage() {
  const supabase = await createClient();

  // Köşe Yazıları kategorisinin bilgilerini çek
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', 'kose-yazilari')
    .single();

  // Bu kategoriye ait yayımlanmış makaleleri çek (yazarı dede veya admin olan)
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles:author_id(username, role)')
    .eq('category_id', category?.id)
    .eq('type', 'article')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0b1012] font-sans text-light flex flex-col pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full h-[300px] flex items-center border-b border-line-light/10">
        <div className="absolute inset-0 z-0 bg-ink">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none">
             <svg viewBox="-200 -200 400 400" className="w-full h-full">
               <circle cx="0" cy="0" r="140" fill="none" stroke="var(--color-gold)" strokeWidth="1" />
             </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1012] to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="text-gold text-[10px] font-mono uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-4">
            <div className="w-6 h-px bg-gold/70"></div>
            <span>İnanç Önderlerimizden</span>
            <div className="w-6 h-px bg-gold/70"></div>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-4 leading-tight">
            Köşe Yazıları <span className="italic text-gold font-medium">&</span> Dualar
          </h1>
          <p className="text-light-dim text-sm md:text-base max-w-2xl mx-auto">
            Dedelerimizin kaleminden dökülen nefesler, haftalık öğütler ve güncel yorumlar.
          </p>
        </div>
      </section>

      {/* Yazılar Listesi */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 md:px-12 py-16">
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any, idx: number) => (
              <Link href={`/yazi/${post.slug}`} key={post.id} className="group bg-[#12181b] rounded-2xl border border-line-light/5 overflow-hidden hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full shadow-lg">
                <div className="h-48 w-full relative overflow-hidden bg-ink">
                  <img 
                    src={`https://source.unsplash.com/random/800x600?anatolian,history&sig=${idx}`} 
                    alt="Görsel" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12181b] via-transparent to-transparent opacity-90"></div>
                  <span className="absolute top-4 right-4 bg-ink/80 backdrop-blur-md text-gold text-[9px] uppercase tracking-wider px-3 py-1.5 rounded border border-gold/20">
                    {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-serif text-white/90 group-hover:text-gold transition-colors mb-3 leading-snug line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-[13px] text-light-dim/70 leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {post.content.replace(/<[^>]+>/g, '')}
                  </p>
                  
                  <div className="flex justify-between items-center text-[11px] text-light-dim/80 font-mono border-t border-line-light/10 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-copper to-bordo flex items-center justify-center text-white font-bold text-[10px]">
                        {post.profiles?.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white/80">{post.profiles?.username}</span>
                    </div>
                    <span className="text-gold group-hover:translate-x-1 transition-transform">Tümünü Oku &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#12181b] rounded-2xl border border-line-light/5 border-dashed">
            <span className="text-4xl block mb-4 opacity-50">✍️</span>
            <h3 className="text-xl font-serif text-white/90 mb-2">Henüz yazı bulunmuyor</h3>
            <p className="text-light-dim/60 text-sm">Dedelerimiz henüz bu bölüme yazı eklememiş. Daha sonra tekrar kontrol edin.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
