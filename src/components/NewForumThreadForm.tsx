'use client';

import { useActionState } from 'react';
import { createForumThread } from '@/app/actions/forum';

interface NewForumThreadFormProps {
  categories: any[];
}

export default function NewForumThreadForm({ categories }: NewForumThreadFormProps) {
  const [state, formAction, isPending] = useActionState(createForumThread, { error: '', success: false });

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-dark mb-2">Konu Başlığı</label>
        <input 
          type="text" 
          name="title" 
          required 
          className="w-full bg-parchment border border-line-dark rounded p-3 text-dark focus:outline-none focus:border-copper transition-colors"
          placeholder="Örn: Bölgemizde semah biraz farklı dönülüyor, bu normal mi?"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark mb-2">Kategori</label>
        <select name="category_id" required className="w-full bg-parchment border border-line-dark rounded p-3 text-dark focus:outline-none focus:border-copper transition-colors">
          <option value="">Bir kategori seçin...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-dark mb-2">İçerik</label>
        <textarea 
          name="content" 
          required 
          className="w-full bg-parchment border border-line-dark rounded p-4 text-dark focus:outline-none focus:border-copper min-h-[200px] transition-colors resize-y"
          placeholder="Sorunuzu veya paylaşmak istediklerinizi detaylıca yazın..."
        />
      </div>

      {state.error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          {state.error}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-copper text-light px-6 py-3.5 rounded font-semibold hover:bg-copper-bright transition-colors disabled:opacity-50 flex justify-center"
      >
        {isPending ? 'Gönderiliyor...' : 'Konuyu Paylaş'}
      </button>
    </form>
  );
}
