import AdminSidebar from '@/components/AdminSidebar';
import AdminUnlockForm from '@/components/AdminUnlockForm';
import { cookies } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isUnlocked = cookieStore.get('admin_unlocked')?.value === 'true';

  if (!isUnlocked) {
    return <AdminUnlockForm />;
  }

  return (
    <div className="flex min-h-screen bg-parchment font-sans text-dark">
      {/* Sol Menü (Sidebar) */}
      <AdminSidebar />
      
      {/* Ana İçerik */}
      <div className="flex-grow flex flex-col min-w-0">
        <main className="flex-grow p-6 md:p-10 lg:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
