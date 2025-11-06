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

type ComprehensionFormValues = {
  q1: string;
  q2: string;
};

export default function StepComprehension({ sessionData, updateSessionData }: StepProps) {
  const form = useForm<ComprehensionFormValues>({
    defaultValues: {
      q1: sessionData.comprehension?.q1 || '',
      q2: sessionData.comprehension?.q2 || '',
    },
  });

  const { watch } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      updateSessionData({ comprehension: { q1: value.q1 || null, q2: value.q2 || null } });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSessionData]);

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Comprehension Check</CardTitle>
        <CardDescription>
          Let's check your understanding of the information presented.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form className="space-y-8">
            <FormField
              control={form.control}
              name="q1"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is the primary business of Innovate Inc.?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-1">
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="a" /></FormControl>
                        <FormLabel className="font-normal">E-commerce platform</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="b" /></FormControl>
                        <FormLabel className="font-normal">AI-powered data analysis</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="c" /></FormControl>
                        <FormLabel className="font-normal">Social media application</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="q2"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is the company currently seeking?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-1">
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="a" /></FormControl>
                        <FormLabel className="font-normal">A new CEO</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="b" /></FormControl>
                        <FormLabel className="font-normal">Initial seed funding</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3">
                        <FormControl><RadioGroupItem value="c" /></FormControl>
                        <FormLabel className="font-normal">Series A funding</FormLabel>
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
