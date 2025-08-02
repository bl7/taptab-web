import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TapTab POS - Smart Restaurant Point of Sale System",
  description: "Revolutionize your restaurant with TapTab POS. QR ordering, smart printing, real-time management. Perfect for restaurants, cafes, and food trucks.",
  keywords: "restaurant POS, point of sale, QR ordering, table service, restaurant management, kitchen printing, waiter app, restaurant software",
  authors: [{ name: "TapTab POS" }],
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "TapTab POS - Smart Restaurant Point of Sale System",
    description: "Revolutionize your restaurant with TapTab POS. QR ordering, smart printing, real-time management.",
    url: "https://taptabpos.com",
    siteName: "TapTab POS",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "TapTab POS Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TapTab POS - Smart Restaurant Point of Sale System",
    description: "Revolutionize your restaurant with TapTab POS. QR ordering, smart printing, real-time management.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
