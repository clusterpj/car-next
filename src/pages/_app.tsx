import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import Layout from '@/components/Layout'
import { SessionProvider } from 'next-auth/react'
import '@/styles/globals.css'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  )
}

export default MyApp