import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai/industries/healthcare',
  },
};

export default function CanonicalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
