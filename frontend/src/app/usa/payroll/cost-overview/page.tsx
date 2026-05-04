import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { payrollCostOverviewContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(payrollCostOverviewContent);

export default function PayrollCostOverviewPage() {
  return <UsaGuidePage content={payrollCostOverviewContent} />;
}
