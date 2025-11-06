'use client';

import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { SessionData } from '@/lib/types';
import { useState } from 'react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

const questions = {
    credibility: "How credible was the information provided?",
    clarity: "How clear was the advisory note?",
    confidence: "How confident are you in your decision?",
}

export default function StepSubjectiveDQ({ sessionData, updateSessionData }: StepProps) {
  const [values, setValues] = useState({
    credibility: sessionData.subjectiveDQ?.credibility ?? 5,
    clarity: sessionData.subjectiveDQ?.clarity ?? 5,
    confidence: sessionData.subjectiveDQ?.confidence ?? 5,
  });

  const handleValueChange = (key: keyof typeof values, newValue: number[]) => {
    const newValues = {...values, [key]: newValue[0]};
    setValues(newValues);
    updateSessionData({ subjectiveDQ: newValues });
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Follow-up Questions</CardTitle>
        <CardDescription>
          Please answer a few questions about your experience.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0 space-y-8">
        {Object.entries(questions).map(([key, label]) => (
            <div key={key} className="space-y-4">
            <Label htmlFor={key} className="text-base">{label}</Label>
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Not at all</span>
                <Slider
                    id={key}
                    value={[values[key as keyof typeof values]]}
                    onValueChange={(val) => handleValueChange(key as keyof typeof values, val)}
                    max={10}
                    step={1}
                    className="[&>span:last-child]:bg-primary"
                />
                <span className="text-sm text-muted-foreground">Extremely</span>
            </div>
            </div>
        ))}
      </div>
    </>
  );
}
