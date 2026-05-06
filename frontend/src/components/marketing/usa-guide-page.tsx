import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NavHeader } from '@/components/layout/page-header';
import { AppFooter } from '@/components/layout/page-footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { UsaGuidePageContent } from '@/lib/usa-missing-routes-content';

type SectionProps = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const toSectionId = (title: string, index: number) => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug ? `${slug}-${index + 1}` : `section-${index + 1}`;
};

const SectionBlock = ({ id, title, paragraphs, bullets }: SectionProps) => {
  return (
    <section id={id} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-gray-700 sm:text-lg">
        {paragraphs.map((paragraph, index) => (
          <p key={`${title}-paragraph-${index}`}>{paragraph}</p>
        ))}
      </div>
      {bullets && bullets.length > 0 && (
        <ul className="mt-5 space-y-2 text-gray-700">
          {bullets.map((bullet, index) => (
            <li key={`${title}-bullet-${index}`} className="flex items-start gap-3">
              <span className="mt-2 inline-block h-2 w-2 rounded-full bg-blue-600" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export function UsaGuidePage({ content }: { content: UsaGuidePageContent }) {
  const sectionsWithIds = content.sections.map((section, index) => ({
    ...section,
    id: toSectionId(section.title, index),
  }));

  const pageFaqs = content.faqs ?? [];

  return (
    <div className="bg-white font-inter">
      <NavHeader />

      <main>
        <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Link
              href={content.backHref}
              className="mb-6 inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {content.backLabel}
            </Link>
            <p className="text-base font-semibold uppercase tracking-wide text-blue-700">{content.badge}</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
              {content.title}
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-600">{content.subtitle}</p>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <article>
              {content.quickAnswers && (
                <div className="mb-8 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8">
                  <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">Quick Answer</h3>
                  <div className="mt-4 space-y-3 text-gray-700">
                    <p>
                      <span className="font-semibold text-gray-900">TL;DR:</span> {content.quickAnswers.tldr}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Who this helps:</span>{' '}
                      {content.quickAnswers.whoThisHelps}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Decision summary:</span>{' '}
                      {content.quickAnswers.decisionSummary}
                    </p>
                  </div>
                </div>
              )}

              {sectionsWithIds.map((section) => (
                <SectionBlock
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  paragraphs={section.paragraphs}
                  bullets={section.bullets}
                />
              ))}

              {pageFaqs.length > 0 && (
                <section
                  id="frequently-asked-questions"
                  className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
                >
                  <h2 className="mb-5 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Frequently Asked Questions
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {pageFaqs.map((faq, index) => (
                      <AccordionItem key={`faq-accordion-${index}`} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left text-base font-semibold text-gray-900 hover:no-underline sm:text-lg">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base leading-relaxed text-gray-700">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              )}

              {content.cta && (
                <div className="mt-12 text-center">
                  <Button asChild size="lg">
                    <Link href={content.cta.href}>{content.cta.label}</Link>
                  </Button>
                </div>
              )}
            </article>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
