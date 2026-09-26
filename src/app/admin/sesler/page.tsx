import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AudioUploadForm from './AudioUploadForm';
import { deleteAudioTrack } from '@/app/actions/audio';
import TrackRow from './TrackRow';

export default async function AudioAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'editor' && profile.role !== 'dede')) {
    redirect('/admin');
  }

  // Mevcut şarkıları çek
  const { data: tracks, error } = await supabase
    .from('audio_tracks')
    .select('*')
    .order('created_at', { ascending: false });

  // Tablo yoksa henüz oluşturulmamıştır
  const isTableMissing = error?.code === '42P01'; // PostgreSQL undefined_table code

  return (
    <div>
      <div className="flex justify-between items-end mb-10 border-b border-line-dark pb-6">
        <div>
          <h1 className="text-4xl font-serif text-dark mb-2">Deyiş & Radyo Yönetimi</h1>
          <p className="text-dark-dim text-sm font-mono">
            Kendi sunucumuz üzerinden çalınacak ses dosyalarını (deyiş, türkü vb.) buradan yükleyip silebilirsiniz.
          </p>
        </div>
      </div>

      {isTableMissing ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm mb-8 text-center">
          <h3 className="font-bold text-lg mb-2">Kurulum Eksik</h3>
          <p className="text-sm mb-4">
            Henüz <b>audio_tracks</b> tablosu ve <b>audio</b> Storage klasörü Supabase üzerinde kurulmamış. 
            Lütfen size verilen <code>audio_schema.sql</code> kodunu Supabase SQL Editor üzerinden çalıştırın.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1">
            <AudioUploadForm />
          </div>

          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl border border-line-light overflow-hidden shadow-sm">
              <div className="p-4 border-b border-line-light bg-parchment/30">
                <h2 className="font-serif font-semibold text-dark text-lg">Yüklü Şarkı Listesi</h2>
                <p className="text-xs text-dark-dim">Sitenin sağ altındaki oynatıcıda sırasıyla çalacak eserler.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-parchment-2 text-dark-dim text-xs font-mono uppercase tracking-wider border-b border-line-light">
                      <th className="p-4 font-semibold w-12">#</th>
                      <th className="p-4 font-semibold">Eser & Sanatçı</th>
                      <th className="p-4 font-semibold">Tarih</th>
                      <th className="p-4 font-semibold text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracks && tracks.length > 0 ? (
                      tracks.map((track: any, index: number) => (
                        <TrackRow key={track.id} track={track} index={index} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-dark-dim italic text-sm">
                          Henüz hiç şarkı/deyiş yüklenmemiş.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
