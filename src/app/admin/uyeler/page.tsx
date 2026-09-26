import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import RoleSelect from './RoleSelect';
import DeleteMemberButton from './DeleteMemberButton';

export default async function MembersPage() {
  const supabase = await createClient();
  
  // Sadece admin girebilir
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/admin'); // Editörler giremez

  // Tüm kullanıcıları çek
  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-end mb-10 border-b border-line-dark pb-6">
        <div>
          <h1 className="text-4xl font-serif text-dark mb-2">Üyeler & Yetkilendirme</h1>
          <p className="text-dark-dim text-sm font-mono">Platformdaki tüm kullanıcıları ve "Dede" (Köşe Yazarı) yetkilerini yönetin.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-line-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-parchment-2 text-dark-dim text-xs font-mono uppercase tracking-wider border-b border-line-light">
                <th className="p-4 font-semibold">Kullanıcı Adı</th>
                <th className="p-4 font-semibold">Kayıt Tarihi</th>
                <th className="p-4 font-semibold">Mevcut Rol</th>
                <th className="p-4 font-semibold text-right">İşlem (Rol Değiştir)</th>
              </tr>
            </thead>
            <tbody>
              {members && members.map((member: any) => (
                <tr key={member.id} className="border-b border-line-light last:border-0 hover:bg-parchment/50 transition-colors">
                  <td className="p-4 font-medium text-dark">{member.username}</td>
                  <td className="p-4 text-dark-dim text-sm">{new Date(member.created_at).toLocaleDateString('tr-TR')}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      member.role === 'admin' ? 'bg-bordo text-white' :
                      member.role === 'dede' ? 'bg-gold text-ink' :
                      member.role === 'editor' ? 'bg-copper text-white' :
                      'bg-line-light text-dark-dim'
                    }`}>
                      {member.role === 'dede' ? 'Dede (Köşe Yazarı)' : member.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <RoleSelect userId={member.id} currentRole={member.role} />
                      <DeleteMemberButton userId={member.id} username={member.username} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
