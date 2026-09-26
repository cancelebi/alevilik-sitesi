import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewForumThreadForm from '@/components/NewForumThreadForm';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewForumThreadPage() {
  const supabase = await createClient();

  // Oturum kontrolü (Giriş yapmamışsa anasayfaya veya login'e at)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth');
  }

  // Veritabanından gerçek kategorileri çekiyoruz!
  const { data: categories } = await supabase.from('categories').select('id, title').order('created_at');

  return (
    <div>
      <Navbar />
      <main className="bg-parchment min-h-screen pt-32 pb-20 px-5 md:px-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-serif text-dark mb-4">Yeni Konu Aç</h1>
            <p className="text-dark-dim">Toplulukla paylaşmak istediğiniz bir soruyu veya konuyu aşağıya yazabilirsiniz.</p>
          </div>

          <div className="bg-white p-8 rounded shadow-sm border border-line-light">
            <NewForumThreadForm categories={categories || []} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
