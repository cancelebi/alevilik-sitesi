'use client';

import { useState } from 'react';
import { updateEmail, updatePassword } from '@/app/actions/profile';

export default function ProfileSettings({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState('');
  
  const [emailMessage, setEmailMessage] = useState({ text: '', isError: false });
  const [passwordMessage, setPasswordMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailMessage({ text: '', isError: false });

    const res = await updateEmail(email);
    if (res.error) {
      setEmailMessage({ text: res.error, isError: true });
    } else {
      setEmailMessage({ text: res.message || 'Başarılı', isError: false });
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordMessage({ text: '', isError: false });

    const res = await updatePassword(password);
    if (res.error) {
      setPasswordMessage({ text: res.error, isError: true });
    } else {
      setPasswordMessage({ text: res.message || 'Başarılı', isError: false });
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-xl border border-line-light shadow-sm">
      <h3 className="text-xl font-serif mb-6 border-b border-line-light pb-4">Ayarlar</h3>

      {/* Şifre Değiştirme Formu */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-dark mb-3">Şifre Değiştir</h4>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Yeni şifrenizi girin (en az 6 karakter)"
            className="w-full text-sm border border-line-light rounded p-2.5 bg-parchment/30 focus:outline-none focus:border-copper transition-colors"
            required
            minLength={6}
          />
          <button 
            type="submit" 
            disabled={loading || !password}
            className="self-start text-xs font-semibold bg-copper hover:bg-copper-bright text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
          {passwordMessage.text && (
            <p className={`text-xs mt-1 ${passwordMessage.isError ? 'text-red-500' : 'text-green-600'}`}>
              {passwordMessage.text}
            </p>
          )}
        </form>
      </div>

      {/* E-posta Değiştirme Formu */}
      <div>
        <h4 className="text-sm font-semibold text-dark mb-3">E-Posta Değiştir</h4>
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Yeni e-posta adresiniz"
            className="w-full text-sm border border-line-light rounded p-2.5 bg-parchment/30 focus:outline-none focus:border-copper transition-colors"
            required
          />
          <button 
            type="submit" 
            disabled={loading || email === currentEmail}
            className="self-start text-xs font-semibold bg-bordo hover:bg-bordo/90 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'İşleniyor...' : 'E-Postayı Güncelle'}
          </button>
          {emailMessage.text && (
            <p className={`text-xs mt-1 ${emailMessage.isError ? 'text-red-500' : 'text-green-600'}`}>
              {emailMessage.text}
            </p>
          )}
        </form>
        <p className="text-[10px] text-dark-dim mt-2 leading-relaxed">
          Not: E-posta değişikliğinde, hem eski hem de yeni adresinize Supabase tarafından bir onay maili gönderilir. Onaylamadan değişiklik gerçekleşmez.
        </p>
      </div>
    </div>
  );
}
