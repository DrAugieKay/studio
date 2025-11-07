
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
import { Input } from '../ui/input';
import { ClipboardList } from 'lucide-react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
  setIsLastAssessmentSection: (isLast: boolean) => void;
};

const financialLiteracyQuestions = {
  q1: {
    question: 'i. Suppose you had $100 at an interest rate of 2% left for 5 years. Which is closest to the amount you would have at the end of 5 years?',
    options: ['More than $102', 'Exactly $102', 'Less than $102', "I don't know"],
  },
  q2: {
    question: 'ii. If the interest rate on your savings account is 1% per year and inflation is 2% per year, after one year you will be able to buy?',
    options: ['More than today', 'The same as today', 'Less than today', "I don't know"],
  },
  q3: {
    question: 'iii. True or False: "Buying a single company\'s stock usually provides a safer return than a stock mutual fund."',
    options: ['True', 'False', "I don't know"],
  },
  q4: {
    question: 'iv. If the chance of a particular event is 1 out of 100, what is the chance of that event expressed as a percentage?',
    options: ['0.1%', '1%', '10%', "I don't know"],
  },
};

const roleAndExperienceQuestions = {
  q1: {
    question: 'i. Which best describes your role level?',
    options: ['Entry level', 'Professional/Analyst', 'Manager', 'Senior Manager', 'Director', 'Executive', 'Other'],
  },
  q2: {
    question: 'ii. What is your primary functional area?',
    options: ['Compliance/Legal', 'Finance / Accounting / Treasury', 'General Management', 'Human Resources', 'Information Technology', 'Marketing / Sales', 'Operations / Logistics', 'Corporate Strategy / Business Development', 'Other'],
  },
  q3: {
    question: 'iii. How involved are you in financial decision-making?',
    options: ['Not involved', 'Advisory Support', 'Implementation Only', 'Co-decision Maker', 'Primary Decision Maker'],
  },
  q4: {
    question: 'iv. How many years of experience do you have with corporate financial decisions?',
    options: ['None', '1-3 years', '4-6 years', '7+ years'],
  },
  q5: {
    question: 'v. Approximately how many years have you relied on advisory services in your work?',
    options: ['0 [Not at all]', '1–2 Years', '3–5 Years', '6–10 Years', '10+ Years'],
  },
};

const organizationalProfileQuestions = {
    q1: {
        question: 'i. What is the primary industry of your organization?',
        options: ['Technology / Software', 'Manufacturing / Industrial', 'Financial Services', 'Healthcare / Pharmaceuticals', 'Retail / Consumer Goods', 'Services / Consulting', 'Energy / Utilities', 'Other', 'Not applicable / Student'],
    },
    q2: {
        question: 'ii. What is your organization\'s approximate annual revenue?',
        options: ['Less than $50 million', '$50 million - $250 million', '$250 million - $1 billion', 'More than $1 billion', 'I do not know', 'Not applicable / Student'],
    },
    q3: {
        question: 'iii. How many employees does your organization have?',
        options: ['Fewer than 100', '100 - 499', '500 - 999', '1,000 - 4,999', '5,000 or more', 'Not applicable / Student'],
    },
    q4: {
        question: 'iv. Which best describes your organization\'s ownership structure?',
        options: ['Privately-held (e.g., family-owned, Private Equity-backed)', 'Publicly-traded', 'State-owned / Government entity', 'Non-profit', 'I do not know', 'Not applicable / Student'],
    },
    q5: {
        question: 'v. How would you describe your organization\'s typical appetite for financial risk?',
        options: ['Conservative ( prioritize avoiding losses)', 'Moderate ( seek balance between risk and return)', 'Aggressive ( pursue high returns, accept potential losses)', 'Not applicable / Student'],
    },
    q6: {
        question: 'vi. Does your firm have a formal investment policy/treasury mandate?',
        options: ['Yes', 'No'],
    },
    q7: {
        question: 'vii. Headquarters country:',
        options: [],
    },
};


const financialLiteracySchema = z.object({
  q1: z.string().min(1, { message: 'Required' }),
  q2: z.string().min(1, { message: 'Required' }),
  q3: z.string().min(1, { message: 'Required' }),
  q4: z.string().min(1, { message: 'Required' }),
});

const roleAndExperienceSchema = z.object({
  q1: z.string().min(1, { message: 'Required' }),
  q2: z.string().min(1, { message: 'Required' }),
  q2_other: z.string().optional(),
  q3: z.string().min(1, { message: 'Required' }),
  q4: z.string().min(1, { message: 'Required' }),
  q5: z.string().min(1, { message: 'Required' }),
}).refine(data => !(data.q2 === 'Other' && !data.q2_other), {
    message: "Please specify 'Other'",
    path: ['q2_other'],
});

const organizationalProfileSchema = z.object({
    q1: z.string().min(1, { message: 'Required' }),
    q1_other: z.string().optional(),
    q2: z.string().min(1, { message: 'Required' }),
    q3: z.string().min(1, { message: 'Required' }),
    q4: z.string().min(1, { message: 'Required' }),
    q5: z.string().min(1, { message: 'Required' }),
    q6: z.string().min(1, { message: 'Required' }),
    q7: z.string().optional(),
}).refine(data => !(data.q1 === 'Other' && !data.q1_other), {
    message: "Please specify 'Other'",
    path: ['q1_other'],
});

const sections = [
  {
    key: 'financialLiteracy',
    title: 'a. Financial Literacy (Please select the best answer).',
    questions: financialLiteracyQuestions,
    schema: financialLiteracySchema,
    defaultValues: { q1: '', q2: '', q3: '', q4: '' },
  },
  {
    key: 'roleAndExperience',
    title: 'b. Your Role and Experience (Please select the best answer):',
    questions: roleAndExperienceQuestions,
    schema: roleAndExperienceSchema,
    defaultValues: { q1: '', q2: '', q2_other: '', q3: '', q4: '', q5: '' },
  },
  {
    key: 'organizationalProfile',
    title: 'c. Organizational Profile',
    questions: organizationalProfileQuestions,
    schema: organizationalProfileSchema,
    defaultValues: { q1: '', q1_other: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '' },
  }
];

export default function StepInitialAssessment({ sessionData, updateSessionData, setIsLastAssessmentSection }: StepProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  const form = useForm({
    resolver: zodResolver(currentSection.schema),
    defaultValues: {
      ...currentSection.defaultValues,
      ...(sessionData.initialAssessments?.[currentSection.key as keyof SessionData['initialAssessments']] || {}),
    }
  });

  const watchedValues = useWatch({ control: form.control });
  
  const allQuestionsAnswered = useMemo(() => {
    const questionKeys = Object.keys(currentSection.questions);
    if (questionKeys.length === 0) return true;

    // For text input questions (optional ones)
    if (currentSection.key === 'organizationalProfile') {
        if (typeof (watchedValues as any).q7 === 'undefined') (watchedValues as any).q7 = ''; // It's optional
    }

    const radioQuestions = questionKeys.filter(key => (currentSection.questions as any)[key].options.length > 0);
    const allRadioAnswered = radioQuestions.every(key => !!(watchedValues as any)[key]);
    
    if (!allRadioAnswered) return false;

    // Check conditional text inputs
    if (currentSection.key === 'roleAndExperience' && (watchedValues as any).q2 === 'Other') {
        return !!(watchedValues as any).q2_other;
    }
    if (currentSection.key === 'organizationalProfile' && (watchedValues as any).q1 === 'Other') {
        return !!(watchedValues as any).q1_other;
    }

    return true;
}, [watchedValues, currentSection.questions, currentSection.key]);


  useEffect(() => {
    setIsLastAssessmentSection(isLastSection);
  }, [isLastSection, setIsLastAssessmentSection]);


  const handleNextSection = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    const currentSectionKey = sections[currentSectionIndex].key;
    
    updateSessionData({
      initialAssessments: {
        ...sessionData.initialAssessments,
        [currentSectionKey]: formData,
      },
    });

    if (!isLastSection) {
        const nextSectionIndex = currentSectionIndex + 1;
        const nextSection = sections[nextSectionIndex];
        const nextSectionKey = nextSection.key as keyof SessionData['initialAssessments'];
        setCurrentSectionIndex(nextSectionIndex);
        form.reset({
            ...nextSection.defaultValues,
            ...(sessionData.initialAssessments?.[nextSectionKey] || {}),
        });
    }
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">Section A: Initial Assessments</CardTitle>
        </div>
        <CardDescription>
          Please answer the following short questions about basic financial and numerical concepts. Choose the single best answer for each item.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Form {...form}>
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <h3 className="font-semibold">{currentSection.title}</h3>
            {Object.keys(currentSection.questions).length > 0 ? (
              Object.entries(currentSection.questions).map(([key, q]: [string, any]) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key as any}
                  render={({ field }) => (
                    <FormItem className="space-y-3 p-4 border rounded-lg bg-secondary/30">
                      <FormLabel>{q.question}</FormLabel>
                      <FormControl>
                        {q.options.length > 0 ? (
                            <RadioGroup 
                                onValueChange={field.onChange} 
                                value={field.value || ""}
                                className="space-y-2"
                            >
                            {q.options.map((option: string) => (
                                <FormItem key={option} className="flex items-center space-x-3">
                                <FormControl><RadioGroupItem value={option} /></FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                                </FormItem>
                            ))}
                            </RadioGroup>
                        ) : (
                            <Input {...field} placeholder="Your answer" value={field.value || ""} />
                        )}
                      </FormControl>
                      {currentSection.key === 'roleAndExperience' && key === 'q2' && (watchedValues as any).q2 === 'Other' && (
                        <FormField
                            control={form.control}
                            name="q2_other"
                            render={({ field }) => (
                                <FormItem className="pt-2">
                                    <FormControl>
                                        <Input {...field} placeholder="Please specify" value={field.value || ""} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                      )}
                      {currentSection.key === 'organizationalProfile' && key === 'q1' && (watchedValues as any).q1 === 'Other' && (
                        <FormField
                            control={form.control}
                            name="q1_other"
                            render={({ field }) => (
                                <FormItem className="pt-2">
                                    <FormControl>
                                        <Input {...field} placeholder="Please specify" value={field.value || ""} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                      )}
                    </FormItem>
                  )}
                />
              ))
            ) : (
              <div className="text-muted-foreground p-4 border rounded-lg bg-secondary/30">
                Questions for this section will be added soon.
              </div>
            )}

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

    