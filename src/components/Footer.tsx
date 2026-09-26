export default function Footer() {
  return (
    <footer className="bg-ink text-light-dim px-5 md:px-10 pt-12 pb-8 text-[13px]">
      <div className="max-w-6xl mx-auto flex justify-between flex-wrap gap-8">
        <div className="max-w-md leading-[1.6]">
          <div className="flex items-center gap-2.5 font-serif text-xl font-semibold text-light mb-3.5">
            <svg viewBox="0 0 40 40" fill="none" className="w-[22px] h-[22px]">
              <circle cx="20" cy="20" r="18" stroke="#C9A227" strokeWidth="1.4" />
              <circle cx="20" cy="20" r="4" fill="#C9A227" />
            </svg>
            Yol
          </div>
          İçerikler akademik kaynaklardan ve toplulukla yapılan görüşmelerden derlenmiştir. Farklı ocak ve yorumların sesini eşit şekilde yansıtmayı hedefleriz. Hata bildirimi ve katkı için bize ulaşın.
        </div>
        <div className="flex gap-16 flex-wrap">
          <div>
            <h4 className="font-mono text-[11px] tracking-[.1em] uppercase text-light mb-3.5 font-medium">İçerik</h4>
              <ul className="space-y-3 text-[15px]">
                <li><a href="/hakkimizda" className="text-light-dim hover:text-gold transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="text-light-dim hover:text-gold transition-colors">Topluluk İlkeleri</a></li>
                <li><a href="#" className="text-light-dim hover:text-gold transition-colors">Kaynaklar & Bibliyografya</a></li>
                <li><a href="#" className="text-light-dim hover:text-gold transition-colors">İletişim</a></li>
              </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] tracking-[.1em] uppercase text-light mb-3.5 font-medium">Topluluk</h4>
            <ul className="flex flex-col gap-2">
              <li><a href="/forum" className="hover:text-light transition-colors">Forum</a></li>
              <li><a href="#" className="hover:text-light transition-colors">Katkı Sağla</a></li>
              <li><a href="#" className="hover:text-light transition-colors">Moderasyon İlkeleri</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-5 border-t border-line-light flex justify-between flex-wrap gap-2.5">
        <span>© 2026 Yol — kâr amacı gütmeyen bir bilgi projesidir.</span>
        <span>Bu bir portföy/taslak tasarımdır.</span>
      </div>
    </footer>
  );
}
