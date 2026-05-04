import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { payrollWhenRequiredContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(payrollWhenRequiredContent);

export default function PayrollWhenRequiredPage() {
  return <UsaGuidePage content={payrollWhenRequiredContent} />;
}
