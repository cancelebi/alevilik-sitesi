'use client';

import { useState } from 'react';
import { deleteAudioTrack } from '@/app/actions/audio';

export default function DeleteButton({ id, url }: { id: string, url: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bu parçayı kalıcı olarak silmek istediğinize emin misiniz?')) return;
    
    setLoading(true);
    const res = await deleteAudioTrack(id, url);
    if (res.error) {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-semibold px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      {loading ? 'Siliniyor...' : 'Sil'}
    </button>
  );
}
