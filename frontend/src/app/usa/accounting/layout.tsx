import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Accounting services in USA for Businesses | Your Legal',
  description:
    'Get Best Accounting services in USA by Your Legal. Tailored solutions for startups, e-commerce, foreign-owned companies, and more. Ensure compliance & growth.',
};

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
