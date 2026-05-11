import { normalizeSitemapDate } from '@/lib/sitemap-utils';

// NOTE:
// Keep these dates tied to real content changes.
// For static pages, update the relevant date when copy/layout/SEO content changes.
// For CMS/DB pages, we use the record updatedAt directly (see sitemap-blog-data.ts).

const COUNTRY_LASTMOD_BY_SLUG: Record<string, string> = {
  usa: '2026-05-11',
  dubai: '2026-05-10',
  uk: '2026-05-10',
  singapore: '2026-05-10',
  australia: '2026-05-10',
  'saudi-arabia': '2026-05-10',
  in: '2026-05-10',
  netherlands: '2026-05-10',
};

const SERVICE_LASTMOD_BY_SLUG: Record<string, string> = {
  'company-formation': '2026-05-10',
  'annual-compliance': '2026-05-10',
  'tax-compliance': '2026-05-09',
  bookkeeping: '2026-05-09',
  accounting: '2026-05-10',
  'virtual-cfo': '2026-05-10',
  payroll: '2026-05-10',
  'cross-border-accounting': '2026-05-10',
  pricing: '2026-04-30',
  process: '2026-04-30',
  services: '2026-04-30',
};

const INDUSTRY_LASTMOD_BY_SLUG: Record<string, string> = {
  saas: '2026-05-09',
  ecommerce: '2026-05-09',
  consulting: '2026-05-09',
  'real-estate': '2026-05-09',
  logistics: '2026-05-09',
  startups: '2026-05-09',
  agencies: '2026-05-09',
  healthcare: '2026-05-09',
  manufacturing: '2026-05-09',
  fintech: '2026-05-09',
};

const CORE_LASTMOD_BY_PATH: Record<string, string> = {
  '/': '2026-05-11',
  '/why-choose-us': '2026-05-09',
  '/products': '2026-05-08',
  '/industries': '2026-05-09',
  '/global-compliance': '2026-05-08',
  '/pricing-philosophy': '2026-05-08',
  '/case-studies': '2026-05-08',
  '/company/about': '2026-05-08',
  '/company/partner': '2026-05-08',
  '/support/contact-sales': '2026-05-11',
  '/blog': '2026-05-11',
};

const STATIC_BLOG_LASTMOD_BY_CATEGORY: Record<string, string> = {
  Pillar: '2026-05-08',
  'US Accounting': '2026-05-11',
  'US Bookkeeping': '2026-05-11',
  'US Tax & Compliance': '2026-05-11',
  'US Annual Compliance': '2026-05-11',
  'Virtual CFO': '2026-05-11',
  'US Payroll': '2026-05-11',
  'Cross-Border': '2026-05-11',
  'US Formation': '2026-05-10',
  'Audit Support': '2026-05-10',
  Formation: '2026-04-20',
  'Tax & Compliance': '2026-04-20',
  Payroll: '2026-04-20',
};

const STATIC_BLOG_LASTMOD_BY_PATH: Record<string, string> = {
  '/blog/non-resident-tax-guide': '2026-05-11',
  '/usa/accounting/diy-vs-managed': '2026-05-11',
  '/usa/annual-compliance/diy-vs-managed': '2026-05-11',
  '/usa/audit-support/diy-vs-managed': '2026-05-11',
  '/usa/audit-support/yourlegal-vs-stripe-atlas': '2026-05-11',
  '/usa/best-company-formation': '2026-05-11',
  '/usa/bookkeeping/diy-vs-managed': '2026-05-11',
  '/usa/company-formation/diy-vs-managed': '2026-05-11',
  '/usa/cross-border-accounting/diy-vs-managed': '2026-05-11',
  '/usa/cross-border-accounting/yourlegal-vs-stripe-atlas': '2026-05-11',
  '/usa/payroll/compliance-risks': '2026-05-11',
  '/usa/payroll/cost-overview': '2026-05-11',
  '/usa/payroll/diy-vs-managed': '2026-05-11',
  '/usa/payroll/faqs': '2026-05-11',
  '/usa/payroll/process-explained': '2026-05-11',
  '/usa/payroll/when-this-is-required': '2026-05-11',
  '/usa/payroll/who-needs-this-service': '2026-05-11',
  '/usa/virtual-cfo/diy-vs-managed': '2026-05-11',
  '/usa/virtual-cfo/yourlegal-vs-stripe-atlas': '2026-05-11',
};

const SITEMAP_FILE_LASTMOD_BY_NAME: Record<string, string> = {
  'sitemap-pillars.xml': '2026-05-11',
  'sitemap-services.xml': '2026-05-10',
  'sitemap-industries.xml': '2026-05-10',
  'sitemap-blog-usa.xml': '2026-05-11',
  'sitemap-blog-international.xml': '2026-04-20',
  'sitemap-countries.xml': '2026-05-10',
  'sitemap-core.xml': '2026-05-11',
};

const cleanDate = (value?: string) => normalizeSitemapDate(value);

export const getCountryLastmod = (country: string) => cleanDate(COUNTRY_LASTMOD_BY_SLUG[country]);

export const getServiceLastmod = (country: string, serviceSlug: string) =>
  cleanDate(SERVICE_LASTMOD_BY_SLUG[serviceSlug] || COUNTRY_LASTMOD_BY_SLUG[country]);

export const getIndustryLastmod = (country: string, industrySlug?: string) =>
  cleanDate(
    industrySlug
      ? INDUSTRY_LASTMOD_BY_SLUG[industrySlug] || COUNTRY_LASTMOD_BY_SLUG[country]
      : COUNTRY_LASTMOD_BY_SLUG[country]
  );

export const getCorePageLastmod = (path: string) => cleanDate(CORE_LASTMOD_BY_PATH[path]);

export const getStaticBlogLastmod = (path: string, category?: string) =>
  cleanDate(STATIC_BLOG_LASTMOD_BY_PATH[path] || (category ? STATIC_BLOG_LASTMOD_BY_CATEGORY[category] : undefined));

export const getSitemapFileLastmod = (sitemapName: string) =>
  cleanDate(SITEMAP_FILE_LASTMOD_BY_NAME[sitemapName]);
