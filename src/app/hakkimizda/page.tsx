import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      
      <main className="bg-parchment min-h-screen pt-32 pb-24 text-dark px-5 md:px-10">
        <article className="max-w-3xl mx-auto">
          
          <div className="text-center mb-16">
             <div className="eyebrow justify-center mb-5 text-copper before:bg-copper after:bg-copper after:content-[''] after:w-4 after:h-px after:inline-block">Misyonumuz</div>
             <h1 className="text-4xl md:text-5xl font-serif mb-6 text-dark">Biz Kimiz?</h1>
             <p className="text-dark-dim text-lg leading-relaxed max-w-2xl mx-auto">
               Alevilik inancını, kültürünü ve tarihini akademik kaynaklara dayanarak aktarmayı amaçlayan bağımsız bir bilgi platformuyuz.
             </p>
          </div>

          <div className="space-y-10 text-lg leading-relaxed text-dark/80">
            <section>
              <h2 className="text-2xl font-serif text-bordo mb-4">Amacımız</h2>
              <p>
                Alevi toplumu içinde var olan zengin çeşitliliği (farklı ocaklar, bölgesel gelenekler ve yorumlar) tek bir "doğru" dayatmadan, bir zenginlik olarak görüyor ve yansıtıyoruz. Amacımız, akademik kaynaklara dayanan doğru bilgiyi; deneyimini, sorusunu ya da kendi geleneğini paylaşmak isteyen herkesle bir araya getirmektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-bordo mb-4">İlkelerimiz</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Bilimsellik:</strong> Tüm içeriklerimiz güvenilir tarihi ve akademik kaynaklara dayandırılır.</li>
                <li><strong>Çok Seslilik:</strong> Alevilikteki yöresel farklılıklar ve ocak gelenekleri saygıyla kucaklanır.</li>
                <li><strong>Saygı ve Hoşgörü:</strong> Forum ve yorum alanlarımızda hakaret, nefret söylemi ve ötekileştirici dillere yer yoktur.</li>
                <li><strong>Bağımsızlık:</strong> Hiçbir kurum, vakıf veya derneğin resmi yayın organı değiliz.</li>
              </ul>
            </section>

            <section className="bg-gold/10 border-l-4 border-gold p-6 italic font-serif mt-12 text-dark">
              "Bir olalım, iri olalım, diri olalım." <br />
              <span className="text-sm font-sans not-italic text-dark-dim mt-2 block">— Hacı Bektaş Veli</span>
            </section>
          </div>

        </article>
      </main>

      <Footer />
    </>
  );
}
