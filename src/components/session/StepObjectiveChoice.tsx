
'use client';

import { useForm } from 'react-hook-form';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { SessionData } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

type FormValues = {
  choice: string;
};

const decisionQuestions = {
    confidence: "i. I am confident that the choice I selected is the right decision for the organization.",
    informed: "ii. I feel adequately informed to make this decision.",
    clearBasis: "iii. The advisory and materials provided a clear basis for making the decision.",
    satisfied: "iv. I am satisfied with the decision I made based on the advisory.",
};

const likertOptions = [
    'Strongly disagree',
    'Disagree',
    'Somewhat disagree',
    'Neither agree nor disagree',
    'Somewhat agree',
    'Agree',
    'Strongly agree',
];

export default function StepObjectiveChoice({ sessionData, updateSessionData }: StepProps) {
  const [choiceMade, setChoiceMade] = useState(!!sessionData.objectiveChoice);
  const form = useForm<FormValues>({
    defaultValues: { choice: sessionData.objectiveChoice || '' },
  });

  const [subjectiveValues, setSubjectiveValues] = useState({
    confidence: sessionData.subjectiveDQ?.confidence ?? 4,
    informed: sessionData.subjectiveDQ?.informed ?? 4,
    clearBasis: sessionData.subjectiveDQ?.clearBasis ?? 4,
    satisfied: sessionData.subjectiveDQ?.satisfied ?? 4,
  });

  const { watch, getValues } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      const currentChoice = value.choice;
      if (currentChoice && !choiceMade) {
        updateSessionData({ objectiveChoice: currentChoice });
        // Use a timeout to allow the state update to propagate before showing the next part
        setTimeout(() => setChoiceMade(true), 100);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSessionData, choiceMade]);

  const handleSliderChange = (key: keyof typeof subjectiveValues, newValue: number) => {
    const newValues = { ...subjectiveValues, [key]: newValue };
    setSubjectiveValues(newValues);
    updateSessionData({ subjectiveDQ: newValues });
  };


  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Section E: Decision-Making Task and Choice</CardTitle>
        <CardDescription>
          Based on all the information you have reviewed, please make your decision.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        {!choiceMade ? (
            <Form {...form}>
            <form className="space-y-8">
                <FormField
                control={form.control}
                name="choice"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel className="font-semibold">a. Based on the advisory and your role, which investment option do you recommend?</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {['Option A: Growth Equity Fund', 'Option B: Balanced Mutual Fund', 'Option C: Government Treasury Bond Portfolio', 'Option D: I do not know / Prefer not to decide'].map(option => (
                            <Label key={option} htmlFor={`choice-${option}`} className="flex items-center space-x-3 p-2 cursor-pointer has-[:checked]:text-accent transition-colors">
                                <FormControl><RadioGroupItem value={option} id={`choice-${option}`} /></FormControl>
                                <span className="font-normal text-base">{option}</span>
                            </Label>
                        ))}
                        </RadioGroup>
                    </FormControl>
                    </FormItem>
                )}
                />
            </form>
            </Form>
        ) : (
            <div className="space-y-6">
                 <h3 className="font-semibold">b. Please indicate your agreement with the following statement about the decision you just made (or would make) after reviewing the advisory.</h3>
                 {Object.entries(decisionQuestions).map(([key, label]) => (
                    <div key={key} className="space-y-3 p-4 border rounded-lg bg-secondary/30">
                        <Label htmlFor={key} className="text-base">{label}</Label>
                        <div className="flex items-center gap-4 pt-2">
                           <RadioGroup 
                             onValueChange={(val) => handleSliderChange(key as keyof typeof subjectiveValues, likertOptions.indexOf(val))} 
                             defaultValue={likertOptions[subjectiveValues[key as keyof typeof subjectiveValues]]}
                             className="w-full space-y-2"
                            >
                               {likertOptions.map((option) => (
                                <Label key={option} htmlFor={`${key}-${option}`} className="flex items-center space-x-3 p-2 cursor-pointer has-[:checked]:text-accent transition-colors">
                                    <FormControl><RadioGroupItem value={option} id={`${key}-${option}`} /></FormControl>
                                    <span className="font-normal text-sm">{option}</span>
                                </Label>
                               ))}
                           </RadioGroup>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </>
  );
}
