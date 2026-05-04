import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { virtualCfoDiyVsManagedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(virtualCfoDiyVsManagedContent);

export default function VirtualCfoDiyVsManagedPage() {
  return <UsaGuidePage content={virtualCfoDiyVsManagedContent} />;
}
