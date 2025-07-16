import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Artisan Sourdough | Fresh Baked Bread',
  description: 'Order fresh, artisan sourdough bread for pickup in Moses Lake. Handcrafted with organic ingredients.',
  keywords: 'sourdough, bread, artisan, Moses Lake, bakery, organic',
  openGraph: {
    title: 'Artisan Sourdough | Fresh Baked Bread',
    description: 'Order fresh, artisan sourdough bread for pickup in Moses Lake.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'font-medium',
            style: {
              borderRadius: '12px',
              background: '#333',
              color: '#fff',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}