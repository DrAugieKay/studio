
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { SessionData } from '@/lib/types';
import { Button } from '../ui/button';
import { Lightbulb } from 'lucide-react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
  setIsLastMediatorSection: (isLast: boolean) => void;
};

const likertOptions = [
    'Strongly disagree', 'Disagree', 'Somewhat disagree',
    'Neither agree nor disagree', 'Somewhat agree', 'Agree', 'Strongly agree',
];

const sections = [
  {
    key: 'advisoryCredibility',
    title: 'a. Advisory Credibility (CR)',
    description: 'Please indicate your agreement with the following statements about the advisory source you just reviewed.',
    questions: {
      q1: 'i. The advisory source is honest.',
      q2: 'ii. The advisory source is trustworthy.',
      q3: 'iii. The advisory source is sincere.',
      q4: 'iv. The advisory source is competent.',
      q5: 'v. The advisory source is knowledgeable.',
      q6: 'vi. The advisory source is an expert.',
      q7: 'vii. The advisory source cares about our organization’s best interests.',
      q8: 'viii. The advisory source has our organization’s welfare at heart.',
      q9: 'ix. The advisory source is concerned about our organization.',
    },
    schema: z.object({
        q1: z.string().min(1, 'Required'), q2: z.string().min(1, 'Required'), q3: z.string().min(1, 'Required'),
        q4: z.string().min(1, 'Required'), q5: z.string().min(1, 'Required'), q6: z.string().min(1, 'Required'),
        q7: z.string().min(1, 'Required'), q8: z.string().min(1, 'Required'), q9: z.string().min(1, 'Required'),
    }),
  },
  {
    key: 'psychologicalDistance',
    title: 'b. Psychological Distance (PD)',
    description: 'Please indicate how much you agree with the following statements about the scenario and advisory you just reviewed.',
    questions: {
        q1: 'i. The scenario described felt distant in time for our organization.',
        q2: 'ii. The advisory felt socially distant from stakeholders in our organization (e.g., it did not feel written for people like us).',
        q3: 'iii. The scenario described felt geographically or contextually far from our organization’s operations.',
        q4: 'iv. The events described in the scenario felt unlikely to occur for our organization.',
    },
    schema: z.object({ 
        q1: z.string().min(1, 'Required'), q2: z.string().min(1, 'Required'), 
        q3: z.string().min(1, 'Required'), q4: z.string().min(1, 'Required') 
    }),
  },
  {
    key: 'linguisticAbstractness',
    title: 'c. Linguistic Abstractness (LA)',
    description: 'Please indicate how much you agree with the following statements about the language used in the advisory you just read.',
    questions: {
        q1: 'i. The language used in the advisory was abstract and high-level.',
        q2: 'ii. The advisory used general descriptions rather than specific, actionable steps.',
        q3: 'iii. I had difficulty forming a clear, concrete mental picture of the recommended actions.',
        q4: 'iv. The wording focused on broad principles rather than concrete procedures.',
    },
    schema: z.object({ 
        q1: z.string().min(1, 'Required'), q2: z.string().min(1, 'Required'), 
        q3: z.string().min(1, 'Required'), q4: z.string().min(1, 'Required') 
    }),
  },
  {
    key: 'outcomeFraming',
    title: 'd. Outcome Framing (OF)',
    description: 'Please indicate how much you agree with the following statements about how outcomes have been framed in the advisory you just read.',
    questions: {
        q1: 'i. The advisory emphasized potential gains from the recommended option.',
        q2: 'ii. The advisory emphasized potential losses from the alternative options.',
        q3: 'iii. The advisory focused on probabilities and uncertainty.',
        q4: 'iv. The advisory focused on certain guaranteed outcomes.',
    },
    schema: z.object({ 
        q1: z.string().min(1, 'Required'), q2: z.string().min(1, 'Required'), 
        q3: z.string().min(1, 'Required'), q4: z.string().min(1, 'Required') 
    }),
  }
];


export default function StepMediators({ sessionData, updateSessionData, setIsLastMediatorSection }: StepProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  const form = useForm({
    resolver: zodResolver(currentSection.schema),
    defaultValues: sessionData.mediators?.[currentSection.key as keyof SessionData['mediators']] || {},
    mode: 'onChange'
  });

  const watchedValues = useWatch({ control: form.control });

  const allQuestionsAnswered = useMemo(() => {
    const result = currentSection.schema.safeParse(watchedValues);
    return result.success;
  }, [watchedValues, currentSection.schema]);

  useEffect(() => {
    setIsLastMediatorSection(isLastSection);
  }, [isLastSection, setIsLastMediatorSection]);

  const handleNextSection = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    
    updateSessionData({
      mediators: {
        ...sessionData.mediators,
        [currentSection.key]: formData,
      },
    });

    if (!isLastSection) {
      const nextSectionIndex = currentSectionIndex + 1;
      const nextSectionKey = sections[nextSectionIndex].key as keyof SessionData['mediators'];
      setCurrentSectionIndex(nextSectionIndex);
      form.reset(sessionData.mediators?.[nextSectionKey] || {});
    }
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">Section F: Mediators & Constructs</CardTitle>
        </div>
        <CardDescription>
          Please answer the following questions based on your experience.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="p-4 border rounded-lg bg-secondary/30">
              <h3 className="font-semibold text-base">{currentSection.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{currentSection.description}</p>
              
              {Object.entries(currentSection.questions).map(([key, question]) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key as any}
                  render={({ field }) => (
                    <FormItem className="space-y-3 py-4 border-t first:border-t-0">
                      <FormLabel>{question}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="space-y-1">
                          {likertOptions.map(option => (
                            <FormItem key={option} className="flex items-center space-x-3">
                              <FormControl><RadioGroupItem value={option} /></FormControl>
                              <FormLabel className="font-normal">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            {!isLastSection && (
              <div className="flex justify-end">
                <Button type="button" onClick={handleNextSection} disabled={!allQuestionsAnswered}>
                  Continue
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </>
  );
}
