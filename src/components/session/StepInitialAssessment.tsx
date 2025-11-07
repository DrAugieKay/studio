'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { SessionData } from '@/lib/types';
import { Button } from '../ui/button';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

const financialLiteracyQuestions = {
  q1: {
    question: 'i. Suppose you had $100 at an interest rate of 2% left for 5 years. Which is closest to the amount you would have at the end of 5 years?',
    options: ['More than $102', 'Exactly $102', 'Less than $102', 'I don\'t know'],
  },
  q2: {
    question: 'ii. If the interest rate on your savings account is 1% per year and inflation is 2% per year, after one year you will be able to buy?',
    options: ['More than today', 'The same as today', 'Less than today', 'I don\'t know'],
  },
  q3: {
    question: 'iii. True or False: "Buying a single company\'s stock usually provides a safer return than a stock mutual fund."',
    options: ['True', 'False', 'I don\'t know'],
  },
  q4: {
    question: 'iv. If the chance of a particular event is 1 out of 100, what is the chance of that event expressed as a percentage?',
    options: ['0.1%', '1%', '10%', 'I don\'t know'],
  },
};

const sections = [
  {
    key: 'financialLiteracy',
    title: 'a. Financial Literacy (Please select the best answer).',
    questions: financialLiteracyQuestions,
  },
  {
    key: 'numeracy',
    title: 'b. Numeracy Questions (Placeholder)',
    questions: {},
  },
  {
    key: 'cognitiveReflection',
    title: 'c. Cognitive Reflection Questions (Placeholder)',
    questions: {},
  }
];

export default function StepInitialAssessment({ sessionData, updateSessionData }: StepProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const form = useForm();

  const handleNextSection = () => {
    // Logic to save data for the current section
    const formData = form.getValues();
    const currentSectionKey = sections[currentSectionIndex].key;
    
    updateSessionData({
      initialAssessments: {
        ...sessionData.initialAssessments,
        [currentSectionKey]: formData,
      },
    });

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      form.reset();
    } else {
      // This part will be connected to the main 'Next' button functionality
      console.log('Finished all initial assessments');
    }
  };
  
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Section A: Initial Assessments</CardTitle>
        <CardDescription>
          Please answer the following short questions about basic financial and numerical concepts. Choose the single best answer for each item.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form className="space-y-8">
            <h3 className="font-semibold">{currentSection.title}</h3>
            {Object.entries(currentSection.questions).map(([key, q]) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                defaultValue={sessionData.initialAssessments?.[currentSection.key as keyof SessionData['initialAssessments']]?.[key] || ''}
                render={({ field }) => (
                  <FormItem className="space-y-3 p-4 border rounded-lg bg-secondary/30">
                    <FormLabel>{q.question}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {q.options.map((option) => (
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

            {!isLastSection && (
                <div className="flex justify-end">
                    <Button type="button" onClick={handleNextSection}>
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
