import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Annual Company Compliance Saudi Arabia | YourLegal',
  description:
    'Annual company compliance Saudi Arabia with YourLegal. Ensure timely MISA and CR license renewals to keep your business operational and avoid heavy penalties.',
  alternates: {
    canonical: 'https://www.yourlegal.io/saudi-arabia/annual-compliance',
  },
};

export default function SaudiArabiaAnnualComplianceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

