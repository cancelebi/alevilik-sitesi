import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import CategoryCarousel from '@/components/CategoryCarousel';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch categories
  const { data: categories } = await supabase.from('categories').select('*').order('created_at');

  // Fetch all articles (we'll split them into featured and latest)
  const { data: articles } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (username, role),
      categories:category_id (title, slug),
      likes (id),
      bookmarks (id)
    `)
    .eq('type', 'article')
    .order('created_at', { ascending: false })
    .limit(8);

  const featuredArticles = articles ? articles.slice(0, 3) : [];
  const latestArticles = articles ? articles.slice(3) : [];

  // Fetch columnists (Dedeler)
  const { data: columnists } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'dede')
    .limit(4);

  // Fetch latest forum threads
  const { data: forumThreads } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (username, role),
      comments (id)
    `)
    .eq('type', 'forum_thread')
    .order('created_at', { ascending: false })
    .limit(5);

  // Popular Articles (Just taking some latest for now, ideally ordered by views or likes)
  const popularArticles = articles ? [...articles].sort((a, b) => b.likes.length - a.likes.length).slice(0, 5) : [];

  // User bookmarks
  let bookmarkedPosts: any[] = [];
  if (user) {
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select(`
        post_id,
        posts:post_id (title, slug)
      `)
      .eq('user_id', user.id)
      .limit(5);
    bookmarkedPosts = bookmarks || [];
  }

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <Navbar />

      <main className="bg-[#0b1012] min-h-screen text-light font-sans pt-20">
        
        {/* 1. HERO SECTION */}
        <section className="relative w-full min-h-[450px] md:min-h-[550px] flex items-center border-b border-line-light/10 py-16">
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Arka plan resmi - Semah veya mistik bir görsel placeholder */}
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none" 
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?q=80&w=2070&auto=format&fit=crop")' }}
            />
            {/* Soldan sağa doğru kararan gradient (Yazıların okunması için) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1012] via-[#0b1012]/80 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1012] via-transparent to-transparent pointer-events-none" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col items-start pt-6">
            <div className="text-gold text-[10px] font-mono uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
              <div className="w-6 h-px bg-gold/70"></div>
              <span>Yol bir, sürek binbir</span>
              <div className="w-6 h-px bg-gold/70"></div>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-[52px] font-serif text-white leading-[1.1] max-w-2xl tracking-tight">
              Alevilik'i <span className="text-gold italic font-medium">anlamak</span>, <br />
              birlikte konuşmak için <br />
              bir yol
            </h1>
            
            <p className="mt-5 text-light-dim text-xs md:text-sm max-w-lg leading-[1.7]">
              Tarihten cem geleneğine, deyişlerden güncel yaşama — kaynağı gösterilmiş bilgiler ve herkesin katılabildiği bir sohbet alanı.
            </p>
            
            <div className="mt-8 flex gap-3 flex-wrap">
              <a href="#yazilar" className="bg-gold/90 text-ink px-6 py-2.5 rounded font-bold hover:bg-gold transition-colors text-xs shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                İçeriği Keşfet
              </a>
              <Link href="/forum" className="bg-ink/50 backdrop-blur-sm border border-line-light/30 text-white px-6 py-2.5 rounded font-semibold hover:border-gold hover:text-gold transition-colors text-xs">
                Topluluğa Katıl
              </Link>
            </div>
          </div>
        </section>

        {/* 2. KATEGORİ ÇUBUĞU (YENİ ARROW COMPONENT) */}
        <section className="border-b border-line-light/5 bg-[#0b1012] relative z-[60]">
          <CategoryCarousel categories={categories || []} />
        </section>

        {/* 3. İKİLİ SÜTUN YAPI (MAIN GRID) */}
        <section id="yazilar" className="max-w-7xl mx-auto px-6 md:px-12 py-16 flex flex-col lg:flex-row gap-16">
          
          {/* SOL SÜTUN (%65) */}
          <div className="lg:w-[65%] flex flex-col gap-16">
            
            {/* Öne Çıkan Yazılar */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif text-white flex items-center gap-4">
                  <div className="w-6 h-px bg-gold/50"></div>
                  Öne Çıkan Yazılar
                </h2>
                <Link href="/kose-yazilari" className="text-[11px] text-gold hover:underline font-semibold uppercase tracking-widest">Tümünü Gör &rarr;</Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.map((article, idx) => {
                  // Sahte görseller (Mistik / Tarihi temalı)
                  const placeholderImages = [
                    'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop', // Kapadokya tarzı tarihi
                    'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop', // Mistik
                    'https://images.unsplash.com/photo-1460039230329-eb070fc6c90c?q=80&w=800&auto=format&fit=crop'  // Saz / Enstrüman benzeri
                  ];
                  
                  return (
                    <Link href={`/yazi/${article.slug}`} key={article.id} className="group bg-[#12181b] rounded-2xl border border-line-light/5 overflow-hidden hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full shadow-lg">
                      {/* Görsel */}
                      <div className="h-48 w-full relative overflow-hidden bg-ink">
                        <img 
                          src={placeholderImages[idx % 3]} 
                          alt="Makale görseli" 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12181b] via-transparent to-transparent opacity-80"></div>
                        <span className="absolute bottom-3 left-3 bg-[#0b1012]/80 backdrop-blur-md text-gold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded border border-gold/20">
                          {article.categories?.title || 'Makale'}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-serif text-white/90 text-lg leading-snug group-hover:text-gold transition-colors mb-3 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-[13px] text-light-dim/70 leading-relaxed line-clamp-2 mb-5 flex-grow">
                          {article.content.replace(/<[^>]+>/g, '')}
                        </p>
                        <div className="flex justify-between items-center text-[11px] text-light-dim/80 font-mono">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-copper to-bordo flex items-center justify-center text-white font-bold text-[9px]">
                              {article.profiles?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span>{article.profiles?.username || 'Anonim'}</span>
                          </div>
                          <span>{formatDate(article.created_at)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Son Eklenen Yazılar (Liste) */}
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-serif text-white flex items-center gap-4">
                  <div className="w-6 h-px bg-gold/50"></div>
                  Son Eklenen Yazılar
                </h2>
                <Link href="/kose-yazilari" className="text-[11px] text-gold hover:underline font-semibold uppercase tracking-widest">Tümünü Gör &rarr;</Link>
              </div>
              
              <div className="flex flex-col gap-4">
                {latestArticles.map((article, idx) => (
                  <Link href={`/yazi/${article.slug}`} key={article.id} className="group flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-xl hover:bg-[#12181b] transition-colors border-b border-line-light/5 last:border-0">
                    <div className="flex items-center gap-4 w-full sm:w-1/2 mb-3 sm:mb-0">
                      <div className="w-16 h-12 bg-ink-2 rounded border border-line-light/10 flex-shrink-0 overflow-hidden relative">
                         <img src={`https://source.unsplash.com/random/100x100?mystic,history&sig=${idx}`} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all" alt="" />
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[9px] bg-bordo/10 text-copper px-1.5 py-0.5 rounded border border-bordo/20 uppercase tracking-widest font-bold">
                          {article.categories?.title || 'Güncel'}
                        </span>
                        <h4 className="text-[15px] font-medium text-white/90 group-hover:text-gold transition-colors truncate w-[200px] md:w-[250px]">
                          {article.title}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-1/2 text-[11px] text-light-dim font-mono">
                      <div className="flex items-center gap-2 w-32 truncate">
                        <div className="w-5 h-5 rounded-full bg-parchment/10 flex items-center justify-center text-[9px] text-white/50">{article.profiles?.username?.charAt(0).toUpperCase()}</div>
                        {article.profiles?.username || 'Anonim'}
                      </div>
                      <div className="w-24 text-right text-light-dim/60">{formatDate(article.created_at)}</div>
                      <div className="flex gap-4 text-light-dim/40 w-20 justify-end group-hover:text-gold/60 transition-colors">
                        <span className="flex items-center gap-1">♡ {article.likes?.length || 0}</span>
                        <span className="flex items-center gap-1">🔖 {article.bookmarks?.length || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Köşe Yazarlarımız */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-white flex items-center gap-3">
                  <div className="w-4 h-px bg-gold"></div>
                  Köşe Yazarlarımız
                </h2>
                <Link href="/kose-yazilari" className="text-xs text-gold hover:underline font-semibold uppercase tracking-wider">Tümünü Gör &rarr;</Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {columnists && columnists.map((author) => (
                  <div key={author.id} className="bg-ink p-5 rounded-xl border border-line-light/10 text-center flex flex-col items-center hover:border-gold/30 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gold to-copper mb-3 flex items-center justify-center text-ink font-serif text-2xl font-bold shadow-lg shadow-gold/20">
                      {author.username?.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="text-white font-serif text-sm mb-1">{author.username}</h4>
                    <span className="text-[10px] text-light-dim uppercase tracking-wider mb-4">Dede / Yazar</span>
                    <Link href={`/uye/${author.username}`} className="text-xs border border-line-light/20 text-gold px-4 py-1.5 rounded hover:bg-gold/10 transition-colors w-full">
                      Yazıları Gör
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* SAĞ SÜTUN (%35) */}
          <div className="lg:w-[35%] flex flex-col gap-10">
            
            {/* Topluluk Alanı Banner */}
            <div className="bg-gradient-to-br from-ink-2 to-[#1a1410] p-6 rounded-xl border border-gold/10 shadow-lg relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-gold/5 rounded-full blur-2xl pointer-events-none"></div>
              <h3 className="text-xl font-serif text-white mb-2 relative z-10">Topluluk Alanı</h3>
              <p className="text-sm text-light-dim mb-5 relative z-10">Sorular sor, fikirlerini paylaş, birlikte öğrenelim.</p>
              
              <div className="flex items-center gap-4 relative z-10">
                <Link href="/forum" className="bg-gold text-ink px-5 py-2.5 rounded font-bold text-sm hover:bg-gold-light transition-colors shadow-lg shadow-gold/20 flex items-center gap-2">
                  Foruma Git &rarr;
                </Link>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-copper border-2 border-ink flex items-center justify-center text-[10px]">{i}</div>)}
                </div>
              </div>
            </div>

            {/* Son Forum Konuları */}
            <div>
              <div className="flex justify-between items-center mb-5 border-b border-line-light/10 pb-3">
                <h3 className="text-lg font-serif text-white">Son Forum Konuları</h3>
                <Link href="/forum" className="text-[10px] text-gold hover:underline uppercase tracking-wider">Tümünü Gör &rarr;</Link>
              </div>
              
              <div className="flex flex-col gap-4">
                {forumThreads && forumThreads.map((thread) => (
                  <Link href={`/forum/${thread.slug}`} key={thread.id} className="group flex gap-3 items-start hover:bg-ink/30 p-2 -mx-2 rounded transition-colors">
                    <div className="w-8 h-8 rounded-full bg-ink-2 border border-line-light/20 flex items-center justify-center flex-shrink-0 text-xs text-white">
                      {thread.profiles?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm text-white/90 group-hover:text-gold transition-colors line-clamp-1 mb-1">{thread.title}</h4>
                      <div className="flex items-center justify-between text-[10px] font-mono text-light-dim">
                        <span>{thread.profiles?.username || 'Anonim'} • {formatDate(thread.created_at)}</span>
                        <span className="flex items-center gap-1">💬 {thread.comments?.length || 0}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* En Çok Okunanlar */}
            <div>
              <div className="flex justify-between items-center mb-5 border-b border-line-light/10 pb-3">
                <h3 className="text-lg font-serif text-white">En Çok Okunanlar</h3>
                <Link href="/kose-yazilari" className="text-[10px] text-gold hover:underline uppercase tracking-wider">Tümünü Gör &rarr;</Link>
              </div>
              
              <div className="flex flex-col gap-3">
                {popularArticles.map((article, idx) => (
                  <Link href={`/yazi/${article.slug}`} key={article.id} className="group flex items-center gap-4 hover:bg-ink/30 p-2 -mx-2 rounded transition-colors">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx < 3 ? 'bg-gold text-ink' : 'bg-ink-2 text-light-dim border border-line-light/20'}`}>
                      {idx + 1}
                    </div>
                    <h4 className="text-sm text-white/80 group-hover:text-gold transition-colors line-clamp-1 flex-grow">
                      {article.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>

            {/* Kaydettiklerim */}
            <div>
              <div className="flex justify-between items-center mb-5 border-b border-line-light/10 pb-3">
                <h3 className="text-lg font-serif text-white">Kaydettiklerim</h3>
                <Link href="/profil" className="text-[10px] text-gold hover:underline uppercase tracking-wider">Tümünü Gör &rarr;</Link>
              </div>
              
              <div className="flex flex-col gap-3">
                {user ? (
                  bookmarkedPosts.length > 0 ? (
                    bookmarkedPosts.map((bookmark) => (
                      <Link href={`/yazi/${bookmark.posts.slug}`} key={bookmark.post_id} className="group flex items-center justify-between hover:bg-ink/30 p-2 -mx-2 rounded transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 bg-ink-2 rounded border border-line-light/10 flex-shrink-0"></div>
                          <h4 className="text-sm text-white/80 group-hover:text-gold transition-colors line-clamp-1">{bookmark.posts.title}</h4>
                        </div>
                        <span className="text-gold opacity-50 group-hover:opacity-100">🔖</span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-light-dim italic p-2">Henüz yazı kaydetmediniz.</p>
                  )
                ) : (
                  <div className="bg-ink-2 p-4 rounded text-center border border-line-light/10">
                    <p className="text-xs text-light-dim mb-3">Kaydettiklerinizi görmek için giriş yapın.</p>
                    <Link href="/auth" className="text-xs bg-line-light/10 text-white px-4 py-1.5 rounded hover:bg-line-light/20 transition-colors">Giriş Yap</Link>
                  </div>
                )}
              </div>
            </div>

          </div>

        </section>
        
      </main>

      <Footer />
    </>
  );
}
