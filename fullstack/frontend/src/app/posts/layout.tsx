import { Metadata } from 'next';
import { generateListMetadata } from '@/lib/seo';

export const metadata: Metadata = generateListMetadata({
  title: '文章列表',
  description: 'YangZhen个人博客的所有技术文章，涵盖前端开发、后端架构、编程经验等内容。',
  path: '/posts',
  keywords: ['技术博客', '文章列表', '前端', '后端', '编程', 'JavaScript', 'TypeScript', 'React', 'Node.js']
});

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}