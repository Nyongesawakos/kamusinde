// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Remove direct import of SessionProvider here
// import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import NextAuthProvider from "@/components/providers/NextAuthProvider"; // Import the wrapper

import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KBHS School Management",
  description: "Comprehensive School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // SessionProvider is NO LONGER directly here
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Use the client component wrapper */}
        <NextAuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="kbhs-theme">
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
