'use client';

import { useActionState, useState } from 'react';
import { createArticle } from '@/app/actions/admin';
import TiptapEditor from '@/components/TiptapEditor';

interface AdminArticleFormProps {
  categories: any[];
  initialData?: any;
  action?: any;
}

export default function AdminArticleForm({ categories, initialData, action }: AdminArticleFormProps) {
  const submitAction = action || createArticle;
  const [state, formAction, isPending] = useActionState(submitAction, { error: null, success: false });
  const [content, setContent] = useState(initialData?.content || '');

  return (
    <form action={formAction} className="space-y-6">
      
      <div>
        <label className="block text-sm font-semibold text-dark mb-2">Makale Başlığı</label>
        <input 
          type="text" 
          name="title" 
          required 
          defaultValue={initialData?.title || ''}
          className="w-full bg-white border border-line-dark rounded p-3 text-dark focus:outline-none focus:border-bordo transition-colors"
          placeholder="Örn: Alevilikte Semahın Yeri ve Önemi"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark mb-2">Kategori</label>
        <select name="category_id" required defaultValue={initialData?.category_id || ''} className="w-full bg-white border border-line-dark rounded p-3 text-dark focus:outline-none focus:border-bordo transition-colors">
          <option value="">Lütfen makalenin kategorisini seçin...</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark mb-2">Makale İçeriği (Word Tipi Editör)</label>
        {/* Tiptap Editör Bileşeni */}
        <TiptapEditor value={content} onChange={setContent} />
        {/* Form gönderildiğinde HTML içeriğini server'a taşımak için gizli input */}
        <input type="hidden" name="content" value={content} />
      </div>

      {state.error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isPending}
        className="bg-bordo text-light px-8 py-4 rounded font-semibold hover:bg-bordo/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[200px] w-full md:w-auto"
      >
        {isPending ? 'İşleniyor...' : (initialData ? 'Makaleyi Güncelle' : 'Makaleyi Yayınla')}
      </button>
      
    </form>
  );
}
