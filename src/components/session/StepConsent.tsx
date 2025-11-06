'use client';

import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { SessionData } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

export default function StepConsent({ sessionData, updateSessionData }: StepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Consent to Participate</CardTitle>
        <CardDescription>
          Please read the following information carefully before deciding to participate.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <ScrollArea className="h-72 w-full rounded-md border p-4 mb-6">
            <h3 className="font-semibold mb-2">Research Study Information</h3>
            <p className="text-sm text-muted-foreground space-y-4">
                <span>
                    You are invited to participate in a research study about decision-making. 
                    This study is being conducted by researchers at the Advisory Insights Institute.
                </span>
                <span>
                    Your participation is voluntary. If you decide to participate, you will be asked to read a scenario, 
                    review some information, and answer a series of questions. The entire session is expected to take approximately 15-20 minutes.
                </span>
                <span>
                    Your responses will be kept confidential. Data from this study will be stored securely and only accessible to the research team. 
                    All data will be anonymized, and any published results will not contain any information that could identify you.
                </span>
                <span>
                    There are no direct benefits to you for participating in this study. However, your participation will help us better understand how people make decisions.
                    There are no known risks associated with this study beyond those of everyday life.
                </span>
                 <span>
                    If you have any questions about this study, you may contact the principal investigator at contact@advisoryinsights.dev.
                </span>
                <span>
                    By checking the box below, you are indicating that you are at least 18 years old, have read and understood this consent form, and agree to participate in this research study.
                </span>
            </p>
        </ScrollArea>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="consent"
            checked={sessionData.consent}
            onCheckedChange={(checked) => updateSessionData({ consent: !!checked })}
          />
          <Label htmlFor="consent" className="text-base font-medium">
            I have read and understood the consent form, and I agree to participate.
          </Label>
        </div>
      </div>
    </>
  );
}
