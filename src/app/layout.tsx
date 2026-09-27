export const runtime = 'edge';
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import RadioPlayer from "@/components/RadioPlayer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: {
    default: 'Yol - Alevi İnanış ve Kültür Platformu',
    template: '%s | Yol',
  },
  description: 'Alevi inanışı, kültürü, tarihi ve cem ritüelleri hakkında detaylı içerikler sunan modern bir topluluk platformu.',
  keywords: ['Alevilik', 'Cem', 'Semah', 'Tarih', 'İnanç', 'Edebiyat'],
  openGraph: {
    title: 'Yol - Alevi İnanış ve Kültür Platformu',
    description: 'Alevi inanışı, kültürü ve tarihi hakkında topluluk odaklı bilgi platformu.',
    url: 'https://yol.platform',
    siteName: 'Yol',
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} bg-parchment text-dark font-sans antialiased`}>
        {children}
        <RadioPlayer />
      </body>
    </html>
  );
}

