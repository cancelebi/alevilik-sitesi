'use client';

import { useState } from 'react';
import { deleteUser } from '@/app/actions/admin';

export default function DeleteMemberButton({ userId, username }: { userId: string, username: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`DİKKAT: "${username}" isimli kullanıcıyı tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    
    setLoading(true);
    const res = await deleteUser(userId);
    if (res?.error) {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-semibold px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 ml-2"
      title="Üyeyi Sil"
    >
      {loading ? '...' : 'Sil'}
    </button>
  );
}
