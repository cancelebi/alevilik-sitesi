import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminArticleForm from '@/components/AdminArticleForm';
import { updateArticle } from '@/app/actions/admin';
import Link from 'next/link';

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin')) {
    redirect('/');
  }

  // Kategorileri çek
  const { data: categories } = await supabase.from('categories').select('*').order('title');

  // Makaleyi çek
  const { data: article } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) {
    redirect('/admin');
  }

  const updateAction = updateArticle.bind(null, id);

  return (
    <>
      <div className="mb-8 border-b border-line-dark pb-6">
        <Link href="/admin" className="text-copper hover:underline text-sm mb-4 inline-block">← Panele Dön</Link>
        <h1 className="text-3xl font-serif text-dark mb-1">Makaleyi Düzenle</h1>
        <p className="text-dark-dim text-sm">Mevcut makalenizi buradan güncelleyebilirsiniz.</p>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-xl border border-line-light shadow-sm">
        <AdminArticleForm 
          categories={categories || []} 
          initialData={article} 
          action={updateAction} 
        />
      </div>
    </>
  );
}
