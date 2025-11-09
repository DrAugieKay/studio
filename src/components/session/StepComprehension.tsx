
'use client';

import { useForm } from 'react-hook-form';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { SessionData } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import { ClipboardCheck } from 'lucide-react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

type ComprehensionFormValues = {
  q1: string;
  q2: string;
};

const shuffleArray = (array: string[]) => {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}


export default function StepComprehension({ sessionData, updateSessionData }: StepProps) {
  const form = useForm<ComprehensionFormValues>({
    defaultValues: {
      q1: sessionData.comprehension?.q1 || '',
      q2: sessionData.comprehension?.q2 || '',
    },
  });

  const { watch } = form;

  const scenarioName = useMemo(() => {
    if (sessionData.condition?.scenario === 'techtrend') return 'TechTrend Innovations';
    if (sessionData.condition?.scenario === 'xyz') return 'XYZ Manufacturing';
    return '';
  }, [sessionData.condition?.scenario]);

  const q1Options = useMemo(() => {
    if (!scenarioName) return [];
    const distractors = ['Zhongmen Holdings', 'Dailies Construction', 'ManTech Innovation', "I don't remember"];
    const allOptions = [scenarioName, ...distractors.filter(d => d !== scenarioName)]; // Ensure no duplicates
    
    // Shuffle the options to avoid order bias, but keep "I don't remember" at the end.
    const optionsToShuffle = allOptions.filter(o => o !== "I don't remember");
    const shuffled = shuffleArray(optionsToShuffle);
    
    // Add the correct company if it's not already in the shuffled list, to be safe.
    if (!shuffled.includes(scenarioName)) {
        shuffled.push(scenarioName);
    }

    // Filter out any other correct answer that might have slipped in.
    const finalShuffled = shuffled.filter(opt => opt === scenarioName || !['TechTrend Innovations', 'XYZ Manufacturing'].includes(opt));


    return [...finalShuffled, "I don't remember"];
  }, [scenarioName]);


  const q2Options = useMemo(() => shuffleArray(['6 months', '12 months', '24 months', "I don't remember"]), []);


  useEffect(() => {
    const subscription = watch((value) => {
      updateSessionData({ comprehension: { q1: value.q1 || null, q2: value.q2 || null } });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSessionData]);

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
      <div className="pt-0">
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
                      {q1Options.map(option => (
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
                       {q2Options.map(option => (
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
