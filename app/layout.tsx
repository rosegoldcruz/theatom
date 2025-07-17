import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AppProvider } from '@/contexts/AppContext'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ArbiBot Pro - Advanced AI Arbitrage Trading',
  description: 'Futuristic AI-powered arbitrage trading bot with multi-chain support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} theme-ai`}>
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 opacity-50 pointer-events-none" />
        <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AppProvider>
            <div className="relative z-10">
              {children}
            </div>
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}