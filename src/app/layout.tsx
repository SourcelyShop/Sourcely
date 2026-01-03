import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { NewVersionPopup } from "@/components/NewVersionPopup";
import { GoogleAnalytics } from '@next/third-parties/google'
import { BASE_URL } from "@/utils/url";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Sourcely | Premium Roblox Asset Marketplace",
    template: "%s | Sourcely"
  },
  description: "The #1 marketplace for Roblox developers. Buy and sell high-quality models, scripts, UI, and maps. Join the community today.",
  keywords: ['Roblox', 'Assets', 'Scripts', 'Models', 'Marketplace', 'Lua', 'Studio', 'Developers', 'GameDev', 'selling', 'buying', 'selling scripts', 'buying scripts', 'selling models', 'buying models', 'selling UI', 'buying UI', 'selling maps', 'buying maps'],
  openGraph: {
    title: "Sourcely | Premium Roblox Asset Marketplace",
    description: "The #1 marketplace for Roblox developers. Buy and sell high-quality models, scripts, UI, and maps.",
    url: BASE_URL,
    siteName: 'Sourcely',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sourcely - Premium Roblox Asset Marketplace',
      }
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: "Sourcely",
    card: "summary_large_image",
  },
};

import { createClient } from '@/utils/supabase/server'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let showPopup = true
  if (user) {
    const { data: userDetails } = await supabase
      .from('users')
      .select('show_new_version_popup')
      .eq('id', user.id)
      .single()

    if (userDetails) {
      showPopup = userDetails.show_new_version_popup
    }
  }

  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased dark overflow-x-hidden`}
      >
        {children}
        <NewVersionPopup enabled={showPopup} />
        <Toaster richColors theme="dark" position="bottom-right" />
        <GoogleAnalytics gaId="G-7NFH1ERS5N" />
      </body>
    </html>
  );
}
