'use client';

import { useState, useMemo } from 'react';
import type { SessionData } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProgressTracker from '@/components/session/ProgressTracker';

import StepConsent from '@/components/session/StepConsent';
import StepPreScreen from '@/components/session/StepPreScreen';
import StepDossier from '@/components/session/StepDossier';
import StepAdvisory from '@/components/session/StepAdvisory';
import StepComprehension from '@/components/session/StepComprehension';
import StepObjectiveChoice from '@/components/session/StepObjectiveChoice';
import StepSubjectiveDQ from '@/components/session/StepSubjectiveDQ';
import StepMediators from '@/components/session/StepMediators';
import StepControls from '@/components/session/StepControls';
import StepOpenRationale from '@/components/session/StepOpenRationale';
import StepDebrief from '@/components/session/StepDebrief';

const stepComponents = [
  StepConsent,
  StepPreScreen,
  StepDossier,
  StepAdvisory,
  StepComprehension,
  StepObjectiveChoice,
  StepSubjectiveDQ,
  StepMediators,
  StepControls,
  StepOpenRationale,
  StepDebrief,
];

const stepNames = [
  'Consent',
  'Pre-screen',
  'Dossier',
  'Advisory',
  'Comprehension',
  'Objective Choice',
  'Follow-up Questions',
  'Mediators',
  'Controls',
  'Rationale',
  'Debrief',
];

export default function StartPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState<Partial<SessionData>>({
    consent: false,
  });

  const handleNext = () => {
    if (currentStep < stepComponents.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle experiment completion
      console.log('Final session data:', sessionData);
      // Here you would typically submit the data to Firestore
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateSessionData = (data: Partial<SessionData>) => {
    setSessionData((prev) => ({ ...prev, ...data }));
  };

  const isNextDisabled = useMemo(() => {
    if (stepNames[currentStep] === 'Consent') {
      return !sessionData.consent;
    }
    return false;
  }, [currentStep, sessionData.consent]);

  const CurrentStepComponent = stepComponents[currentStep];
  const isDebrief = stepNames[currentStep] === 'Debrief';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {!isDebrief && (
            <ProgressTracker
                current={currentStep}
                total={stepNames.length -1}
                stepNames={stepNames}
            />
        )}
        <Card className="mt-6 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <CurrentStepComponent sessionData={sessionData} updateSessionData={updateSessionData} />
          </CardContent>
        </Card>
        
        {!isDebrief && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {currentStep === stepComponents.length - 2 ? 'Finish' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
