'use client';

import { useActionState } from 'react';
import { submitComment } from '@/app/actions/comment';
import Link from 'next/link';

interface CommentFormProps {
  postId: string;
  slug: string;
  isLoggedIn: boolean;
}

export default function CommentForm({ postId, slug, isLoggedIn }: CommentFormProps) {
  const [state, formAction, isPending] = useActionState(submitComment, { error: null, success: false });

  if (!isLoggedIn) {
    return (
      <div className="bg-ink p-8 rounded text-light text-center border border-line-dark">
        <h4 className="font-serif text-xl mb-3 text-gold">Sohbete Katıl</h4>
        <p className="text-sm text-light-dim mb-5">Düşüncelerinizi paylaşmak ve tartışmalara katılmak için giriş yapmanız gerekiyor.</p>
        <Link href="/auth" className="inline-block bg-copper text-light px-6 py-2.5 rounded font-semibold text-sm hover:bg-copper-bright transition-colors">
          Giriş Yap / Kayıt Ol
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ink p-8 rounded text-light shadow-md border border-line-dark">
      <h4 className="font-serif text-xl mb-4 text-gold">Sohbete Katıl</h4>
      
      {state.success ? (
        <div className="bg-green-900/40 border border-green-500/50 text-green-200 p-4 rounded text-sm mb-4">
          Yorumunuz başarıyla eklendi! Katkınız için teşekkürler.
        </div>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="post_id" value={postId} />
          <input type="hidden" name="slug" value={slug} />
          
          <textarea 
            name="content"
            required
            className="w-full bg-white/5 border border-line-light rounded p-4 text-sm text-light focus:outline-none focus:border-gold min-h-[120px] mb-4 transition-colors resize-y"
            placeholder="Düşüncelerinizi buraya yazın... (Topluluk kurallarımıza uyduğunuz için teşekkür ederiz)"
          />
          
          {state.error && (
            <div className="text-red-400 text-sm mb-4 bg-red-900/20 p-3 rounded border border-red-900/50">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="bg-copper text-light px-6 py-3 rounded font-semibold text-sm hover:bg-copper-bright transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
          >
            {isPending ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              "Yorum Gönder"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
