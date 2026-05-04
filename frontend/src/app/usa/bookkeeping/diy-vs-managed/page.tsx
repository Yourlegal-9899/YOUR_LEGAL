import { UsaGuidePage } from '@/components/marketing/usa-guide-page';
import { bookkeepingDiyVsManagedContent, toGuideMetadata } from '@/lib/usa-missing-routes-content';

export const metadata = toGuideMetadata(bookkeepingDiyVsManagedContent);

export default function BookkeepingDiyVsManagedPage() {
  return <UsaGuidePage content={bookkeepingDiyVsManagedContent} />;
}
