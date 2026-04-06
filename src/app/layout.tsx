import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CATvisor',
  description: 'AI-powered cat health and behavior monitoring',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
