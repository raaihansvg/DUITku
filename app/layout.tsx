import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import { parseTheme, THEME_COOKIE } from '@/lib/theme'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DUITku',
  description: 'Aplikasi manajemen uang',
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // Baca tema dari cookie di sisi server — menghindari kedipan (FOUC)
  // saat halaman pertama kali dimuat.
  const jar = await cookies()
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value)

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased${theme === 'dark' ? ' dark' : ''}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
