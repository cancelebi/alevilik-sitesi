'use client';

import { useState } from 'react';
import { updatePassword } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';

export default function SifreYenilePage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalıdır.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('password', password);

    const res = await updatePassword(formData);
    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setSuccessMsg(res.message || 'Şifre güncellendi.');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-5 pt-24">
      <div className="w-full max-w-[400px] bg-white p-8 rounded-xl border border-line-light shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif text-dark mb-2">Yeni Şifre Belirle</h1>
          <p className="text-dark-dim text-sm">Lütfen yeni şifrenizi girin.</p>
        </div>

        {errorMsg && <div className="mb-6 p-3 bg-red-100 text-red-600 text-sm rounded font-mono text-center">{errorMsg}</div>}
        {successMsg && <div className="mb-6 p-3 bg-green-100 text-green-600 text-sm rounded font-mono text-center">{successMsg}</div>}

        {!successMsg && (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-xs font-mono text-dark-dim mb-1.5 tracking-wide">YENİ ŞİFRE</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-line-dark rounded text-sm focus:outline-none focus:border-copper transition-colors"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-mono text-dark-dim mb-1.5 tracking-wide">YENİ ŞİFRE (TEKRAR)</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-line-dark rounded text-sm focus:outline-none focus:border-copper transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-copper text-light py-3 rounded font-semibold text-sm hover:bg-copper-bright transition-colors disabled:opacity-50"
            >
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
