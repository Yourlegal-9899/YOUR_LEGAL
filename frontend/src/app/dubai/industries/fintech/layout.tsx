import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai/industries/fintech',
  },
};

export default function CanonicalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
