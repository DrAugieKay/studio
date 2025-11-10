
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SessionData, ExperimentalCondition } from '@/lib/types';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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
import StepMediators from '@/components/session/StepMediators';
import StepControls from '@/components/session/StepControls';
import StepDebrief from '@/components/session/StepDebrief';
import StepEndSurvey from '@/components/session/StepEndSurvey';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';

const stepComponents = [
  StepConsent,
  StepInitialAssessment,
  StepAdvisoryScenario,
  StepDossier,
  StepAdvisory,
  StepComprehension,
  StepManipulationChecks,
  StepObjectiveChoice,
  StepMediators,
  StepControls,
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
  'Decision Task',
  'Mediators',
  'Controls',
  'Debrief',
  'End of Survey',
];

const EXPERIMENT_ID = 'exp_001';
const END_SURVEY_STEP = stepComponents.length - 1;

// Function to generate a simple random seed
const generateSeed = () => Math.random().toString(36).substring(2, 15);

export default function StartPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState<Partial<SessionData> | null>(null);
  const [isLastAssessmentSection, setIsLastAssessmentSection] = useState(false);
  const [isLastMediatorSection, setIsLastMediatorSection] = useState(false);
  const [isLastControlSection, setIsLastControlSection] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Start anonymous sign-in process when the component mounts
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  useEffect(() => {
    if (user && !sessionData) {
      const seed = generateSeed();
      // User is authenticated, create the initial session data object
      const sources: ExperimentalCondition['advisorySource'][] = ['ai', 'human'];
      const frames: ExperimentalCondition['linguisticFrame'][] = ['abstract', 'concrete'];
      const scenarios: ExperimentalCondition['scenario'][] = ['xyz', 'techtrend'];

      // Use a separate PRNG for reproducible assignment if needed, but Math.random is fine for now
      const randomSourceIndex = Math.floor(Math.random() * sources.length);
      const randomFrameIndex = Math.floor(Math.random() * frames.length);
      const randomScenarioIndex = Math.floor(Math.random() * scenarios.length);

      const assignedCondition: ExperimentalCondition = {
        advisorySource: sources[randomSourceIndex],
        linguisticFrame: frames[randomFrameIndex],
        scenario: scenarios[randomScenarioIndex],
      };
      
      const deviceInfo = {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      };

      const initialData: Partial<SessionData> = {
        id: user.uid,
        randomSeed: seed,
        startTime: new Date().toISOString(),
        status: 'In Progress',
        condition: assignedCondition,
        deviceInfo,
        consent: false,
        consent_ageCheck: null,
        consent_isEmployed: null,
        consent_hasParticipated: null,
        consent_consentGiven: null,
        manipulationChecks: {},
        mediators: {},
        endTime: null,
      };

      console.log('Assigned Condition:', assignedCondition);
      console.log('Device Info:', deviceInfo);
      console.log('Creating participant document for UID:', user.uid);

      // Create the document in Firestore
      const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
      setDocumentNonBlocking(participantDocRef, initialData, { merge: true });

      // Create a meta document if it doesn't exist
      const experimentMetaRef = doc(firestore, 'experiment_meta', EXPERIMENT_ID);
      setDocumentNonBlocking(experimentMetaRef, {
        id: EXPERIMENT_ID,
        seed: 'initial_seed_placeholder', // This is a generic seed for the experiment meta, not participant-specific
        stimuliVersion: 'v1.0',
        lexiconVersion: 'v1.0'
      }, { merge: true });


      setSessionData(initialData);
    }
  }, [user, sessionData, firestore]);


  const updateSessionData = (data: Partial<SessionData>) => {
    setSessionData((prev) => {
        const newData = { ...prev, ...data };
        if (user && firestore) {
            const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
            // Use non-blocking update to save to Firestore
            setDocumentNonBlocking(participantDocRef, newData, { merge: true });
        }
        return newData;
    });
  };

  const handleNext = () => {
    if (currentStep < stepComponents.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Final session data:', sessionData);
    }
  };
  
  const handleCompleteSurvey = () => {
    updateSessionData({ endTime: new Date().toISOString(), status: 'Completed' });
    router.push('/');
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const endSurvey = () => {
    updateSessionData({ endTime: new Date().toISOString(), status: 'Abandoned' });
    setCurrentStep(END_SURVEY_STEP);
  };

  const isNextDisabled = useMemo(() => {
    if (stepNames[currentStep] === 'Consent') {
      return !sessionData?.consent;
    }
    return false;
  }, [currentStep, sessionData?.consent]);
  
  const CurrentStepComponent = stepComponents[currentStep];
  const isDebrief = stepNames[currentStep] === 'Debrief' || stepNames[currentStep] === 'End of Survey';
  
  const showNextButton = useMemo(() => {
    if (stepNames[currentStep] === 'Consent') {
      return false;
    }
    if (stepNames[currentStep] === 'Initial Assessments' && !isLastAssessmentSection) {
      return false;
    }
    if (stepNames[currentStep] === 'Mediators' && !isLastMediatorSection) {
      return false;
    }
    if (stepNames[currentStep] === 'Controls' && !isLastControlSection) {
        return false;
    }
    return true;
  }, [currentStep, isLastAssessmentSection, isLastMediatorSection, isLastControlSection]);


  const componentProps: any = {
    sessionData,
    updateSessionData,
    endSurvey,
    goToNextStep: handleNext,
    handleCompleteSurvey, // Pass the new function down
    setIsLastAssessmentSection,
    setIsLastMediatorSection,
    setIsLastControlSection,
  };

  if (isUserLoading || !sessionData) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Initializing session...</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {!isDebrief && (
            <ProgressTracker
                current={currentStep}
                total={stepNames.length - 2} // Exclude Debrief and End
                stepNames={stepNames}
            />
        )}
        <Card className="mt-6 shadow-xl overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8">
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
