'use client';

import { useForm } from 'react-hook-form';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { SessionData } from '@/lib/types';
import { useEffect } from 'react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

type FormValues = {
  rationale: string;
};

export default function StepOpenRationale({ sessionData, updateSessionData }: StepProps) {
  const form = useForm<FormValues>({
    defaultValues: { rationale: sessionData.openRationale || '' },
  });

  const { watch } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      updateSessionData({ openRationale: value.rationale || null });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSessionData]);

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Reason for Your Decision</CardTitle>
        <CardDescription>
          Please briefly explain the reasoning behind your investment decision.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
              name="rationale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Your Rationale</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="I chose to (not) invest because..."
                      className="resize-none"
                      rows={8}
                      {...field}
                    />
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
