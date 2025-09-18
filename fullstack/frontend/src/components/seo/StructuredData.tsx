export default function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function generateWebsiteStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "YangZhen 个人博客",
    "description": "分享技术、思考和生活的个人博客网站",
    "url": siteUrl,
    "author": {
      "@type": "Person",
      "name": "YangZhen",
      "url": `${siteUrl}/about`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/posts?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateArticleStructuredData(post: {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: { displayName: string };
  createdAt: string;
  updatedAt: string;
  slug: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';
  const postUrl = `${siteUrl}/posts/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt || post.title,
    "image": post.coverImage || `${siteUrl}/og-image.jpg`,
    "author": {
      "@type": "Person",
      "name": post.author.displayName,
      "url": `${siteUrl}/about`
    },
    "publisher": {
      "@type": "Organization",
      "name": "YangZhen 个人博客",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "url": postUrl
  };
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url.startsWith('http') ? breadcrumb.url : `${siteUrl}${breadcrumb.url}`
    }))
  };
}

export function generatePersonStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "YangZhen",
    "url": `${siteUrl}/about`,
    "image": `${siteUrl}/avatar.jpg`,
    "sameAs": [
      "https://github.com/yangzhen",
      "https://twitter.com/yangzhen"
    ],
    "jobTitle": "软件开发工程师",
    "worksFor": {
      "@type": "Organization",
      "name": "Tech Company"
    },
    "knowsAbout": [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "前端开发",
      "后端开发"
    ]
  };
}