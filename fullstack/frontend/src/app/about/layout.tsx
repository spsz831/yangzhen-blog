import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于我',
  description: 'YangZhen个人简介，技术栈介绍，联系方式以及博客创建的初衷和目标。',
  keywords: ['关于我', 'YangZhen', '个人简介', '技术栈', '联系方式'],
  openGraph: {
    title: '关于我 - YangZhen个人博客',
    description: 'YangZhen个人简介，技术栈介绍，联系方式以及博客创建的初衷和目标。',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}