
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { SessionData } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Loader2 } from 'lucide-react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

type ComprehensionFormValues = {
  q1: string;
  q2: string;
};

const shuffleArray = (array: string[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export default function StepComprehension({ sessionData, updateSessionData }: StepProps) {
  const form = useForm<ComprehensionFormValues>({
    defaultValues: {
      q1: sessionData.comprehension?.q1 || '',
      q2: sessionData.comprehension?.q2 || '',
    },
  });

  const watchedValues = useWatch({ control: form.control });
  
  const [shuffledQ1Options, setShuffledQ1Options] = useState<string[] | null>(null);
  const [shuffledQ2Options, setShuffledQ2Options] = useState<string[] | null>(null);

  const scenarioName = useMemo(() => {
    if (sessionData.condition?.scenario === 'techtrend') return 'TechTrend Innovations';
    if (sessionData.condition?.scenario === 'xyz') return 'XYZ Manufacturing';
    return '';
  }, [sessionData.condition?.scenario]);

  useEffect(() => {
    // This effect runs only on the client side after mount.
    // This prevents hydration errors by ensuring the server and client render the same initial non-shuffled state.
    if (scenarioName) {
        const distractors = ['Zhongmen Holdings', 'Dailies Construction', 'ManTech Innovation', "I don't remember"];
        const allOptions = [scenarioName, ...distractors.filter(d => d !== scenarioName)];
        const optionsToShuffle = allOptions.filter(o => o !== "I don't remember");
        const shuffled = shuffleArray(optionsToShuffle);
        setShuffledQ1Options([...shuffled, "I don't remember"]);
    }
    
    setShuffledQ2Options(shuffleArray(['6 months', '12 months', '24 months', "I don't remember"]));
  }, [scenarioName]);


  useEffect(() => {
    updateSessionData({ comprehension: { q1: watchedValues.q1 || null, q2: watchedValues.q2 || null } });
  }, [watchedValues, updateSessionData]);

  if (!shuffledQ1Options || !shuffledQ2Options) {
    // Render a loading state until the options are shuffled on the client.
    // This is crucial for preventing hydration mismatch.
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading questions...</p>
        </div>
    );
  }

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl">Section C: Comprehension Checks</CardTitle>
        </div>
        <CardDescription>
          Let's check your understanding of the information presented.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="q1"
              render={({ field }) => (
                <FormItem className="space-y-3 p-4 border rounded-lg bg-secondary/30">
                  <FormLabel className="font-semibold text-base">a. According to the scenario, what is the name of the Organization whose financial advisory concerns you just reviewed?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-1">
                      {shuffledQ1Options.map(option => (
                         <Label key={option} htmlFor={`q1-${option}`} className="flex items-start space-x-3 p-3 cursor-pointer has-[:checked]:text-accent transition-colors">
                            <FormControl><RadioGroupItem value={option} id={`q1-${option}`} className="mt-1" /></FormControl>
                            <span className="font-normal text-base">{option}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q2"
              render={({ field }) => (
                <FormItem className="space-y-3 p-4 border rounded-lg bg-secondary/30">
                  <FormLabel className="font-semibold text-base">b. What was the approximate time horizon mentioned for maintaining liquidity in the advisory?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-1">
                       {shuffledQ2Options.map(option => (
                         <Label key={option} htmlFor={`q2-${option}`} className="flex items-start space-x-3 p-3 cursor-pointer has-[:checked]:text-accent transition-colors">
                            <FormControl><RadioGroupItem value={option} id={`q2-${option}`} className="mt-1" /></FormControl>
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
      </div>
    </>
  );
}
