import { MetadataRoute } from 'next';
import { getSitemapBaseUrl } from '@/lib/sitemap-utils';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSitemapBaseUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/login/',
        '/signup/',
        '/legal/',
        '/company/careers/',
        '/support/help-center/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
