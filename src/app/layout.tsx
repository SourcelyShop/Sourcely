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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased dark overflow-x-hidden`}
      >
        {children}
        <NewVersionPopup />
        <Toaster richColors theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
