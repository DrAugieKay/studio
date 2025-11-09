
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SessionData } from '@/lib/types';
import AdvisoryMemo from './AdvisoryMemo';
import { FileSearch } from 'lucide-react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

export default function StepAdvisory({ sessionData, updateSessionData }: StepProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileSearch className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">Advisory Information</CardTitle>
        </div>
        <CardDescription>
          Please review the following advisory memo related to the investment. You may need to scroll to see the full content.
        </CardDescription>
      </CardHeader>
      <div className="pt-0">
        <ScrollArea className="h-[60vh] rounded-lg border">
          <AdvisoryMemo sessionData={sessionData} updateSessionData={updateSessionData} />
        </ScrollArea>
      </div>
    </>
  );
}
