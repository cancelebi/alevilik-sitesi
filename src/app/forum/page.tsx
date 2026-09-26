import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function ForumHomePage() {
  const supabase = await createClient();

  // type = 'forum_thread' olan yayınlanmış postları çek
  // Yazar bilgisi ve kategori bilgisi ile birlikte
  const { data: threads } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id (username),
      categories:category_id (title, slug)
    `)
    .eq('type', 'forum_thread')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />
      <main className="bg-ink min-h-screen pt-32 pb-24 text-light px-5 md:px-10">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-line-light pb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif mb-4">Topluluk Forumu</h1>
              <p className="text-light-dim text-lg">Alevilik üzerine sorular sorun, kendi bölgenizin geleneklerini paylaşın ve tartışmalara katılın.</p>
            </div>
            <Link 
              href="/forum/yeni" 
              className="bg-copper text-light px-6 py-3 rounded font-semibold hover:bg-copper-bright transition-colors whitespace-nowrap"
            >
              Yeni Konu Aç
            </Link>
          </div>

          {/* Konular Listesi */}
          {threads && threads.length > 0 ? (
            <div className="flex flex-col gap-px bg-line-light border border-line-light rounded overflow-hidden">
              {threads.map((thread) => (
                <Link key={thread.id} href={`/forum/${thread.slug}`} className="block group">
                  <div className="bg-ink-2 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:bg-ink-3 transition-colors">
                    <div>
                      <h2 className="text-xl font-semibold mb-2 group-hover:text-gold transition-colors">{thread.title}</h2>
                      <div className="font-mono text-xs text-light-dim flex items-center gap-3">
                        <span>Yazar: {thread.profiles?.username || 'Anonim'}</span>
                        <span className="w-1 h-1 bg-line-light rounded-full"></span>
                        <span>{new Date(thread.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    {thread.categories && (
                      <span className="font-mono text-[11px] px-3 py-1.5 border border-line-light rounded-full text-gold whitespace-nowrap">
                        {thread.categories.title}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-ink-2 border border-line-light rounded">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 mx-auto text-gold mb-4 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <h3 className="text-lg font-serif mb-2">Henüz konu açılmamış</h3>
              <p className="text-light-dim text-sm mb-6">İlk soruyu soran siz olun!</p>
              <Link href="/forum/yeni" className="text-copper hover:text-copper-bright underline text-sm">
                Yeni Konu Aç
              </Link>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
