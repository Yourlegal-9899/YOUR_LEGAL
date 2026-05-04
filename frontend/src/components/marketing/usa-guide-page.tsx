import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NavHeader } from '@/components/layout/page-header';
import { AppFooter } from '@/components/layout/page-footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { UsaGuidePageContent } from '@/lib/usa-missing-routes-content';
import { usaMissingRoutesDocData } from '@/lib/usa-missing-routes-doc-data';

type SectionProps = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type DocFaq = {
  question: string;
  answer: string;
};

const SectionBlock = ({ title, paragraphs, bullets }: SectionProps) => {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p key={`${title}-paragraph-${index}`}>{paragraph}</p>
        ))}
      </div>
      {bullets && bullets.length > 0 && (
        <ul className="mt-4 list-disc pl-6 space-y-2 text-gray-700">
          {bullets.map((bullet, index) => (
            <li key={`${title}-bullet-${index}`}>{bullet}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

const normalizeMojibake = (line: string) =>
  line
    .replace(/â€¢/g, '•')
    .replace(/ðŸ‘‰/g, '👉')
    .replace(/âŒ/g, '❌')
    .replace(/âœ…/g, '✅')
    .replace(/â€”/g, '—')
    .replace(/â€“/g, '–')
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€˜/g, "'")
    .replace(/â€™/g, "'");

const cleanDocLine = (line: string) =>
  normalizeMojibake(line)
    .replace(/\u00A0/g, ' ')
    .replace(/\u200B/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const stripDisplayMarkers = (line: string) =>
  line
    .replace(/^[•\-]\s*/u, '')
    .replace(/^👉\s*/u, '')
    .replace(/^❌\s*/u, '')
    .replace(/^✅\s*/u, '')
    .replace(/👉/gu, '')
    .trim();

const shouldSkipDocLine = (line: string) => {
  return (
    !line ||
    line === '________________________________________' ||
    line.startsWith('Meta Title:') ||
    line.startsWith('Meta Description:') ||
    line.startsWith('H1:')
  );
};

const isMainDocHeading = (line: string) => {
  return (
    /^SECTION \d+:/.test(line) ||
    /^Section \d+:/.test(line) ||
    /^Introduction:/.test(line) ||
    /^Final (Verdict|Takeaway)/.test(line) ||
    /^Strategic Insight/.test(line) ||
    /^What is /.test(line) ||
    /^When /.test(line) ||
    /^Who /.test(line) ||
    /^Why /.test(line) ||
    /^How /.test(line) ||
    /^Top /.test(line) ||
    /^Core /.test(line) ||
    /^Types of /.test(line) ||
    /^DIY vs /.test(line) ||
    /^Real Founder Scenario/.test(line) ||
    /^Cost Comparison/.test(line) ||
    /^The Hidden Cost/.test(line) ||
    /^What Managed /.test(line) ||
    /^When You MUST /.test(line) ||
    /^Audit Readiness Checklist/.test(line) ||
    /^Common Challenges /.test(line) ||
    /^Complete Payroll Flow/.test(line) ||
    /^PRIMARY TRIGGERS:/.test(line) ||
    /^WHO NEEDS PAYROLL SERVICES/.test(line) ||
    /^WHO MAY NOT NEED PAYROLL SERVICES/.test(line)
  );
};

const isSubDocHeading = (line: string) => {
  return (
    /^\d+\.\s/.test(line) ||
    /^Step \d+:/.test(line) ||
    /^(Choose|Use|Stop)\s/.test(line) ||
    /^Scenario \d+:/.test(line) ||
    /^Key Advantage$/.test(line) ||
    /^Key Insight$/.test(line) ||
    /^Real Insight$/.test(line) ||
    /^What You Get$/.test(line) ||
    /^Potential Penalties$/.test(line) ||
    /^Result:$/.test(line) ||
    /^Pros:$/.test(line) ||
    /^Cons:$/.test(line) ||
    /^Factor$/.test(line) ||
    /^Category$/.test(line) ||
    /^Component$/.test(line)
  );
};

const isFaqQuestion = (line: string) => /^(\d+\.\s*)?.+\?$/.test(stripDisplayMarkers(line));

const parseFaqLines = (faqLines: string[]) => {
  const faqs: DocFaq[] = [];
  let index = 0;

  while (index < faqLines.length) {
    const line = faqLines[index];
    if (!isFaqQuestion(line)) {
      index += 1;
      continue;
    }

    const question = stripDisplayMarkers(line);
    index += 1;
    const answerParts: string[] = [];

    while (index < faqLines.length && !isFaqQuestion(faqLines[index])) {
      const part = stripDisplayMarkers(faqLines[index]);
      if (
        part &&
        !/^CTA/i.test(part) &&
        !/^Final Note/i.test(part) &&
        !/^SECTION \d+:/i.test(part)
      ) {
        answerParts.push(part);
      }
      index += 1;
    }

    if (question && answerParts.length > 0) {
      faqs.push({
        question,
        answer: answerParts.join(' '),
      });
    }
  }

  return faqs;
};

const splitDocBodyAndFaq = (rawLines: string[], forceFaqMode = false) => {
  const normalizedLines = rawLines
    .map((line) => cleanDocLine(line))
    .filter((line) => !shouldSkipDocLine(line));

  if (forceFaqMode) {
    const firstQuestionIndex = normalizedLines.findIndex((line) => isFaqQuestion(line));
    if (firstQuestionIndex !== -1) {
      const bodyLines = normalizedLines
        .slice(0, firstQuestionIndex)
        .filter((line) => !/^SECTION \d+:/i.test(line));
      const faqs = parseFaqLines(normalizedLines.slice(firstQuestionIndex));
      return { bodyLines, faqs };
    }
  }

  const faqHeadingIndex = normalizedLines.findIndex((line) => /^FAQs$/i.test(line));
  if (faqHeadingIndex === -1) {
    return { bodyLines: normalizedLines, faqs: [] as DocFaq[] };
  }

  const bodyLines = normalizedLines.slice(0, faqHeadingIndex);
  const faqs = parseFaqLines(normalizedLines.slice(faqHeadingIndex + 1));

  return { bodyLines, faqs };
};

const renderDocLines = (lines: string[]) => {
  const elements: JSX.Element[] = [];
  const bulletBuffer: string[] = [];
  let previousVisibleLine = '';

  const flushBulletBuffer = () => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <ul key={`doc-bullets-${elements.length}`} className="mt-2 mb-6 list-disc pl-6 space-y-2 text-gray-700">
        {bulletBuffer.map((bullet, index) => (
          <li key={`doc-bullet-${elements.length}-${index}`}>{stripDisplayMarkers(bullet)}</li>
        ))}
      </ul>
    );
    bulletBuffer.length = 0;
  };

  lines.forEach((rawLine, index) => {
    const line = stripDisplayMarkers(cleanDocLine(rawLine));
    if (shouldSkipDocLine(line) || /^FAQs$/i.test(line)) return;

    if (isMainDocHeading(line)) {
      flushBulletBuffer();
      elements.push(
        <h2
          key={`doc-h2-${index}`}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mt-12 mb-5 border-l-4 border-blue-500 pl-4"
        >
          {line}
        </h2>
      );
      previousVisibleLine = line;
      return;
    }

    if (isSubDocHeading(line)) {
      flushBulletBuffer();
      elements.push(
        <h3 key={`doc-h3-${index}`} className="text-xl font-semibold text-gray-900 mt-8 mb-3">
          {line}
        </h3>
      );
      previousVisibleLine = line;
      return;
    }

    const isExplicitBullet = /^•/.test(line) || /^👉/.test(line) || /^❌/.test(line) || /^✅/.test(line);
    const isContextBullet =
      previousVisibleLine.endsWith(':') && !line.endsWith(':') && line.length <= 120;
    const looksLikeTableCell =
      line.length <= 40 &&
      !line.includes('.') &&
      !line.includes('—') &&
      !line.includes('“') &&
      !line.includes('"');

    if (isExplicitBullet || isContextBullet || looksLikeTableCell) {
      bulletBuffer.push(line.replace(/^•\s*/, '').trim());
      previousVisibleLine = line;
      return;
    }

    flushBulletBuffer();
    elements.push(
      <p key={`doc-p-${index}`} className="text-lg text-gray-700 leading-relaxed mb-4">
        {line}
      </p>
    );
    previousVisibleLine = line;
  });

  flushBulletBuffer();
  return elements;
};

export function UsaGuidePage({ content }: { content: UsaGuidePageContent }) {
  const docContent = content.docRoutePath ? usaMissingRoutesDocData[content.docRoutePath] : null;
  const hasDocData = Boolean(docContent?.lines?.length);
  const parsedDocContent = hasDocData
    ? splitDocBodyAndFaq(docContent.lines, (content.docRoutePath ?? '').endsWith('/faqs'))
    : null;
  const pageFaqs = hasDocData
    ? parsedDocContent?.faqs ?? []
    : (content.faqs ?? []).map((faq) => ({ question: faq.question, answer: faq.answer }));

  return (
    <div className="bg-white font-inter">
      <NavHeader />

      <main>
        <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href={content.backHref}
              className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {content.backLabel}
            </Link>
            <p className="text-base font-semibold text-blue-700 tracking-wide uppercase">
              {content.badge}
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              {content.title}
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">{content.subtitle}</p>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {!hasDocData && content.quickAnswers && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Answer</h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    <span className="font-semibold">TL;DR:</span> {content.quickAnswers.tldr}
                  </p>
                  <p>
                    <span className="font-semibold">Who this helps:</span>{' '}
                    {content.quickAnswers.whoThisHelps}
                  </p>
                  <p>
                    <span className="font-semibold">Decision summary:</span>{' '}
                    {content.quickAnswers.decisionSummary}
                  </p>
                </div>
              </div>
            )}

            {hasDocData && parsedDocContent ? (
              <article className="max-w-none bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
                {renderDocLines(parsedDocContent.bodyLines)}
              </article>
            ) : (
              content.sections.map((section) => (
                <SectionBlock
                  key={section.title}
                  title={section.title}
                  paragraphs={section.paragraphs}
                  bullets={section.bullets}
                />
              ))
            )}

            {pageFaqs.length > 0 && (
              <section className="mb-12 mt-14">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-6">
                  <Accordion type="single" collapsible className="w-full">
                    {pageFaqs.map((faq, index) => (
                      <AccordionItem key={`faq-accordion-${index}`} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-gray-900 hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 text-base leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>
            )}

            {content.cta && (
              <div className="mt-14 text-center">
                <Button asChild size="lg">
                  <Link href={content.cta.href}>{content.cta.label}</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
