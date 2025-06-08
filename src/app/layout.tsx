
import type {Metadata} from 'next';
import Script from 'next/script'; // Import the Script component
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Providers from '@/components/layout/Providers'; // Assuming Providers will wrap context like Auth

export const metadata: Metadata = {
  title: 'dealscope',
  description: 'Never miss a deal again — Real-time, AI-curated eBay deals and auctions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GTAG_ID = 'G-Y3GM845E0W'; // Store GTAG_ID in a variable
  const ADSENSE_CLIENT_ID = 'ca-pub-7132522800049597'; // Store AdSense Client ID

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
        
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GTAG_ID}');
            `,
          }}
        />
        {/* Google AdSense */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        />
        {/* eBay Partner Network (EPN) Scripts */}
        <Script
          id="epn-campaign-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window._epn = {campaign: 5339112633};`,
          }}
        />
        <Script
          strategy="afterInteractive"
          src="https://epnt.ebay.com/static/epn-smart-tools.js"
        />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
