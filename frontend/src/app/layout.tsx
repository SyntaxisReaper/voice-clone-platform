import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '../components/layout/Navbar'
import { Providers } from '../components/providers/Providers'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  title: 'VCaaS - Voice Clone as a Service',
  description: 'Creator-first voice cloning platform with ethical licensing, watermarking, and API access',
  keywords: 'voice cloning, TTS, AI voice, voice synthesis, creator tools, licensing',
  authors: [{ name: 'VCaaS Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="font-inter antialiased">
        {/* Background Elements */}
        <div className="fixed inset-0 -z-10">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-twilight-500 via-twilight-400 to-berry-500" />
          
          {/* Animated gradient orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-r from-berry-400/30 to-twilight-400/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-to-l from-twilight-300/40 to-berry-300/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-gradient-to-tr from-berry-500/20 to-twilight-500/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '4s' }} />
          
          {/* Subtle texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(145, 47, 86, 0.4) 1px, transparent 0)
              `,
              backgroundSize: '24px 24px'
            }}
          />
        </div>

        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 relative z-10">
              {children}
            </main>
          </div>
        </Providers>
        
        <SpeedInsights />
      </body>
    </html>
  )
}
