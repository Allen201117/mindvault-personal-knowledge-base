import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { KnowledgeProvider } from "@/lib/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindVault · 个人知识库",
  description: "收集、整理、检索、回顾——一站式个人知识管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <KnowledgeProvider>
          <Sidebar />
          <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
            {children}
          </main>
        </KnowledgeProvider>
      </body>
    </html>
  );
}
