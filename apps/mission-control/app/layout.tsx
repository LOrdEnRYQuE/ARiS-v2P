import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ARiS Mission Control Panel',
  description: 'Real-time monitoring dashboard for ARiS agent society',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-secondary-900 text-white`}>
        {children}
      </body>
    </html>
  )
} 