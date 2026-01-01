import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MomentumTracker - Build momentum, one task at a time",
  description: "Priority-weighted task tracking with daily scoring and momentum heatmap",
  generator: "v0.app",
  manifest: "/vigilant-palm-tree/manifest.json",
  icons: {
    icon: [
      {
        url: "/vigilant-palm-tree/assets/favicon-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/vigilant-palm-tree/assets/favicon-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/vigilant-palm-tree/assets/favicon.ico",
        type: "image/x-icon",
      },
    ],
    apple: "/vigilant-palm-tree/assets/apple-touch-icon.png"
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/vigilant-palm-tree/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="MomentumTracker" />
        <meta name="apple-mobile-web-app-title" content="MomentumTracker" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/vigilant-palm-tree/assets/android-chrome-192x192.png" />
        <link rel="icon" type="image/x-icon" href="/vigilant-palm-tree/assets/favicon.ico" />
        
        {/* Register Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/vigilant-palm-tree/service-worker.js')
                    .then(function(registration) {
                      console.log('Service Worker registered with scope:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('Service Worker registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
