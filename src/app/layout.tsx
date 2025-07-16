import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/auth-context'
import { ClientHydration } from '@/components/client-hydration'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const calSans = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cal-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Artisan Sourdough | Fresh Baked Bread',
    template: '%s | Artisan Sourdough'
  },
  description: 'Order fresh, artisan sourdough bread made with traditional fermentation methods. Local pickup available. Organic ingredients, authentic taste.',
  keywords: ['sourdough', 'artisan bread', 'organic bread', 'local bakery', 'traditional fermentation', 'fresh bread'],
  authors: [{ name: 'Artisan Sourdough Bakery' }],
  creator: 'Artisan Sourdough Bakery',
  publisher: 'Artisan Sourdough Bakery',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Artisan Sourdough',
    title: 'Artisan Sourdough | Fresh Baked Bread',
    description: 'Order fresh, artisan sourdough bread made with traditional fermentation methods. Local pickup available.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fresh artisan sourdough bread',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artisan Sourdough | Fresh Baked Bread',
    description: 'Order fresh, artisan sourdough bread made with traditional fermentation methods.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you set them up
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${calSans.variable} font-sans h-full`}>
        <ClientHydration />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'font-medium glass-card text-sm',
            style: {
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: 'hsl(var(--foreground))',
              padding: '16px 20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--sage-600))',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: '#fff',
              },
            },
            loading: {
              iconTheme: {
                primary: 'hsl(var(--wheat-600))',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}