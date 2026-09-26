import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const supabase = await createClient();

  // Yazarın profilini bul
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', decodedUsername)
    .single();

  if (!profile) {
    notFound();
  }

  // Yazarın yayınlanmış makalelerini/forumlarını çek
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(title, slug)')
    .eq('author_id', profile.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  // Yazarın yorumlarını çek
  const { data: comments } = await supabase
    .from('comments')
    .select('*, posts(title, slug)')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10); // Sadece son 10 yorum

  return (
    <div className="min-h-screen bg-parchment font-sans text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-5 md:px-10 py-32">
        <div className="bg-white p-8 rounded-xl border border-line-light shadow-sm mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-parchment-2/50 border-b border-line-light"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-bordo/10 rounded-full flex items-center justify-center text-bordo text-4xl font-serif mx-auto border-4 border-white shadow-sm mb-4">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-serif text-dark mb-1">{profile.username}</h1>
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="bg-line-light px-3 py-1 rounded-full text-dark-dim capitalize font-semibold tracking-wider text-xs">
                {profile.role === 'admin' ? 'Yönetici' : profile.role === 'editor' ? 'Yazar' : 'Üye'}
              </span>
              <span className="text-dark-dim font-mono text-xs">
                Katılım: {new Date(profile.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sol: Makaleler / Konular */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-serif mb-6 border-b border-line-light pb-4 flex items-center gap-2">
              <span>📝</span> {profile.role === 'user' ? 'Açtığı Konular' : 'Yazdığı Makaleler'}
            </h3>
            
            {posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <div key={post.id} className="p-4 bg-white rounded-lg border border-line-light hover:shadow-md transition-all">
                    <Link href={`/yazi/${post.slug}`} className="font-semibold text-dark hover:text-copper block text-lg mb-2">
                      {post.title}
                    </Link>
                    <div className="flex justify-between items-center text-xs text-dark-dim font-mono">
                      <span>{post.categories?.title}</span>
                      <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-line-light border-dashed">
                <p className="text-dark-dim italic text-sm">Henüz içerik yayınlamamış.</p>
              </div>
            )}
          </div>

          {/* Sağ: Son Yorumlar */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-serif mb-6 border-b border-line-light pb-4 flex items-center gap-2">
              <span>💬</span> Son Yorumları
            </h3>
            
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="p-4 bg-parchment/50 rounded-lg border border-line-light">
                    <div className="mb-2 text-xs text-dark-dim">
                      <Link href={`/yazi/${comment.posts?.slug}`} className="font-semibold text-copper hover:underline">
                        {comment.posts?.title}
                      </Link> 
                      {' '}isimli yazıya yorum yaptı:
                    </div>
                    <p className="text-sm text-dark italic border-l-2 border-line-dark pl-3 py-1">"{comment.content}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-parchment/50 rounded-lg border border-line-light border-dashed">
                <p className="text-dark-dim italic text-sm">Henüz yorum yapmamış.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
