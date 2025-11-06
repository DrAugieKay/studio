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
    risk_composite: "How would you describe your general attitude towards taking financial risks?",
    fin_literacy: "How would you rate your knowledge of financial markets?",
}

export default function StepControls({ sessionData, updateSessionData }: StepProps) {
  const [values, setValues] =useState({
    risk_composite: sessionData.controls?.risk_composite ?? 5,
    fin_literacy: sessionData.controls?.fin_literacy ?? 5,
  });

  const handleValueChange = (key: keyof typeof values, newValue: number[]) => {
    setValues(prev => ({...prev, [key]: newValue[0]}));
  };

  useEffect(() => {
    updateSessionData({ controls: values })
  }, [values, updateSessionData]);

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Additional Questions (Controls)</CardTitle>
        <CardDescription>
          Finally, please answer these last few rating questions.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0 space-y-8">
        {Object.entries(questions).map(([key, label]) => (
            <div key={key} className="space-y-4">
            <Label htmlFor={key} className="text-base">{label}</Label>
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{key === 'risk_composite' ? 'Very risk-averse' : 'Novice'}</span>
                <Slider
                    id={key}
                    value={[values[key as keyof typeof values]]}
                    onValueChange={(val) => handleValueChange(key as keyof typeof values, val)}
                    max={10}
                    step={1}
                     className="[&>span:last-child]:bg-primary"
                />
                <span className="text-sm text-muted-foreground">{key === 'risk_composite' ? 'Very risk-seeking' : 'Expert'}</span>
            </div>
            </div>
        ))}
      </div>
    </>
  );
}
