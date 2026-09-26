'use client';

import { useState } from 'react';
import { unlockAdminPanel } from '@/app/actions/admin';

export default function AdminUnlockForm() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await unlockAdminPanel(pin);
    if (!res.success) {
      setError(res.error || 'Bir hata oluştu');
      setLoading(false);
    }
    // Başarılıysa sayfa sunucu tarafından (revalidatePath ile) yeniden yüklenecek ve layout içeriği gösterecek.
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-ink-2 p-8 rounded-xl border border-line-light/20 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-line-light/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-line-light/20">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-serif text-light mb-2">Yönetim Paneli</h1>
          <p className="text-light-dim text-sm">Giriş yapmak için admin şifrenizi girin.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded font-mono text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Admin şifresi"
              className="w-full bg-ink text-center text-light p-4 rounded border border-line-light/30 focus:outline-none focus:border-gold transition-colors tracking-widest text-lg"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full bg-gold hover:bg-gold/90 text-ink font-bold py-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Kontrol ediliyor...' : 'Kilidi Aç'}
          </button>
          <div className="mt-6 text-center">
            <a href="/" className="text-light-dim hover:text-light text-xs underline transition-colors">Siteye Geri Dön</a>
          </div>
        </form>
      </div>
    </div>
  );
}
