'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SessionData, ExperimentalCondition } from '@/lib/types';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
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
const DEBRIEF_STEP = stepComponents.length - 2;
const END_SURVEY_STEP = stepComponents.length - 1;


export default function StartPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState<Partial<SessionData> | null>(null);
  const [hasCreatedDocument, setHasCreatedDocument] = useState(false);
  const [isLastAssessmentSection, setIsLastAssessmentSection] = useState(false);
  const [isLastMediatorSection, setIsLastMediatorSection] = useState(false);
  const [isLastControlSection, setIsLastControlSection] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // This effect ensures we have an anonymous user, but does NOT create the session document.
  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  
  // This effect scrolls the window to the top whenever the current step changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);


  const updateSessionData = (data: Partial<SessionData>) => {
    if (!user || !firestore) {
      console.warn("Update attempted before user or firestore is available.");
      return;
    }
  
    // This is the new, robust session creation logic.
    // It only triggers ONCE, upon the first actual data update.
    if (!hasCreatedDocument) {
      const seed = Math.random().toString(36).substring(2, 15);
      const sources: ExperimentalCondition['advisorySource'][] = ['ai', 'human'];
      const frames: ExperimentalCondition['linguisticFrame'][] = ['abstract', 'concrete'];
      const scenarios: ExperimentalCondition['scenario'][] = ['xyz', 'techtrend'];
  
      const randomSourceIndex = Math.floor(Math.random() * sources.length);
      const randomFrameIndex = Math.floor(Math.random() * frames.length);
      const randomScenarioIndex = Math.floor(Math.random() * scenarios.length);
  
      const assignedCondition: ExperimentalCondition = {
        advisorySource: sources[randomSourceIndex],
        linguisticFrame: frames[randomFrameIndex],
        scenario: scenarios[randomScenarioIndex],
      };
      
      const deviceInfo = {
        userAgent: navigator.userAgent || 'Unknown',
        screenWidth: window.screen.width || 0,
        screenHeight: window.screen.height || 0,
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
        initialAssessments: {
            financialLiteracy: null,
            roleAndExperience: null,
            organizationalProfile: null,
        },
        dossierViewTime: 0,
        dossierScrollCount: 0,
        advisoryViewTime: 0,
        advisoryScrollCount: 0,
        comprehension: {},
        manipulationChecks: {},
        objectiveChoice: null,
        subjectiveDQ: {},
        mediators: {},
        controls: {},
        openRationale: null,
        endTime: null,
      };
      
      console.log('--- Creating unique session for UID:', user.uid);
      const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
      // Merge with the new incoming data and save.
      const fullInitialData = { ...initialData, ...data };
      setDocumentNonBlocking(participantDocRef, fullInitialData, { merge: false }); // Use merge: false to ensure it's a creation

      const experimentMetaRef = doc(firestore, 'experiment_meta', EXPERIMENT_ID);
      setDocumentNonBlocking(experimentMetaRef, {
        id: EXPERIMENT_ID,
        seed: 'initial_seed_placeholder',
        stimuliVersion: 'v1.0',
        lexiconVersion: 'v1.0'
      }, { merge: true });

      setSessionData(fullInitialData);
      setHasCreatedDocument(true); // Set the lock!
      return; // Exit after creation.
    }
  
    // For all subsequent updates, just update the state and save to Firestore.
    setSessionData((prev) => {
        const newData = { ...prev, ...data };
        const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
        setDocumentNonBlocking(participantDocRef, newData, { merge: true });
        return newData;
    });
  };

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < stepComponents.length) {
      // Logic to mark survey as complete when reaching the Debrief step
      if (nextStep === DEBRIEF_STEP) {
        updateSessionData({ endTime: new Date().toISOString(), status: 'Completed' });
      }
      setCurrentStep(nextStep);
    } else {
      console.log('Final session data:', sessionData);
    }
  };
  
  const handleCompleteSurvey = () => {
    // This button just navigates home. Completion is logged when Debrief is reached.
    router.push('/');
  }

  const handlePrevious = () => {
    if (currentStep > 1) { // Block going back to consent page
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
    goToPrevStep: handlePrevious,
    handleCompleteSurvey, // Pass the navigation function down
    setIsLastAssessmentSection,
    setIsLastMediatorSection,
    setIsLastControlSection,
  };

  if (isUserLoading || !auth || !firestore) {
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
             <CurrentStepComponent {...componentProps} />
          </CardContent>
        </Card>
        
        {!isDebrief && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep <= 1} // Disable on Consent and first step after
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
