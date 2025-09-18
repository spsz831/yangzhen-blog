import { Metadata } from 'next';
import { generateListMetadata } from '@/lib/seo';

export const metadata: Metadata = generateListMetadata({
  title: '文章分类',
  description: '浏览YangZhen博客的所有文章分类，包括技术教程、项目经验、学习笔记等不同主题内容。',
  path: '/categories',
  keywords: ['文章分类', '技术分类', '博客导航', '主题分类']
});

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}