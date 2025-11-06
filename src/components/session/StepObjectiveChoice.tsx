'use client';

import { useForm } from 'react-hook-form';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { SessionData } from '@/lib/types';
import { useEffect } from 'react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

type FormValues = {
  choice: string;
};

export default function StepObjectiveChoice({ sessionData, updateSessionData }: StepProps) {
  const form = useForm<FormValues>({
    defaultValues: { choice: sessionData.objectiveChoice || '' },
  });

  const { watch } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      updateSessionData({ objectiveChoice: value.choice || null });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSessionData]);

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Investment Decision</CardTitle>
        <CardDescription>
          Based on all the information you have reviewed, please make your decision.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form className="space-y-8">
            <FormField
              control={form.control}
              name="choice"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Would you invest in Innovate Inc.?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                      <FormItem className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-secondary has-[:checked]:border-accent">
                        <FormControl><RadioGroupItem value="invest" /></FormControl>
                        <FormLabel className="font-normal text-base">Yes, I would invest.</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-secondary has-[:checked]:border-accent">
                        <FormControl><RadioGroupItem value="not-invest" /></FormControl>
                        <FormLabel className="font-normal text-base">No, I would not invest.</FormLabel>
                      </FormItem>
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
