'use client';

import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { SessionData } from '@/lib/types';
import { useState, useEffect } from 'react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

const questions = {
    psych_dist: "How psychologically distant did the investment feel?",
    perceived_la: "To what extent did you perceive the advisor as a 'thinking' versus 'feeling' entity?",
}

export default function StepMediators({ sessionData, updateSessionData }: StepProps) {
  const [values, setValues] = useState({
    psych_dist: sessionData.mediators?.psych_dist ?? 5,
    perceived_la: sessionData.mediators?.perceived_la ?? 5,
  });

  const handleValueChange = (key: keyof typeof values, newValue: number[]) => {
    setValues(prev => ({...prev, [key]: newValue[0]}));
  };

  useEffect(() => {
    updateSessionData({ mediators: values })
  }, [values, updateSessionData]);

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Further Questions (Mediators)</CardTitle>
        <CardDescription>
          Please rate the following statements.
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
                    defaultValue={[values[key as keyof typeof values]]}
                    onValueChange={(val) => handleValueChange(key as keyof typeof values, val)}
                    max={10}
                    step={1}
                     className="[&>span:last-child]:bg-primary"
                />
                <span className="text-sm text-muted-foreground">Very much</span>
            </div>
            </div>
        ))}
      </div>
    </>
  );
}
