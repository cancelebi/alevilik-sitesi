import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DeleteArticleButton from '@/components/DeleteArticleButton';
import Link from 'next/link';
import AdminChart from '@/components/AdminChart';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin' && profile.role !== 'dede')) {
    redirect('/');
  }

  const { data: articles } = await supabase
    .from('posts')
    .select(`*, categories:category_id (title)`)
    .eq('type', 'article')
    .order('created_at', { ascending: false });

  // İstatistikler için sayıları al
  const articleCount = articles?.length || 0;
  
  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });
    
  const { count: forumCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'forum_thread');

  // Grafik verisini oluştur (Kategori bazında makale ve forum sayısını simüle edelim veya çekelim)
  const { data: allPosts } = await supabase
    .from('posts')
    .select('type, categories(title)');
  
  const categoryStats: Record<string, { name: string; makale: number; forum: number }> = {};
  
  if (allPosts) {
    allPosts.forEach((post: any) => {
      const catName = post.categories?.title || 'Diğer';
      if (!categoryStats[catName]) {
        categoryStats[catName] = { name: catName, makale: 0, forum: 0 };
      }
      if (post.type === 'article') categoryStats[catName].makale++;
      if (post.type === 'forum_thread') categoryStats[catName].forum++;
    });
  }

  const chartData = Object.values(categoryStats);

  return (
    <>
      <div className="flex justify-between items-end mb-10 border-b border-line-dark pb-6">
        <div>
          <h1 className="text-3xl font-serif text-dark mb-1">Panele Hoş Geldin</h1>
          <p className="text-dark-dim text-sm">Sitenin genel durumunu ve son eklenen içerikleri buradan takip edebilirsin.</p>
        </div>
        <Link 
          href="/admin/yeni-makale" 
          className="bg-bordo text-light px-5 py-2.5 rounded text-sm font-semibold hover:bg-bordo/90 transition-all shadow-md shadow-bordo/20 whitespace-nowrap flex items-center gap-2"
        >
          <span>✍️</span> Yeni Makale
        </Link>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-line-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-parchment-2 rounded-full flex items-center justify-center text-xl">📄</div>
          <div>
            <p className="text-dark-dim text-xs font-mono uppercase tracking-wider mb-1">Toplam Makale</p>
            <p className="text-3xl font-serif text-dark">{articleCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-line-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-parchment-2 rounded-full flex items-center justify-center text-xl">💬</div>
          <div>
            <p className="text-dark-dim text-xs font-mono uppercase tracking-wider mb-1">Toplam Yorum</p>
            <p className="text-3xl font-serif text-dark">{commentCount || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-line-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-parchment-2 rounded-full flex items-center justify-center text-xl">👥</div>
          <div>
            <p className="text-dark-dim text-xs font-mono uppercase tracking-wider mb-1">Forum Konusu</p>
            <p className="text-3xl font-serif text-dark">{forumCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <AdminChart data={chartData} />
      </div>

      <h2 className="text-xl font-serif text-dark mb-4">Son Eklenen Makaleler</h2>
      <div className="bg-white rounded-xl border border-line-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-parchment/50 text-dark font-serif text-sm border-b border-line-light">
                <th className="px-6 py-4">Başlık</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Tarih</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {articles && articles.length > 0 ? (
                articles.slice(0, 10).map((article) => (
                  <tr key={article.id} className="border-b border-line-light hover:bg-parchment/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-dark">
                      <Link href={`/yazi/${article.slug}`} className="hover:text-bordo transition-colors">
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-dark-dim">
                      <span className="bg-line-dark/5 px-2.5 py-1 rounded text-xs text-dark">{article.categories?.title}</span>
                    </td>
                    <td className="px-6 py-4 text-dark-dim font-mono text-xs">
                      {new Date(article.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/makale-duzenle/${article.id}`} className="text-bordo hover:underline text-xs font-medium mr-4">Düzenle</Link>
                      <Link href={`/yazi/${article.slug}`} className="text-copper hover:underline text-xs font-medium">Görüntüle</Link>
                      <DeleteArticleButton id={article.id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-dark-dim italic">
                    Henüz hiç makale eklenmemiş.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
