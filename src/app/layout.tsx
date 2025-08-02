import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrintBridgeProvider } from "@/contexts/PrintBridgeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TapTab POS - Smart Restaurant",
  description: "Modern restaurant management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Debug: Track auth route requests
  if (typeof window !== 'undefined') {
    // Monitor for requests to /auth/login and /auth/signup
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0] as string;
      if (url.includes('/auth/login') || url.includes('/auth/signup')) {
        console.log('🚨 Detected request to:', url);
        console.log('📋 Stack trace:', new Error().stack);
      }
      return originalFetch.apply(this, args);
    };

    // Monitor for navigation to auth routes
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      const url = args[2] as string;
      if (url && (url.includes('/auth/login') || url.includes('/auth/signup'))) {
        console.log('🚨 Detected navigation to:', url);
        console.log('📋 Stack trace:', new Error().stack);
      }
      return originalPushState.apply(this, args);
    };
  }

  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <PrintBridgeProvider>
          {children}
        </PrintBridgeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Debug: Track any attempts to access /auth routes
              (function() {
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const url = args[0];
                  if (typeof url === 'string' && (url.includes('/auth/login') || url.includes('/auth/signup'))) {
                    console.log('🚨 External request to auth route:', url);
                    console.log('📋 Stack trace:', new Error().stack);
                  }
                  return originalFetch.apply(this, args);
                };
                
                // Monitor for direct navigation
                const observer = new PerformanceObserver((list) => {
                  list.getEntries().forEach((entry) => {
                    if (entry.name && entry.name.includes('/auth/')) {
                      console.log('🚨 Performance navigation to auth route:', entry.name);
                    }
                  });
                });
                observer.observe({ entryTypes: ['navigation'] });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
