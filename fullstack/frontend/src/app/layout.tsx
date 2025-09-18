import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/lib/analytics";
import StructuredData, { generateWebsiteStructuredData } from "@/components/seo/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "YangZhen 个人博客",
    template: "%s | YangZhen 个人博客"
  },
  description: "分享技术、思考和生活的个人博客网站，涵盖前端开发、后端架构、编程经验等内容。",
  keywords: ["博客", "技术", "编程", "前端", "后端", "JavaScript", "TypeScript", "React", "Next.js", "Node.js"],
  authors: [{ name: "YangZhen", url: "https://yangzhen.blog/about" }],
  creator: "YangZhen",
  publisher: "YangZhen",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: "YangZhen 个人博客",
    title: "YangZhen 个人博客",
    description: "分享技术、思考和生活的个人博客网站",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "YangZhen 个人博客",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YangZhen 个人博客",
    description: "分享技术、思考和生活的个人博客网站",
    creator: "@yangzhen",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <GoogleAnalytics />
        <StructuredData data={generateWebsiteStructuredData()} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
