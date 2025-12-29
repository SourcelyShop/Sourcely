import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { NewVersionPopup } from "@/components/NewVersionPopup";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://sourcely.shop'),
  title: {
    default: "Sourcely",
    template: "%s | Sourcely"
  },
  description: "The Roblox Developer Marketplace",
  openGraph: {
    title: "Sourcely",
    description: "The Roblox Developer Marketplace",
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://sourcely.shop',
    siteName: 'Sourcely',
    locale: 'en_US',
    type: 'website',
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
      </body>
    </html>
  );
}
