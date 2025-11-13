
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
import { Textarea } from '../ui/textarea';
import { CheckCircle } from 'lucide-react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
  setIsLastControlSection: (isLast: boolean) => void;
};

const rtLikertOptions = [
    'Extremely unlikely', 'Moderately unlikely', 'Somewhat unlikely',
    'Neither likely nor unlikely', 'Somewhat likely', 'Moderately likely', 'Extremely likely',
];

const dlLikertOptions = [
    'Strongly disagree', 'Disagree', 'Somewhat disagree',
    'Neither agree nor disagree', 'Somewhat agree', 'Agree', 'Strongly agree',
];

const sections = [
  {
    key: 'riskTolerance',
    title: 'a. Risk Tolerance (RT)',
    description: 'The next items ask how likely you (or your organization in your role) would be to engage in each of the following behaviors. Please answer with how you would act in your professional role.',
    questions: {
      q1: 'i. Investing a portion (e.g., 10%) of your organization’s surplus funds in a single high growth but volatile industry ETF.',
      q2: 'ii. Investing a portion (e.g., 10%) of your organization’s surplus funds in a new, unproven business venture.',
      q3: 'iii. Allocating a meaningful portion of your organization’s surplus funds to speculative equities with historically high volatility.',
      q4: 'iv. Investing a portion of your organization’s surplus funds in a diversified mutual fund that may decline in value during downturns.',
      q5: 'v. Placing organizational funds in short-term government securities to preserve capital.',
    },
    options: rtLikertOptions,
    schema: z.object({ q1: z.string().min(1, 'Required'), q2: z.string().min(1, 'Required'), q3: z.string().min(1, 'Required'), q4: z.string().min(1, 'Required'), q5: z.string().min(1, 'Required') }),
  },
  {
    key: 'digitalLiteracy',
    title: 'b. Digital Literacy (DL)',
    description: 'Please indicate your agreement with the following statements about your ability to find, evaluate, and use online advisory or financial information for organizational decisions.',
    questions: {
      q1: 'i. I know how to find reliable advisory information online for use in organizational decision-making.',
      q2: 'ii. I know how to evaluate the quality of online advisory or financial information for my organization.',
      q3: 'iii. I feel confident using online advisory platforms and information to make or support financial decisions for my organization.',
      q4: 'iv. I can confidently compare different online advisory reports to determine which is more reliable.',
      q5: 'v. I know where to find specialized online financial data or market analyses relevant to organizational decisions.',
    },
    options: dlLikertOptions,
    schema: z.object({ q1: z.string().min(1, 'Required'), q2: z.string().min(1, 'Required'), q3: z.string().min(1, 'Required'), q4: z.string().min(1, 'Required'), q5: z.string().min(1, 'Required') }),
  },
  {
    key: 'openRationale',
    title: 'c. Briefly explain the main reason for your choice in the decision task. (Optional)',
    description: '',
    questions: {}, // No radio questions
    options: [],
    schema: z.object({ rationale: z.string().optional() }),
  },
];

export default function StepControls({ sessionData, updateSessionData, setIsLastControlSection }: StepProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  const form = useForm({
    resolver: zodResolver(currentSection.schema),
    defaultValues: currentSection.key === 'openRationale' 
      ? { rationale: sessionData.openRationale || '' }
      : sessionData.controls?.[currentSection.key as keyof SessionData['controls']] || {},
    mode: 'onChange',
  });
  
  const watchedValues = useWatch({ control: form.control });

  const allQuestionsAnswered = useMemo(() => {
    if (currentSection.key === 'openRationale') return true; // Optional field
    const result = currentSection.schema.safeParse(watchedValues);
    return result.success;
  }, [watchedValues, currentSection]);

  useEffect(() => {
    setIsLastControlSection(isLastSection);
  }, [isLastSection, setIsLastControlSection]);
  
  useEffect(() => {
    const currentKey = currentSection.key;
    if (currentKey !== 'openRationale') {
        updateSessionData({
          controls: {
            ...sessionData.controls,
            [currentKey]: watchedValues,
          }
        });
    } else {
        updateSessionData({ openRationale: (watchedValues as any).rationale || null });
    }
  }, [watchedValues, currentSection.key, sessionData.controls, updateSessionData]);


  const handleNextSection = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    // Data is already saved by the useEffect watchers, so we just navigate.
    if (!isLastSection) {
      const nextSectionIndex = currentSectionIndex + 1;
      const nextSection = sections[nextSectionIndex];
      setCurrentSectionIndex(nextSectionIndex);
      form.reset(
        nextSection.key === 'openRationale'
        ? { rationale: sessionData.openRationale || '' }
        : sessionData.controls?.[nextSection.key as keyof SessionData['controls']] || {}
      );
    }
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">Section G: Controls &amp; Checks</CardTitle>
        </div>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="p-4 border rounded-lg bg-secondary/30">
              <h3 className="font-semibold text-base">{currentSection.title}</h3>
              {currentSection.description && <p className="text-sm text-muted-foreground mt-1 mb-4">{currentSection.description}</p>}
              
              {currentSection.key === 'openRationale' ? (
                <FormField
                  control={form.control}
                  name="rationale"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="My choice was based on..."
                          className="resize-none"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                Object.entries(currentSection.questions).map(([key, question]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key as any}
                    render={({ field }) => (
                      <FormItem className="space-y-3 py-4 border-t first:border-t-0">
                        <FormLabel>{question}</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="space-y-1">
                            {currentSection.options.map(option => (
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
                ))
              )}
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
