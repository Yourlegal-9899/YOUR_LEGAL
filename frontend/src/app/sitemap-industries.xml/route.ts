import { NextResponse } from 'next/server';
import {
  getSitemapBaseUrl,
  getSitemapLastModifiedDate,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';

const countries = ['usa', 'dubai', 'uk', 'singapore', 'australia', 'saudi-arabia', 'in', 'netherlands'];
const industrySubPages = [
    'saas', 'ecommerce', 'consulting', 'real-estate', 'logistics', 
    'startups', 'agencies', 'healthcare', 'manufacturing', 'fintech'
];

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
  const industryPages = countries.flatMap((country) => {
    const baseIndustryPage = `/${country}/industries`;
    const subIndustryPages = industrySubPages.map(industry => `/${country}/industries/${industry}`);
    return [baseIndustryPage, ...subIndustryPages];
  });

  const sitemap = generateSitemap(
    industryPages,
    getSitemapBaseUrl(),
    getSitemapLastModifiedDate()
  );
  
  return new NextResponse(sitemap, {
    headers: SITEMAP_XML_HEADERS,
  });
}
