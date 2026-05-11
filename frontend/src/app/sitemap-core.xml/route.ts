import { NextResponse } from 'next/server';
import {
  buildUrlSetXml,
  getSitemapBaseUrl,
  SitemapUrlEntry,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';
import { getCorePageLastmod } from '@/lib/sitemap-lastmod';

export const dynamic = 'force-dynamic';

const staticPages = [
    { url: '/', priority: 1.0 },
    { url: '/why-choose-us', priority: 0.8 },
    { url: '/products', priority: 0.8 },
    { url: '/industries', priority: 0.8 },
    { url: '/global-compliance', priority: 0.8 },
    { url: '/pricing-philosophy', priority: 0.7 },
    { url: '/case-studies', priority: 0.7 },
    { url: '/company/about', priority: 0.6 },
    { url: '/company/partner', priority: 0.6 },
    { url: '/support/contact-sales', priority: 0.6 },
    { url: '/blog', priority: 0.9 },
 ] as const;

export async function GET() {
  const entries: SitemapUrlEntry[] = staticPages.map((page) => ({
    path: page.url,
    lastmod: getCorePageLastmod(page.url),
    changefreq: 'weekly',
    priority: page.priority,
  }));
  const sitemap = buildUrlSetXml(entries, getSitemapBaseUrl());
  
  return new NextResponse(sitemap, {
    headers: SITEMAP_XML_HEADERS,
  });
}
