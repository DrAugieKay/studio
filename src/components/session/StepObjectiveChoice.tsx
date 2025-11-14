
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { SessionData } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

const choiceOptions = [
    'Option A: Growth Equity Fund', 
    'Option B: Balanced Mutual Fund', 
    'Option C: Government Treasury Bond Portfolio', 
    'Option D: I do not know / Prefer not to decide'
];

const decisionQuestions = {
    confidence: "i. I am confident that the choice I selected is the right decision for the organization.",
    informed: "ii. I feel adequately informed to make this decision.",
    clearBasis: "iii. The advisory and materials provided a clear basis for making the decision.",
    satisfied: "iv. I am satisfied with the decision I made based on the advisory.",
};

const likertOptions = [
    'Strongly disagree', 'Disagree', 'Somewhat disagree',
    'Neither agree nor disagree', 'Somewhat agree', 'Agree', 'Strongly agree',
];

export default function StepObjectiveChoice({ sessionData, updateSessionData }: StepProps) {
  const [choiceMade, setChoiceMade] = useState(!!sessionData.objectiveChoice);
  
  const form = useForm({
    defaultValues: { 
      choice: sessionData.objectiveChoice || '',
      subjectiveDQ: {
        confidence: sessionData.subjectiveDQ?.confidence ?? '',
        informed: sessionData.subjectiveDQ?.informed ?? '',
        clearBasis: sessionData.subjectiveDQ?.clearBasis ?? '',
        satisfied: sessionData.subjectiveDQ?.satisfied ?? '',
      }
    },
  });

  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    // This effect runs whenever any form value changes.
    // We check if the main choice has been made and update session state.
    // This replaces the need for a separate "Save" button within the step.
    if (watchedValues.choice && !choiceMade) {
      updateSessionData({ objectiveChoice: watchedValues.choice });
      setChoiceMade(true);
    }
    // We also update the subjective DQ answers as they are filled out.
    if (watchedValues.subjectiveDQ) {
      updateSessionData({ subjectiveDQ: watchedValues.subjectiveDQ });
    }
  }, [watchedValues, updateSessionData, choiceMade]);

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
                    <FormLabel className="font-semibold text-base">a. Based on the advisory and your role, which investment option do you recommend?</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-1">
                        {choiceOptions.map((option, index) => (
                          <Label key={index} htmlFor={`choice-${index}`} className="flex items-start space-x-3 p-3 cursor-pointer has-[:checked]:text-accent transition-colors">
                            <FormControl>
                              <RadioGroupItem value={option} id={`choice-${index}`} className="mt-1" />
                            </FormControl>
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
          <Form {...form}>
            <div className="space-y-6">
              <h3 className="font-semibold text-base">b. Please indicate your agreement with the following statement about the decision you just made (or would make) after reviewing the advisory.</h3>
              {Object.entries(decisionQuestions).map(([key, label], qIndex) => (
                <FormField
                  key={qIndex}
                  control={form.control}
                  name={`subjectiveDQ.${key as keyof typeof decisionQuestions}`}
                  render={({ field }) => (
                    <FormItem className="space-y-3 p-4 border rounded-lg bg-secondary/30">
                      <FormLabel className="text-base">{label}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="w-full space-y-1">
                          {likertOptions.map((option, oIndex) => (
                            <Label key={oIndex} htmlFor={`${key}-${oIndex}`} className="flex items-center space-x-3 p-2 cursor-pointer has-[:checked]:text-accent transition-colors">
                              <FormControl>
                                <RadioGroupItem value={option} id={`${key}-${oIndex}`} />
                              </FormControl>
                              <span className="font-normal text-sm">{option}</span>
                            </Label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </Form>
        )}
      </div>
    </>
  );
}
