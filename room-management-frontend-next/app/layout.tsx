import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/contexts/AppContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './globals.css'

export const metadata: Metadata = {
  title: 'Room Booking System',
  description: 'Room reservation and management system',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <AuthProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
