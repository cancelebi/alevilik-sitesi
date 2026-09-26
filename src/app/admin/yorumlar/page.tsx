import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DeleteCommentButton from '@/components/DeleteCommentButton';

export default async function AdminCommentsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin')) {
    redirect('/');
  }

  const { data: comments } = await supabase
    .from('comments')
    .select(`*, profiles:author_id (username), posts:post_id (title, slug)`)
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="mb-8 border-b border-line-dark pb-6">
        <h1 className="text-3xl font-serif text-dark mb-1">Yorum Yönetimi</h1>
        <p className="text-dark-dim text-sm">Kullanıcıların site genelinde yaptığı yorumlar.</p>
      </div>

      <div className="bg-white rounded-xl border border-line-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-parchment/50 text-dark font-serif text-sm border-b border-line-light">
                <th className="px-6 py-4">Kullanıcı</th>
                <th className="px-6 py-4">İçerik</th>
                <th className="px-6 py-4">Yazı/Konu</th>
                <th className="px-6 py-4 text-right">Tarih</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <tr key={comment.id} className="border-b border-line-light hover:bg-parchment/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-dark whitespace-nowrap">
                      {comment.profiles?.username || 'Anonim'}
                    </td>
                    <td className="px-6 py-4 text-dark-dim max-w-[200px] md:max-w-md truncate">
                      {comment.content}
                    </td>
                    <td className="px-6 py-4 text-dark-dim">
                      <Link href={`/yazi/${comment.posts?.slug}`} className="hover:text-copper underline text-xs font-medium">
                        {comment.posts?.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-dark-dim font-mono text-xs whitespace-nowrap">
                      {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      <DeleteCommentButton id={comment.id} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-dark-dim italic">
                    Henüz yorum yapılmamış.
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
