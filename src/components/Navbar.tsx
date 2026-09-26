'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { login, signup, logout, sendPasswordResetEmail } from '@/app/auth/actions';
import { createClient } from '@/utils/supabase/client';

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setUser({ ...user, role: profile?.role });
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsModalOpen(true);
  };

  return (
    <>
      <nav className={`fixed w-full top-0 z-40 transition-transform duration-300 ${isNavVisible ? 'translate-y-0' : '-translate-y-full'} bg-ink/90 backdrop-blur-md text-light border-b border-line-light`}>
        <div className="flex items-center justify-between px-5 md:px-10 py-4 max-w-7xl mx-auto">
          {/* Sol: Logo */}
          <div className="flex items-center gap-2.5 font-serif text-xl font-semibold">
            <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
              <circle cx="20" cy="20" r="18" stroke="#C9A227" strokeWidth="1.4" />
              <circle cx="20" cy="20" r="4" fill="#C9A227" />
            </svg>
            <Link href="/">Yol</Link>
          </div>

          {/* Orta: Masaüstü Linkler ve Arama */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            <ul className="flex gap-6 text-sm text-light-dim">
              <li><Link href="/kategori/tarihce" className="hover:text-light transition-colors">Tarihçe</Link></li>
              <li><Link href="/kategori/inanc-esaslari" className="hover:text-light transition-colors">İnanç</Link></li>
              <li><Link href="/kategori/cem-ve-semah" className="hover:text-light transition-colors">Cem & Semah</Link></li>
              <li><Link href="/kategori/edebiyat-ve-muzik" className="hover:text-light transition-colors">Edebiyat</Link></li>
              <li><Link href="/kose-yazilari" className="text-gold font-medium hover:text-light transition-colors flex items-center gap-1"><span>✍️</span>Köşemiz</Link></li>
              <li><Link href="/forum" className="hover:text-light transition-colors">Forum</Link></li>
            </ul>
            
            {/* Arama Çubuğu (Masaüstü) */}
            <form action="/arama" className="relative group">
              <input 
                type="text" 
                name="q"
                placeholder="Makale veya konu ara..." 
                className="bg-white/5 border border-line-dark/50 rounded-full pl-9 pr-4 py-1.5 text-sm text-light placeholder-light-dim focus:outline-none focus:border-copper focus:bg-white/10 transition-all w-48 group-hover:w-64"
              />
              <svg className="w-4 h-4 text-light-dim absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </form>
          </div>

          {/* Sağ: Oturum İşlemleri & Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {(user.role === 'admin' || user.role === 'editor' || user.role === 'dede') && (
                    <Link href="/admin" className="text-sm font-semibold text-bordo hover:text-bordo/80 bg-bordo/5 px-3 py-1.5 rounded transition-colors border border-bordo/20 hidden xl:inline-block">
                      Admin Paneli
                    </Link>
                  )}
                  <Link href="/profil" className="text-sm text-light-dim hover:text-light transition-colors">Hoş geldin, {user.user_metadata?.username || 'Kullanıcı'}</Link>
                  <button onClick={async () => { await logout(); setUser(null); }} className="text-sm font-semibold px-5 py-2.5 rounded border border-line-light text-light hover:border-gold transition-colors">Çıkış Yap</button>
                </>
              ) : (
                <>
                  <button onClick={() => openAuth('login')} className="text-sm font-semibold px-5 py-2.5 rounded border border-line-light text-light hover:border-gold transition-colors">Giriş Yap</button>
                  <button onClick={() => openAuth('signup')} className="text-sm font-semibold px-5 py-2.5 rounded bg-copper text-light hover:bg-copper-bright transition-colors">Üye Ol</button>
                </>
              )}
            </div>

            {/* Hamburger Butonu (Mobil/Tablet) */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-light p-2 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobil Menü (Açılır Kapanır) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-ink border-t border-line-dark px-5 py-4 space-y-4">
            <form action="/arama" className="relative w-full">
              <input 
                type="text" 
                name="q"
                placeholder="Makale veya konu ara..." 
                className="w-full bg-white/5 border border-line-dark/50 rounded-md pl-9 pr-4 py-2.5 text-sm text-light placeholder-light-dim focus:outline-none focus:border-copper"
              />
              <svg className="w-4 h-4 text-light-dim absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </form>
            
            <ul className="flex flex-col gap-3 text-sm text-light-dim">
              <li><Link href="/kategori/tarihce" className="block py-2 hover:text-light">Tarihçe</Link></li>
              <li><Link href="/kategori/inanc-esaslari" className="block py-2 hover:text-light">İnanç</Link></li>
              <li><Link href="/kategori/cem-ve-semah" className="block py-2 hover:text-light">Cem & Semah</Link></li>
              <li><Link href="/kategori/edebiyat-ve-muzik" className="block py-2 hover:text-light">Edebiyat</Link></li>
              <li><Link href="/kose-yazilari" className="block py-2 text-gold font-medium hover:text-light">✍️ Köşemiz</Link></li>
              <li><Link href="/forum" className="block py-2 hover:text-light">Forum</Link></li>
            </ul>

            <div className="border-t border-line-dark pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/profil" className="text-sm font-semibold text-light text-center py-2">Hesabım ({user.user_metadata?.username})</Link>
                  {(user.role === 'admin' || user.role === 'editor') && (
                    <Link href="/admin" className="text-sm font-semibold bg-bordo text-light rounded py-2 text-center">Admin Paneli</Link>
                  )}
                  <button onClick={async () => { await logout(); setUser(null); setIsMobileMenuOpen(false); }} className="text-sm font-semibold rounded border border-line-light text-light py-2 text-center">Çıkış Yap</button>
                </>
              ) : (
                <>
                  <button onClick={() => { openAuth('login'); setIsMobileMenuOpen(false); }} className="w-full text-sm font-semibold rounded border border-line-light text-light py-2.5 text-center">Giriş Yap</button>
                  <button onClick={() => { openAuth('signup'); setIsMobileMenuOpen(false); }} className="w-full text-sm font-semibold rounded bg-copper text-light py-2.5 text-center">Üye Ol</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ---------- AUTH MODAL ---------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/70 flex items-center justify-center z-[100] p-5" onClick={() => setIsModalOpen(false)}>
          <div className="bg-parchment w-full max-w-[400px] rounded-md overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.35)]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-ink p-7 pb-5 text-light relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-5 text-light-dim hover:text-light text-2xl leading-none">×</button>
              <svg viewBox="0 0 40 40" fill="none" className="w-[22px] h-[22px] mb-3.5">
                <circle cx="20" cy="20" r="18" stroke="#C9A227" strokeWidth="1.4" />
                <circle cx="20" cy="20" r="4" fill="#C9A227" />
              </svg>
              <h3 className="text-xl font-serif">
                {authMode === 'login' ? 'Tekrar hoş geldiniz' : 
                 authMode === 'signup' ? 'Aramıza katılın' : 'Şifremi Unuttum'}
              </h3>
              <p className="text-[13px] text-light-dim mt-1.5">
                {authMode === 'login' ? 'Hesabınıza giriş yapın ve sohbete devam edin.' : 
                 authMode === 'signup' ? 'Bilgi paylaşmak ve tartışmalara katılmak için üye olun.' : 'E-posta adresinizi girin, size sıfırlama bağlantısı gönderelim.'}
              </p>
            </div>
            
            <div className="flex border-b border-line-dark">
              <button onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className={`flex-1 p-4 text-sm font-semibold border-b-2 transition-colors ${authMode === 'login' ? 'text-bordo border-bordo' : 'text-dark-dim border-transparent'}`}>Giriş Yap</button>
              <button onClick={() => { setAuthMode('signup'); setErrorMsg(''); setSuccessMsg(''); }} className={`flex-1 p-4 text-sm font-semibold border-b-2 transition-colors ${authMode === 'signup' ? 'text-bordo border-bordo' : 'text-dark-dim border-transparent'}`}>Üye Ol</button>
            </div>

            <div className="p-7 pb-8">
              {errorMsg && <div className="mb-4 text-xs text-red-400 bg-red-400/10 p-3 rounded font-mono">{errorMsg}</div>}
              {successMsg && <div className="mb-4 text-xs text-green-400 bg-green-400/10 p-3 rounded font-mono">{successMsg}</div>}
              {authMode === 'login' ? (
                <form action={async (formData) => {
                  setLoading(true); setErrorMsg(''); setSuccessMsg('');
                  const res = await login(formData);
                  if (res?.error) setErrorMsg(res.error);
                  else { setIsModalOpen(false); window.location.reload(); }
                  setLoading(false);
                }}>
                  <div className="mb-4">
                    <label className="block text-xs font-mono text-dark-dim mb-1.5 tracking-wide">E-posta</label>
                    <input name="email" type="email" required placeholder="ornek@eposta.com" className="w-full p-3 border border-line-dark rounded text-sm bg-white text-dark focus:outline-none focus:ring-2 focus:ring-copper" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-mono text-dark-dim mb-1.5 tracking-wide">Şifre</label>
                    <input name="password" type="password" required placeholder="••••••••" className="w-full p-3 border border-line-dark rounded text-sm bg-white text-dark focus:outline-none focus:ring-2 focus:ring-copper" />
                  </div>
                  <button disabled={loading} className="w-full mt-1.5 p-3.5 bg-copper text-light rounded font-semibold text-sm hover:bg-copper-bright transition-colors disabled:opacity-50">{loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}</button>
                  <div className="mt-4 text-[12.5px] text-dark-dim text-center leading-[1.6]">Şifrenizi mi unuttunuz? <button type="button" onClick={() => { setAuthMode('forgot_password'); setErrorMsg(''); setSuccessMsg(''); }} className="text-bordo font-semibold">Sıfırlayın</button></div>
                </form>
              ) : authMode === 'signup' ? (
                <form action={async (formData) => {
                  setLoading(true); setErrorMsg(''); setSuccessMsg('');
                  const res = await signup(formData);
                  if (res?.error) setErrorMsg(res.error);
                  else if (res?.success) setSuccessMsg(res.message || 'Kayıt başarılı!');
                  setLoading(false);
                }}>
                  <div className="mb-4">
                    <label className="block text-xs font-mono text-dark-dim mb-1.5 tracking-wide">Kullanıcı adı</label>
                    <input name="username" type="text" required placeholder="Görünecek adınız" className="w-full p-3 border border-line-dark rounded text-sm bg-white text-dark focus:outline-none focus:ring-2 focus:ring-copper" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-mono text-dark-dim mb-1.5 tracking-wide">E-posta</label>
                    <input name="email" type="email" required placeholder="ornek@eposta.com" className="w-full p-3 border border-line-dark rounded text-sm bg-white text-dark focus:outline-none focus:ring-2 focus:ring-copper" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-mono text-dark-dim mb-1.5 tracking-wide">Şifre</label>
                    <input name="password" type="password" required minLength={8} placeholder="En az 8 karakter" className="w-full p-3 border border-line-dark rounded text-sm bg-white text-dark focus:outline-none focus:ring-2 focus:ring-copper" />
                  </div>
                  <button disabled={loading} className="w-full mt-1.5 p-3.5 bg-copper text-light rounded font-semibold text-sm hover:bg-copper-bright transition-colors disabled:opacity-50">{loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}</button>
                  <div className="mt-4 text-[12.5px] text-dark-dim text-center leading-[1.6]">Üye olarak <Link href="#" className="text-bordo font-semibold">Topluluk İlkeleri</Link>&apos;ni kabul etmiş olursunuz.</div>
                </form>
              ) : (
                <form action={async (formData) => {
                  setLoading(true); setErrorMsg(''); setSuccessMsg('');
                  const res = await sendPasswordResetEmail(formData);
                  if (res?.error) setErrorMsg(res.error);
                  else if (res?.success) setSuccessMsg(res.message || 'Sıfırlama linki gönderildi!');
                  setLoading(false);
                }}>
                  <div className="mb-4">
                    <label className="block text-xs font-mono text-dark-dim mb-1.5 tracking-wide">E-posta</label>
                    <input name="email" type="email" required placeholder="ornek@eposta.com" className="w-full p-3 border border-line-dark rounded text-sm bg-white text-dark focus:outline-none focus:ring-2 focus:ring-copper" />
                  </div>
                  <button disabled={loading} className="w-full mt-1.5 p-3.5 bg-copper text-light rounded font-semibold text-sm hover:bg-copper-bright transition-colors disabled:opacity-50">{loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}</button>
                  <div className="mt-4 text-[12.5px] text-dark-dim text-center leading-[1.6]">Şifrenizi hatırladınız mı? <button type="button" onClick={() => setAuthMode('login')} className="text-bordo font-semibold">Giriş Yapın</button></div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
