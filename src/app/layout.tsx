import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { AppearanceProvider } from '@/contexts/AppearanceContext';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SuperVision",
  description: "SuperVision - MFT Hour Tracking Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased`}
        >
          <AppearanceProvider>
            {children}
          </AppearanceProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
