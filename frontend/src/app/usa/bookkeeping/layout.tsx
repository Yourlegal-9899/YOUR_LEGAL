import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Online Bookkeeping for US Businesses | YourLegal',
  description:
    'Simplify finances with YourLegal’s expert online bookkeeping for US businesses. Accurate, compliant, human-reviewed and tech-powered solutions for growth.',
};

export default function BookkeepingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
