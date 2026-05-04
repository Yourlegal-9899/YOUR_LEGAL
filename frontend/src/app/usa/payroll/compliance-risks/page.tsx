import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { payrollComplianceRisksContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(payrollComplianceRisksContent);

export default function PayrollComplianceRisksPage() {
  return <UsaGuidePage content={payrollComplianceRisksContent} />;
}
