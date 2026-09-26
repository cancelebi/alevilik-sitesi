'use client';

import { useTransition, useState } from 'react';
import { updateAdminPin } from '@/app/actions/admin';

export default function SettingsForm({ currentPin }: { currentPin: string }) {
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState(currentPin);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (pin.length < 4) {
      setError('Şifre en az 4 karakter olmalıdır.');
      return;
    }

    startTransition(async () => {
      const res = await updateAdminPin(pin);
      if (res.error) {
        setError(res.error);
      } else {
        setMessage('Admin giriş şifresi başarıyla güncellendi!');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-line-light shadow-sm">
      <h2 className="text-xl font-serif text-dark mb-6 border-b border-line-light pb-3">Güvenlik Ayarları</h2>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
          {error}
        </div>
      )}
      
      {message && (
        <div className="mb-6 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-100">
          {message}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-dark mb-2">Admin Paneli Şifresi (PIN)</label>
        <p className="text-xs text-dark-dim mb-3">Admin paneline girerken sorulan şifreyi buradan değiştirebilirsiniz.</p>
        <input 
          type="text" 
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required 
          className="w-full text-lg border border-line-light rounded p-3 bg-parchment/30 focus:outline-none focus:border-copper font-mono tracking-widest"
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-copper hover:bg-copper-bright text-white font-semibold py-3 px-6 rounded transition-colors disabled:opacity-50"
      >
        {isPending ? 'Kaydediliyor...' : 'Şifreyi Kaydet'}
      </button>
    </form>
  );
}
