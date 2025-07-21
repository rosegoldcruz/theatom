'use client'

import { WagmiConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { config } from '@/lib/wagmi-config'
import { WalletProvider } from '@/contexts/WalletContext'
import { AppProvider } from '@/contexts/AppContext'
import { Toaster } from '@/components/ui/toaster'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
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
      </WagmiConfig>
    </QueryClientProvider>
  )
}
