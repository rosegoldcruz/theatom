'use client'

import { ThemeProvider } from 'next-themes'
import ReownProvider from '@/contexts/ReownProvider'
import { WalletProvider } from '@/contexts/WalletContext'
import { AppProvider } from '@/contexts/AppContext'
import { Toaster } from '@/components/ui/toaster'

export function Providers({
  children,
  cookies
}: {
  children: React.ReactNode
  cookies: string | null
}) {
  return (
    <ReownProvider cookies={cookies}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <AppProvider>
          <WalletProvider>
            {children}
            <Toaster />
          </WalletProvider>
        </AppProvider>
      </ThemeProvider>
    </ReownProvider>
  )
}
