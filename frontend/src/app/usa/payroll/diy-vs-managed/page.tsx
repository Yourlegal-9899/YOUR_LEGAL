import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { payrollDiyVsManagedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(payrollDiyVsManagedContent);

export default function PayrollDiyVsManagedPage() {
  return <UsaGuidePage content={payrollDiyVsManagedContent} />;
}
