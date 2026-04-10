import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Bookkeeping Services in Singapore | YourLegal',
  description:
    'Get expert bookkeeping services in Singapore. Stay compliant with accurate financial records for tax filings and GST returns. Contact YourLegal today.',
};

export default function SingaporeBookkeepingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
