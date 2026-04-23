import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookkeeping Services in Australia| ATO-Compliant| YourLegal',
  description:
    'Reliable bookkeeping services in Australia by YourLegal. We ensure ATO-compliant records, saving you time and avoiding penalties. Keep your business on track!',
  alternates: {
    canonical: 'https://www.yourlegal.io/australia/bookkeeping',
  },
};

export default function AustraliaBookkeepingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

