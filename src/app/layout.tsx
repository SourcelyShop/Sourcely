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
  title: "Sourcely",
  description: "The Roblox Developer Marketplace",
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
