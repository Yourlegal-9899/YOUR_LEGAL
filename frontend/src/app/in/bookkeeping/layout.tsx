import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookkeeping Services in India | GST Compliant | YourLegal',
  description:
    'Get expert bookkeeping services in India. We handle GST-compliant records, TDS, and cloud accounting for startups and SMEs. Ensure 100% compliance today!',
};

export default function IndiaBookkeepingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
