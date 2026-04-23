import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Annual Compliance UK Company Services | YourLegal',
  description:
    'Stay compliant with YourLegal’s annual compliance UK company Services. We handle Companies House and HMRC filings, ensuring timely submissions and legal status.',
  alternates: {
    canonical: 'https://www.yourlegal.io/uk/annual-compliance',
  },
};

export default function UkAnnualComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

