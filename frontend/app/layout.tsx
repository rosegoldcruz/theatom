import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { headers } from 'next/headers' // Import headers function
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ATOM - Arbitrage Trading System",
  description: "Advanced arbitrage trading with MEV protection",
}

// ATTENTION!!! RootLayout must be an async function to use headers()
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Retrieve cookies from request headers on the server
  const headersObj = await headers() // IMPORTANT: await the headers() call
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers cookies={cookies}>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
