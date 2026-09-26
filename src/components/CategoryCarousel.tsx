'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

export default function CategoryCarousel({ categories }: { categories: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Tıklama event'inin hasDragged true iken işlenmesi için ufak bir gecikme
    setTimeout(() => setHasDragged(false), 50);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2.5; // 2.5x hızında kaydır
    scrollRef.current.scrollLeft = scrollLeft - walk;
    
    // Eğer mouse 5 pikselden fazla hareket ettiyse, bunu bir "sürükleme" olarak işaretle (tıklamayı engellemek için)
    if (Math.abs(walk) > 5) {
      setHasDragged(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (hasDragged) {
      e.preventDefault(); // Sürükleme yapıldıysa linke gitmeyi iptal et
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-6">
      <div className="flex justify-end px-4 mb-3 relative z-10">
        <div className="flex items-center gap-2 bg-[#12181b] border border-gold/30 px-4 py-1.5 rounded-full shadow-lg shadow-gold/5 opacity-90">
          <svg className="w-4 h-4 text-gold animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          <span className="text-xs text-gold/90 font-medium tracking-wide">Sağa ve Sola Sürükleyin</span>
        </div>
      </div>
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="overflow-x-auto flex gap-4 md:gap-6 hide-scrollbar relative z-20 px-2 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories && categories.map((cat, idx) => {
          const icons = ['🏠', '🏛️', '⚔️', '📖', '🕯️', '📅'];
          return (
            <Link 
              key={cat.id} 
              href={`/kategori/${cat.slug}`} 
              onClick={handleClick}
              className="flex-shrink-0 flex items-center gap-4 bg-[#12181b] border border-line-light/10 p-5 rounded-xl min-w-[220px] hover:border-gold/40 transition-colors group shadow-lg pointer-events-auto drag-none"
              draggable={false}
            >
              <div className="text-3xl opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">{icons[idx % icons.length]}</div>
              <div>
                <h3 className="text-white font-serif text-[15px]">{cat.title}</h3>
                <p className="text-[11px] text-light-dim mt-1 truncate max-w-[130px]">{cat.description || 'İnanç, İbadet, Yol'}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
