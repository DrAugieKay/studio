
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SessionData, ExperimentalCondition } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProgressTracker from '@/components/session/ProgressTracker';

import StepConsent from '@/components/session/StepConsent';
import StepInitialAssessment from '@/components/session/StepInitialAssessment';
import StepAdvisoryScenario from '@/components/session/StepAdvisoryScenario';
import StepDossier from '@/components/session/StepDossier';
import StepAdvisory from '@/components/session/StepAdvisory';
import StepComprehension from '@/components/session/StepComprehension';
import StepManipulationChecks from '@/components/session/StepManipulationChecks';
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
  StepAdvisoryScenario,
  StepDossier,
  StepAdvisory,
  StepComprehension,
  StepManipulationChecks,
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
  'Advisory Scenario',
  'Dossier',
  'Advisory',
  'Comprehension',
  'Manipulation Checks',
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
    manipulationChecks: {},
  });
  const [isLastAssessmentSection, setIsLastAssessmentSection] = useState(false);


  useEffect(() => {
    // This simulates receiving the assigned condition from the server on page load.
    // In a real application, this would be an API call.
    if (!sessionData.condition) {
      const sources: ExperimentalCondition['advisorySource'][] = ['ai', 'human'];
      const frames: ExperimentalCondition['linguisticFrame'][] = ['abstract', 'concrete'];
      const scenarios: ExperimentalCondition['scenario'][] = ['xyz', 'techtrend'];

      const assignedCondition: ExperimentalCondition = {
        advisorySource: sources[Math.floor(Math.random() * sources.length)],
        linguisticFrame: frames[Math.floor(Math.random() * frames.length)],
        scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
      };

      console.log('Assigned Condition:', assignedCondition);
      updateSessionData({ condition: assignedCondition });
    }
  }, []); // Empty dependency array ensures this runs only once on mount.


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
  
  const showNextButton = useMemo(() => {
    if (stepNames[currentStep] === 'Consent') {
      return false;
    }
    if (stepNames[currentStep] === 'Initial Assessments' && !isLastAssessmentSection) {
      return false;
    }
    return true;
  }, [currentStep, isLastAssessmentSection]);


  const componentProps: any = {
    sessionData,
    updateSessionData,
    endSurvey,
    goToNextStep: handleNext,
    setIsLastAssessmentSection,
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
            {sessionData.condition ? (
              <CurrentStepComponent {...componentProps} />
            ) : (
               <div className="p-12 text-center">Loading session...</div>
            )}
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
            {showNextButton && <Button
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
