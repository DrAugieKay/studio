import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SessionData } from '@/lib/types';
import AdvisoryMemo from './AdvisoryMemo';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

export default function StepAdvisory({ sessionData, updateSessionData }: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Advisory Information</CardTitle>
        <CardDescription>
          Please review the following advisory memo related to the investment. You may need to scroll to see the full content.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <div className="max-h-[60vh] overflow-y-auto pr-4 border rounded-lg">
          <AdvisoryMemo sessionData={sessionData} updateSessionData={updateSessionData} />
        </div>
      </div>
    </>
  );
}
