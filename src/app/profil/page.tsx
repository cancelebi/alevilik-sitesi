import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileSettings from '@/components/ProfileSettings';

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: comments } = await supabase
    .from('comments')
    .select('*, posts(title, slug)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*, posts(title, slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-parchment font-sans text-dark flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl w-full mx-auto px-5 md:px-10 py-32">
        <h1 className="text-4xl font-serif text-dark mb-2">Profilim</h1>
        <p className="text-dark-dim text-sm mb-10">Kişisel bilgilerinizi ve toplulukla olan etkileşimlerinizi buradan yönetin.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sol: Kullanıcı Bilgileri */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-line-light shadow-sm">
              <div className="w-20 h-20 bg-copper/10 rounded-full flex items-center justify-center text-copper text-3xl font-serif mb-4 mx-auto">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold text-center mb-1">{profile?.username || 'İsimsiz Kullanıcı'}</h2>
              <p className="text-dark-dim text-xs text-center mb-6">{user.email}</p>

              <div className="space-y-4">
                <div className="bg-parchment p-3 rounded text-sm text-center">
                  <span className="block text-dark-dim text-xs uppercase tracking-wider mb-1">Rol</span>
                  <span className="font-semibold capitalize text-copper">{profile?.role || 'Üye'}</span>
                </div>
              </div>
            </div>
            
            <ProfileSettings currentEmail={user.email || ''} />
          </div>

          {/* Sağ: Aktiviteler (Yorumlar) */}
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl border border-line-light shadow-sm">
              <h3 className="text-xl font-serif mb-6 border-b border-line-light pb-4">Son Yorumlarım</h3>
              
              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="p-4 bg-parchment/50 rounded-lg border border-line-light hover:bg-parchment/80 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/yazi/${comment.posts?.slug}`} className="font-semibold text-bordo hover:underline">
                          {comment.posts?.title}
                        </Link>
                        <span className="text-xs text-dark-dim font-mono">{new Date(comment.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <p className="text-sm text-dark line-clamp-2">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-parchment/50 rounded-lg border border-line-light border-dashed">
                  <p className="text-dark-dim italic text-sm">Henüz hiç yorum yapmamışsınız.</p>
                  <Link href="/" className="inline-block mt-3 text-copper text-sm hover:underline font-semibold">Makaleleri keşfedin</Link>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-line-light shadow-sm mt-8">
              <h3 className="text-xl font-serif mb-6 border-b border-line-light pb-4 flex items-center gap-2">
                <span>🔖</span> Kaydedilen Yazılar
              </h3>
              
              {bookmarks && bookmarks.length > 0 ? (
                <div className="space-y-4">
                  {bookmarks.map((bookmark: any) => (
                    <div key={bookmark.id} className="p-4 bg-parchment/50 rounded-lg border border-line-light hover:bg-parchment/80 transition-colors flex justify-between items-center">
                      <Link href={`/yazi/${bookmark.posts?.slug}`} className="font-semibold text-bordo hover:underline">
                        {bookmark.posts?.title}
                      </Link>
                      <span className="text-xs text-dark-dim font-mono bg-white px-2 py-1 rounded">{new Date(bookmark.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-parchment/50 rounded-lg border border-line-light border-dashed">
                  <p className="text-dark-dim italic text-sm">Henüz hiçbir yazıyı kaydetmediniz.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
