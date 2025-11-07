
'use client';

import { useState } from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { SessionData } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
  endSurvey: () => void;
  goToNextStep: () => void;
};

const questions = [
  {
    id: 'ageCheck',
    label: 'Are you 18 years or older?',
  },
  {
    id: 'isEmployed',
    label: 'Are you currently employed and involved in organizational financial decision-making or advisory support?',
  },
  {
    id: 'hasParticipated',
    label: 'Have you participated in corporate financial decisions in the last 3 years?',
  },
  {
    id: 'consentGiven',
    label: 'I consent to participate in this study.',
  },
];

export default function StepConsent({ updateSessionData, endSurvey, goToNextStep }: StepProps) {
  const [answers, setAnswers] = useState({
    ageCheck: '',
    isEmployed: '',
    hasParticipated: '',
    consentGiven: '',
  });

  const handleValueChange = (questionId: keyof typeof answers, value: 'Yes' | 'No') => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    updateSessionData({ consent: newAnswers.consentGiven === 'Yes' });

    if ((questionId === 'ageCheck' || questionId === 'isEmployed' || questionId === 'consentGiven') && value === 'No') {
      endSurvey();
    }
    
    if (questionId === 'consentGiven' && value === 'Yes') {
      // Find the "Next" button and click it
      const nextButton = document.querySelector('button:not([disabled]):has(svg.lucide-arrow-right)') as HTMLButtonElement | null;
      if (nextButton) {
        nextButton.click();
      } else {
        goToNextStep();
      }
    }
  };

  const showQuestion = (questionId: keyof typeof answers) => {
    switch (questionId) {
      case 'ageCheck':
        return true;
      case 'isEmployed':
        return answers.ageCheck === 'Yes';
      case 'hasParticipated':
        return answers.isEmployed === 'Yes';
      case 'consentGiven':
        return answers.hasParticipated !== '';
      default:
        return false;
    }
  };

  const showNextButton = answers.consentGiven !== 'Yes';

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Informed Consent</CardTitle>
      </CardHeader>
      <div className="p-6 pt-0 space-y-6">
        <div className="p-4 border rounded-md text-sm text-muted-foreground">
          You are invited to participate in a research study on corporate financial decision-making. This study examines how different sources of financial advice influence organizational decision-making quality. It involves reviewing financial advice and making a business investment recommendation. It will take approximately 15-20 minutes to complete. Your participation is voluntary and anonymous. You may withdraw at any time without penalty. The study involves viewing a simulated financial advisory scenario. There are no known risks. By proceeding, you confirm you are at least 18 years old, speak the survey language fluently, and agree to participate under these terms.
        </div>

        <div className="space-y-6">
          {questions.map((q) => (
            showQuestion(q.id as keyof typeof answers) && (
              <div key={q.id}>
                <Label className="font-semibold">{q.label}</Label>
                <RadioGroup
                  value={answers[q.id as keyof typeof answers]}
                  onValueChange={(value) => handleValueChange(q.id as keyof typeof answers, value as 'Yes' | 'No')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id={`${q.id}-yes`} />
                    <Label htmlFor={`${q.id}-yes`} className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id={`${q.id}-no`} />
                    <Label htmlFor={`${q.id}-no`} className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            )
          ))}
        </div>

        {(answers.ageCheck === 'No' || answers.isEmployed === 'No' || answers.consentGiven === 'No') && (
            <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Survey Ended</AlertTitle>
                <AlertDescription>
                    Thank you for your interest. Unfortunately, you do not meet the criteria for this study.
                </AlertDescription>
            </Alert>
        )}
      </div>
    </>
  );
}
