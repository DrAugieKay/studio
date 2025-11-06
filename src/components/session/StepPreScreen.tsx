'use client';

import { useForm } from 'react-hook-form';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { SessionData } from '@/lib/types';
import { useEffect } from 'react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

type PreScreenFormValues = {
    age: string;
    education: string;
}

export default function StepPreScreen({ sessionData, updateSessionData }: StepProps) {
  const form = useForm<PreScreenFormValues>({
    defaultValues: {
      age: sessionData.preScreen?.age || '',
      education: sessionData.preScreen?.education || '',
    },
  });

  const { watch } = form;

  useEffect(() => {
    const subscription = watch((value) => {
      updateSessionData({ preScreen: { age: value.age || null, education: value.education || null } });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateSessionData]);

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Pre-Screen Questions</CardTitle>
        <CardDescription>
          Please answer a few questions about yourself.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form className="space-y-8">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is your age range?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="18-24" />
                        </FormControl>
                        <FormLabel className="font-normal">18-24</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="25-34" />
                        </FormControl>
                        <FormLabel className="font-normal">25-34</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="35-44" />
                        </FormControl>
                        <FormLabel className="font-normal">35-44</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="45+" />
                        </FormControl>
                        <FormLabel className="font-normal">45 or older</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What is your highest level of education?</FormLabel>
                   <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="high-school" />
                        </FormControl>
                        <FormLabel className="font-normal">High School or equivalent</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="bachelors" />
                        </FormControl>
                        <FormLabel className="font-normal">Bachelor's Degree</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="masters" />
                        </FormControl>
                        <FormLabel className="font-normal">Master's Degree</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="doctoral" />
                        </FormControl>
                        <FormLabel className="font-normal">Doctoral Degree or higher</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </>
  );
}
