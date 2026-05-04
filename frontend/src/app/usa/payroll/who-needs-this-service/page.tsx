import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { payrollWhoNeedsServiceContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(payrollWhoNeedsServiceContent);

export default function PayrollWhoNeedsServicePage() {
  return <UsaGuidePage content={payrollWhoNeedsServiceContent} />;
}
