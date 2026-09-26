'use client';

import { useState } from 'react';
import { uploadAudio } from '@/app/actions/audio';

export default function AudioUploadForm() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !externalUrl) return;

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('externalUrl', externalUrl);

    const res = await uploadAudio(formData);
    
    if (res.error) {
      setMessage(res.error);
      setIsError(true);
    } else {
      setMessage('Deyiş linki başarıyla listeye eklendi!');
      setIsError(false);
      setTitle('');
      setArtist('');
      setExternalUrl('');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-line-light shadow-sm">
      <h2 className="text-xl font-serif text-dark mb-4 border-b border-line-light pb-2">Yeni Deyiş Ekle (Kota Dostu)</h2>
      
      {message && (
        <div className={`p-3 mb-4 text-sm rounded ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm">
        <p className="font-semibold mb-1">💡 İpucu: Kendi sunucu kotanızı harcamayın!</p>
        <p>Dosya yüklemek yerine, mp3semti.com vb. sitelerden bulduğunuz direkt <strong>MP3 linklerini</strong> kullanın. Bu sayede sitemizin trafik kotası (Bandwidth) sıfır kalır ve asla kilitlenmez.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-dark mb-1">Eser Adı (Başlık) *</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-sm border border-line-light rounded p-2.5 bg-parchment/30 focus:outline-none focus:border-copper"
            required
            placeholder="Örn: Gitme Turnam"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-dark mb-1">Sanatçı / Dede</label>
          <input 
            type="text" 
            value={artist}
            onChange={e => setArtist(e.target.value)}
            className="w-full text-sm border border-line-light rounded p-2.5 bg-parchment/30 focus:outline-none focus:border-copper"
            placeholder="Örn: Sabahat Akkiraz (İsteğe Bağlı)"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-dark mb-1">Direkt MP3 Linki *</label>
        <input 
          type="url"
          value={externalUrl}
          onChange={e => setExternalUrl(e.target.value)}
          placeholder="Örn: https://mp3semticdn.com/muzik.mp3"
          className="w-full text-sm border border-line-light rounded p-2.5 bg-parchment/30 focus:outline-none focus:border-copper"
          required
        />
        <p className="text-xs text-dark-dim mt-1">Dışarıdan bir sitenin MP3 linkini buraya yapıştırın.</p>
      </div>

      <button 
        type="submit" 
        disabled={loading || !title || !externalUrl}
        className="bg-copper hover:bg-copper-bright text-white font-semibold py-2.5 px-6 rounded transition-colors disabled:opacity-50"
      >
        {loading ? 'Ekleniyor...' : 'Listeye Ekle'}
      </button>
    </form>
  );
}
