import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CategoryForm from './CategoryForm';
import CategoryDeleteButton from './CategoryDeleteButton';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'editor' && profile.role !== 'admin')) {
    redirect('/');
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  return (
    <>
      <div className="mb-8 border-b border-line-dark pb-6">
        <h1 className="text-3xl font-serif text-dark mb-1">Kategori Yönetimi</h1>
        <p className="text-dark-dim text-sm">Sitedeki tüm makale ve forum kategorileri.</p>
      </div>

      <CategoryForm />

      <div className="bg-white rounded-xl border border-line-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-parchment/50 text-dark font-serif text-sm border-b border-line-light">
                <th className="px-6 py-4">Kategori Adı</th>
                <th className="px-6 py-4">Link (Slug)</th>
                <th className="px-6 py-4">Oluşturulma Tarihi</th>
                <th className="px-6 py-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-line-light hover:bg-parchment/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-dark">
                      {cat.title}
                    </td>
                    <td className="px-6 py-4 text-dark-dim font-mono text-xs">
                      <span className="bg-line-dark/5 px-2 py-1 rounded">{cat.slug}</span>
                    </td>
                    <td className="px-6 py-4 text-dark-dim font-mono text-xs">
                      {new Date(cat.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CategoryDeleteButton id={cat.id} title={cat.title} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-dark-dim italic">
                    Kategori bulunamadı.
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
