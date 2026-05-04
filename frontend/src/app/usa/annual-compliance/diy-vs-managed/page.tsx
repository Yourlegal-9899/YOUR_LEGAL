import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { annualComplianceDiyVsManagedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(annualComplianceDiyVsManagedContent);

export default function AnnualComplianceDiyVsManagedPage() {
  return <UsaGuidePage content={annualComplianceDiyVsManagedContent} />;
}
