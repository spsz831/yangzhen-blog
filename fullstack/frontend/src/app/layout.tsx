import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "杨振的个人博客",
  description: "分享技术心得和项目经验的个人博客",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}