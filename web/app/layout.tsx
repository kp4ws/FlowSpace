import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { TemplateProvider } from "../context/TemplateContext";
import { ThemeProvider } from "../context/ThemeContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowSpace",
  description: "Premium modular workspace for elite professionals",
};

import Sidebar from "../components/Sidebar";
import AIAssistance from "../components/AIAssistance";
import BottomNav from "../components/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased font-inter tracking-tight text-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          <ThemeProvider>
            <TemplateProvider>
              <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
                <Sidebar />
                <main className="flex-1 overflow-auto pb-20 md:pb-0 md:ml-72 relative">
                  {children}
                </main>
                <AIAssistance />
                <BottomNav />
              </div>
            </TemplateProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
