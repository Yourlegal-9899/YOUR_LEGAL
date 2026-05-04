import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { payrollFaqsContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(payrollFaqsContent);

export default function PayrollFaqsPage() {
  return <UsaGuidePage content={payrollFaqsContent} />;
}
