-- Önce inanc-esaslari kategorisinin ID'sini ve admin/ilk kullanıcının ID'sini bulup o yazıyı ekleyelim.
-- Güvenli bir ekleme için anonim bir yazar eklemiyoruz, doğrudan mevcut bir kategoriyi hedefliyoruz.
-- Bu script'i doğrudan Supabase SQL editöründe çalıştırabilirsiniz.

DO $$
DECLARE
  v_category_id uuid;
  v_author_id uuid;
BEGIN
  -- 1. "İnanç Esasları" kategorisinin ID'sini al
  SELECT id INTO v_category_id FROM public.categories WHERE slug = 'inanc-esaslari' LIMIT 1;
  
  -- 2. Sistemdeki ilk profilin ID'sini al
  SELECT id INTO v_author_id FROM public.profiles LIMIT 1;

  -- EĞER profil yoksa (eski hesapsa), sahte bir yazar ekle
  IF v_author_id IS NULL THEN
    v_author_id := gen_random_uuid();
    -- Bunu auth.users'a bağlamak zorunlu olduğu için kısıtlamayı by-pass edemeyiz.
    -- Bu yüzden auth.users tablosundaki ilk kullanıcının id'sini alıp ona profil oluşturalım:
    SELECT id INTO v_author_id FROM auth.users LIMIT 1;
    
    INSERT INTO public.profiles (id, username, role) 
    VALUES (v_author_id, 'Admin', 'editor')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 3. Örnek Makaleyi Ekle
  INSERT INTO public.posts (title, slug, content, type, is_published, category_id, author_id)
  VALUES (
    'Dört Kapı Kırk Makam: Kamil İnsan Olma Yolu',
    'dort-kapi-kirk-makam',
    '<p>Alevilik inancının temel yapı taşlarından biri olan <strong>Dört Kapı Kırk Makam</strong> öğretisi, Hacı Bektaş Veli tarafından sistemleştirilmiş bir ahlak ve kâmil insan (olgun insan) olma felsefesidir.</p>
    
    <h2>Dört Kapı Nedir?</h2>
    <p>İnsanın hamlıktan olgunluğa doğru çıktığı manevi basamakları ifade eder. Bu kapılar sırasıyla şunlardır:</p>
    <ol>
      <li><strong>Şeriat Kapısı:</strong> Kendi öz varlığını tanıma, toplumsal kurallara ve yasalara uyma, kötülüklerden uzak durma aşamasıdır. "Yel" (hava) unsurunu temsil eder.</li>
      <li><strong>Tarikat Kapısı:</strong> Bir yola, ikrara (söze) bağlanma aşamasıdır. Kişinin kendi iç dünyasına yöneldiği, nefsini terbiye etmeye başladığı evredir. "Ateş" unsurunu temsil eder.</li>
      <li><strong>Marifet Kapısı:</strong> Kendini, doğayı, evreni ve Hakk''ı tanıma bilincine erişme aşamasıdır. Hoşgörünün, sevginin ve ilmin kapısıdır. "Su" unsurunu temsil eder.</li>
      <li><strong>Hakikat Kapısı:</strong> Hakk ile bir olma, "Enel Hak" sırrına erme aşamasıdır. İkiliklerin ortadan kalktığı, kâmil insan olunan en üst mertebedir. "Toprak" unsurunu temsil eder.</li>
    </ol>

    <h2>Kırk Makam</h2>
    <p>Her bir kapının içinde geçilmesi gereken on adet makam (aşama) bulunur. Toplamda kırk makamlık bu yolculuk, bireyin bencil duygularından arınarak topluma ve evrene yararlı bir varlık haline gelmesini amaçlar. Yunus Emre''nin <em>"Şeriat, tarikat yoldur varana / Hakikat, marifet andan içeri"</em> dizesi bu felsefenin en güzel özetlerinden biridir.</p>
    
    <blockquote>
      "İlimden gidilmeyen yolun sonu karanlıktır."
      <br />— Hacı Bektaş Veli
    </blockquote>',
    'article',
    true,
    v_category_id,
    v_author_id
  );
END $$;
