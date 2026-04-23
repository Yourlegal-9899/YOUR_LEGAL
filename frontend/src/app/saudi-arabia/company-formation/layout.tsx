import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Incorporate a Company in Saudi Arabia | YourLegal',
  description:
    'Ready to incorporate a company in Saudi Arabia? YourLegal provides end-to-end MISA licensing, LLC formation, and PRO services for a compliant market entry.',
  alternates: {
    canonical: 'https://www.yourlegal.io/saudi-arabia/company-formation',
  },
};

export default function SaudiArabiaCompanyFormationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

