import AdminArticleForm from '@/components/AdminArticleForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewArticlePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin' && profile.role !== 'dede')) {
    redirect('/');
  }

  const { data: categories } = await supabase.from('categories').select('id, title').order('created_at');

  return (
    <>
      <div className="mb-8 border-b border-line-dark pb-6">
        <h1 className="text-3xl font-serif text-dark mb-1">Yeni Makale Yaz</h1>
        <p className="text-dark-dim text-sm">Kütüphaneye yeni bir içerik kazandırın.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl border border-line-light shadow-sm">
        <AdminArticleForm categories={categories || []} />
      </div>
    </>
  );
}
