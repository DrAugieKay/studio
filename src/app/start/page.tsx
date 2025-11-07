
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SessionData } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProgressTracker from '@/components/session/ProgressTracker';

import StepConsent from '@/components/session/StepConsent';
import StepInitialAssessment from '@/components/session/StepInitialAssessment';
import StepDossier from '@/components/session/StepDossier';
import StepAdvisory from '@/components/session/StepAdvisory';
import StepComprehension from '@/components/session/StepComprehension';
import StepObjectiveChoice from '@/components/session/StepObjectiveChoice';
import StepSubjectiveDQ from '@/components/session/StepSubjectiveDQ';
import StepMediators from '@/components/session/StepMediators';
import StepControls from '@/components/session/StepControls';
import StepOpenRationale from '@/components/session/StepOpenRationale';
import StepDebrief from '@/components/session/StepDebrief';
import StepEndSurvey from '@/components/session/StepEndSurvey';

const stepComponents = [
  StepConsent,
  StepInitialAssessment,
  StepDossier,
  StepAdvisory,
  StepComprehension,
  StepObjectiveChoice,
  StepSubjectiveDQ,
  StepMediators,
  StepControls,
  StepOpenRationale,
  StepDebrief,
  StepEndSurvey,
];

const stepNames = [
  'Consent',
  'Initial Assessments',
  'Dossier',
  'Advisory',
  'Comprehension',
  'Objective Choice',
  'Follow-up Questions',
  'Mediators',
  'Controls',
  'Rationale',
  'Debrief',
  'End of Survey',
];

const END_SURVEY_STEP = stepComponents.length - 1;

export default function StartPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState<Partial<SessionData>>({
    consent: false,
  });

  const handleNext = () => {
    if (currentStep < stepComponents.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Final session data:', sessionData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const endSurvey = () => {
    setCurrentStep(END_SURVEY_STEP);
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
  const isDebrief = stepNames[currentStep] === 'Debrief' || stepNames[currentStep] === 'End of Survey';
  
  const componentProps: any = {
    sessionData,
    updateSessionData,
    endSurvey,
    goToNextStep: handleNext,
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {!isDebrief && (
            <ProgressTracker
                current={currentStep}
                total={stepNames.length - 2} // Exclude Debrief and End
                stepNames={stepNames}
            />
        )}
        <Card className="mt-6 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <CurrentStepComponent {...componentProps} />
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
            {stepNames[currentStep] !== 'Consent' && <Button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {currentStep === stepComponents.length - 3 ? 'Finish' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>}
          </div>
        )}
      </div>
    </div>
  );
}
