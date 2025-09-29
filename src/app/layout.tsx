import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HyperLearner - Smart Learning Platform',
  description: 'A teacher-student web app for managing learning materials and assignments',
  keywords: ['education', 'learning', 'teacher', 'student', 'assignments'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </Providers>
      </body>
    </html>
  )
}