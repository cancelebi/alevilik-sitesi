'use client';

import { useActionState, useEffect, useRef } from 'react';
import { addCategory } from '@/app/actions/categories';

export default function CategoryForm() {
  const [state, formAction, isPending] = useActionState(addCategory, { error: '', success: false });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="bg-white p-6 rounded-xl border border-line-light shadow-sm mb-8">
      <h2 className="text-xl font-serif text-dark mb-4 border-b border-line-light pb-2">Yeni Kategori Ekle</h2>
      
      {state.error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
          {state.error}
        </div>
      )}
      
      {state.success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded">
          Kategori başarıyla eklendi!
        </div>
      )}

      <div className="flex gap-4">
        <input 
          type="text" 
          name="title" 
          required 
          placeholder="Örn: Alevilik Tarihi"
          className="flex-1 text-sm border border-line-light rounded p-2.5 bg-parchment/30 focus:outline-none focus:border-copper"
        />
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-copper hover:bg-copper-bright text-white font-semibold py-2.5 px-6 rounded transition-colors disabled:opacity-50"
        >
          {isPending ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </div>
    </form>
  );
}
