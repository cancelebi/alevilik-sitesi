'use client';

import { useState } from 'react';
import { deleteCategory } from '@/app/actions/categories';

export default function CategoryDeleteButton({ id, title }: { id: string, title: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${title}" kategorisini silmek istediğinize emin misiniz?`)) return;
    
    setLoading(true);
    const res = await deleteCategory(id);
    if (res?.error) {
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
