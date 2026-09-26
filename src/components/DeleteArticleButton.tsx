'use client';

import { deleteArticle } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Bu makaleyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      setLoading(true);
      const res = await deleteArticle(id);
      if (res.success) {
        router.refresh(); // sayfayı güncelle
      } else {
        alert(res.error);
        setLoading(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className={`text-red-500 hover:underline text-xs font-medium ml-4 ${loading ? 'opacity-50' : ''}`}
    >
      {loading ? 'Siliniyor...' : 'Sil'}
    </button>
  );
}
