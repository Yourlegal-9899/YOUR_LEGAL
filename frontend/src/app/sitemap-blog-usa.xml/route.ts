// SEO INTENT: This sitemap contains our US-focused "cluster" content.
// These pages support our main pillars and are designed to rank for long-tail keywords.
// By separating them, we create a clear topical cluster for the US market.
// A priority of 0.7 signals their importance as supporting content for our main pillars.

import { NextResponse } from 'next/server';
import { allPosts } from '@/lib/blog-posts';
import {
  getSitemapBaseUrl,
  getSitemapLastModifiedDate,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';

const allUsaPosts = allPosts
  .filter(post => post.country === 'USA' && post.category !== 'Pillar')
  .map(post => post.path);

function generateSitemap(urls: string[], baseUrl: string, lastModified: string) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map((url) => `
      <url>
        <loc>${baseUrl}${url}</loc>
        <lastmod>${lastModified}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>`)
      .join('')}
</urlset>`;
}

export async function GET() {
    const sitemap = generateSitemap(
      allUsaPosts,
      getSitemapBaseUrl(),
      getSitemapLastModifiedDate()
    );

    return new NextResponse(sitemap, {
        headers: SITEMAP_XML_HEADERS,
    });
}
