import { Metadata } from 'next';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export function generateMetadata(seoData: SEOData): Metadata {
  const {
    title,
    description,
    keywords = [],
    author = 'YangZhen',
    canonicalUrl,
    ogImage,
    ogType = 'website',
    publishedTime,
    modifiedTime,
    section,
    tags = []
  } = seoData;

  const siteName = 'YangZhen 个人博客';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`
    },
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: siteName,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl || siteUrl,
    },
    openGraph: {
      title,
      description,
      type: ogType,
      siteName,
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : undefined,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@yangzhen',
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  };
}

export function generateArticleMetadata(post: {
  title: string;
  excerpt?: string;
  coverImage?: string;
  author: { displayName: string };
  category?: { name: string };
  tags?: { tag: { name: string } }[];
  createdAt: string;
  updatedAt: string;
  slug: string;
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';
  const canonicalUrl = `${siteUrl}/posts/${post.slug}`;

  const keywords = [
    '博客',
    '技术',
    '编程',
    ...(post.category ? [post.category.name] : []),
    ...(post.tags ? post.tags.map(t => t.tag.name) : [])
  ];

  return generateMetadata({
    title: post.title,
    description: post.excerpt || `${post.title} - ${post.author.displayName}的技术博客`,
    keywords,
    author: post.author.displayName,
    canonicalUrl,
    ogImage: post.coverImage,
    ogType: 'article',
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt,
    section: post.category?.name,
    tags: post.tags?.map(t => t.tag.name)
  });
}

export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
  slug: string;
  _count?: { posts: number };
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';
  const canonicalUrl = `${siteUrl}/categories/${category.slug}`;

  const postCount = category._count?.posts || 0;
  const description = category.description ||
    `${category.name}分类下有${postCount}篇文章，涵盖相关技术和经验分享。`;

  return generateMetadata({
    title: `${category.name} - 文章分类`,
    description,
    keywords: ['分类', category.name, '技术博客', '文章'],
    canonicalUrl,
  });
}

export function generateListMetadata(params: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';

  return generateMetadata({
    title: params.title,
    description: params.description,
    keywords: params.keywords || ['博客', '文章', '技术'],
    canonicalUrl: `${siteUrl}${params.path}`,
  });
}