import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { payrollProcessExplainedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(payrollProcessExplainedContent);

export default function PayrollProcessExplainedPage() {
  return <UsaGuidePage content={payrollProcessExplainedContent} />;
}
