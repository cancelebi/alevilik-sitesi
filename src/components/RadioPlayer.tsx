'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function RadioPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [channelIndex, setChannelIndex] = useState(0);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Oynatıcı state'leri
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchTracks = async () => {
      const { data } = await supabase.from('audio_tracks').select('*').order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setTracks(data);
      }
      setLoading(false);
    };
    fetchTracks();
  }, [supabase]);

  // Ses ayarı (Volume) senkronizasyonu
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Şarkı değiştiğinde veya isPlaying değiştiğinde otomatik yükle/çal
  useEffect(() => {
    if (audioRef.current && tracks.length > 0) {
      const currentUrl = tracks[channelIndex]?.audio_url;
      if (currentUrl && audioRef.current.src !== currentUrl && audioRef.current.src !== encodeURI(currentUrl)) {
        audioRef.current.src = currentUrl;
        audioRef.current.load();
        if (isPlaying) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => console.error("Otomatik geçiş hatası:", e));
          }
        }
      }
    }
  }, [channelIndex, tracks, isPlaying]);

  const togglePlay = () => {
    if (tracks.length === 0) return alert('Henüz listeye hiç şarkı/deyiş eklenmemiş.');
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(e => {
              console.error(e);
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const nextChannel = () => {
    if (tracks.length === 0) return;
    setChannelIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true); // Kesin çalsın diye
  };

  const prevChannel = () => {
    if (tracks.length === 0) return;
    setChannelIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const playSpecificTrack = (index: number) => {
    setChannelIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  const handleEnded = () => {
    nextChannel();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) setIsMuted(false);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end">
      
      {/* Genişletilmiş Çalar */}
      <div 
        className={`bg-ink/95 backdrop-blur-md border border-line-light/20 p-5 rounded-2xl shadow-2xl mb-4 w-80 sm:w-96 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Üst Kısım: Başlık ve Butonlar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h4 className="text-copper font-serif font-semibold text-lg">Oruç Deyişleri</h4>
            {tracks.length > 0 && (
              <span className="text-[10px] bg-copper/20 text-copper px-2 py-0.5 rounded-full font-mono">
                {channelIndex + 1}/{tracks.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowPlaylist(!showPlaylist)} 
              className={`transition-colors ${showPlaylist ? 'text-copper' : 'text-light-dim hover:text-white'}`}
              title="Çalma Listesi"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h12v2H4z"/></svg>
            </button>
            <button onClick={() => setIsOpen(false)} className="text-light-dim hover:text-red-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Playlist veya Oynatıcı Ekranı */}
        {showPlaylist ? (
          <div className="bg-parchment/10 rounded-lg border border-line-light/10 mb-4 h-32 overflow-y-auto custom-scrollbar">
            {tracks.length > 0 ? (
              tracks.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => playSpecificTrack(idx)}
                  className={`w-full text-left p-2.5 flex items-center gap-2 border-b border-line-light/5 last:border-0 hover:bg-parchment/20 transition-colors ${channelIndex === idx ? 'bg-copper/10 border-l-2 border-l-copper' : ''}`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${channelIndex === idx ? 'bg-copper text-white' : 'bg-dark-dim/50 text-white/50'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 truncate">
                    <div className={`text-sm font-semibold truncate ${channelIndex === idx ? 'text-copper' : 'text-light'}`}>{track.title}</div>
                    <div className="text-xs text-light-dim truncate">{track.artist || 'Anonim'}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-light-dim text-xs italic">Liste Boş</div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-parchment/15 to-parchment/5 p-4 rounded-xl border border-line-light/10 mb-5 text-center shadow-inner relative overflow-hidden">
            {/* Arka plan süslemesi */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5">
              <svg className="w-24 h-24 text-copper" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            
            {tracks.length > 0 ? (
              <div className="relative z-10 py-2">
                <div className="text-light text-base md:text-lg font-semibold truncate px-2" title={tracks[channelIndex].title}>
                  {tracks[channelIndex].title}
                </div>
                <div className="text-copper/90 text-sm mt-1 truncate">
                  {tracks[channelIndex].artist || 'Anonim'}
                </div>
              </div>
            ) : (
              <div className="text-light-dim text-sm italic py-4">Liste Boş</div>
            )}
          </div>
        )}

        {/* İlerleme Çubuğu (Progress Bar) */}
        {!showPlaylist && tracks.length > 0 && (
          <div className="mb-5 px-1">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={handleSeek}
              className="w-full h-1.5 bg-dark-dim rounded-lg appearance-none cursor-pointer accent-copper hover:accent-copper-bright transition-all"
            />
            <div className="flex justify-between text-[10px] text-light-dim mt-1.5 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Kontroller (Oynat, İleri, Geri, Ses) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* Ses Kontrolü */}
            <div className="flex items-center gap-2 group w-24">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="text-light-dim hover:text-copper transition-colors"
                title="Sesi Kapat/Aç"
              >
                {isMuted || volume === 0 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                )}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-dark-dim rounded-lg appearance-none cursor-pointer accent-copper opacity-50 group-hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Medya Butonları */}
            <div className="flex items-center gap-3">
              <button onClick={prevChannel} className="text-light-dim hover:text-white transition-colors" title="Önceki" disabled={tracks.length === 0}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
              </button>

              <button 
                onClick={togglePlay} 
                disabled={tracks.length === 0}
                className="w-14 h-14 bg-copper rounded-full flex items-center justify-center text-white shadow-lg shadow-copper/20 hover:bg-copper-bright hover:shadow-copper/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>

              <button onClick={nextChannel} className="text-light-dim hover:text-white transition-colors" title="Sonraki" disabled={tracks.length === 0}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
              </button>
            </div>
            
            {/* Boşluk (Simetri için) */}
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Yüzen Buton (Kapalıyken) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-bordo rounded-full flex items-center justify-center shadow-lg shadow-bordo/30 text-white hover:bg-bordo/90 transition-transform hover:scale-105 z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        {isPlaying ? (
          <div className="flex gap-1 items-end h-5">
            <div className="w-1 bg-white animate-bounce h-full" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 bg-white animate-bounce h-3/4" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 bg-white animate-bounce h-full" style={{ animationDelay: '0.2s' }}></div>
          </div>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
        )}
      </button>

      <audio 
        ref={audioRef} 
        preload="metadata" 
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
