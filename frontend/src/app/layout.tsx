import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopUtilityBar from "@/components/layout/TopUtilityBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AskAarambhChatbot from "@/components/chat/AskAarambhChatbot";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AARAMBH | Single Window Industrial Clearance Portal - Govt. of Maharashtra",
  description:
    "Unified Single Window System for rapid industrial clearances, approvals, schemes, and intelligent document validation in Maharashtra.",
  icons: {
    icon: [
      { url: "/aarambh-logo-new.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/aarambh-logo-new.png",
    apple: "/aarambh-logo-new.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <AuthProvider>
            <TopUtilityBar />
            <Header />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
            <AskAarambhChatbot />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
