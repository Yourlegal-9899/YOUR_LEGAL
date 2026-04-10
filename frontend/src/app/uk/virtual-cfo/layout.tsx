import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top- Rated Virtual CFO Services UK | YourLegal',
  description:
    'Get top-rated Virtual CFO services UK with YourLegal. Expert financial guidance to help your business grow, manage cash flow, and make strategic decisions.',
};

export default function UkVirtualCfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
