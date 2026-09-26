import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/admin'); // Editörler giremez

  // Ayarlardan PIN'i çek (Sadece varlığını kontrol etsek de olur, form boş gelebilir güvenlik için)
  const { data: pinSetting } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'admin_pin')
    .single();

  const currentPin = pinSetting?.setting_value || '1453';

  return (
    <div>
      <div className="mb-10 border-b border-line-dark pb-6">
        <h1 className="text-4xl font-serif text-dark mb-2">Sistem Ayarları</h1>
        <p className="text-dark-dim text-sm font-mono">Sitenin genel ve güvenlik ayarlarını yönetin.</p>
      </div>

      <div className="max-w-xl">
        <SettingsForm currentPin={currentPin} />
      </div>
    </div>
  );
}
