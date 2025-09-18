export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yangzhen.blog';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/auth/', '/profile/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}