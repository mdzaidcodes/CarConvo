import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CarConvo - AI-Powered Car Recommendations',
  description: 'Find your perfect car through natural conversation with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
          {children}
        </div>
      </body>
    </html>
  )
}
