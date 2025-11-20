
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SessionData, ExperimentalCondition } from '@/lib/types';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
import { signOut } from 'firebase/auth';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
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
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const manageSession = async () => {
        if (!auth) return;

        // Force sign-out to ensure a new anonymous user for each new survey attempt.
        // This is the key to preventing session overwriting.
        await signOut(auth);
        
        // Initiate a new anonymous sign-in. The onAuthStateChanged listener in the provider
        // will pick this up. Once the user object is available, the rest of the logic can run.
        initiateAnonymousSignIn(auth);

        // From this point, an onAuthStateChanged listener will pick up the new user.
        // We set loading to false to allow the UI to render the consent step.
        setIsLoadingSession(false);
    };

    manageSession();
  }, [auth]);


  const updateSessionData = async (data: Partial<SessionData>) => {
    if (!user || !firestore) {
      console.warn("Update attempted before user or firestore is available.");
      return;
    }
  
    // If sessionData is null, this is the first interaction. Create the session.
    if (!sessionData) {
      console.log('--- First interaction: Creating session document in Firestore for UID:', user.uid);
      
      const seed = Math.random().toString(36).substring(2, 15);
      const sources: ExperimentalCondition['advisorySource'][] = ['ai', 'human'];
      const scenarios: ExperimentalCondition['scenario'][] = ['xyz', 'techtrend'];
  
      const randomSourceIndex = Math.floor(Math.random() * sources.length);
      const randomScenarioIndex = Math.floor(Math.random() * scenarios.length);
  
      const assignedCondition: ExperimentalCondition = {
        advisorySource: sources[randomSourceIndex],
        linguisticFrame: 'abstract', // Hardcoded as per the new requirement
        scenario: scenarios[randomScenarioIndex],
      };
      
      const deviceInfo = {
        userAgent: navigator.userAgent || 'Unknown',
        screenWidth: window.screen.width || 0,
        screenHeight: window.screen.height || 0,
      };
  
      const fullInitialData: SessionData = {
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
            financialLiteracy: {},
            roleAndExperience: {},
            organizationalProfile: {},
        },
        dossierViewTime: null,
        dossierScrollCount: null,
        advisoryViewTime: null,
        advisoryScrollCount: null,
        comprehension: {},
        manipulationChecks: {},
        objectiveChoice: null,
        subjectiveDQ: {},
        mediators: {},
        controls: {},
        openRationale: null,
        endTime: null,
        ...data,
      };

      setSessionData(fullInitialData);

      const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
      await setDoc(participantDocRef, fullInitialData, { merge: false });

      const experimentMetaRef = doc(firestore, 'experiment_meta', EXPERIMENT_ID);
      await setDoc(experimentMetaRef, {
        id: EXPERIMENT_ID,
        seed: 'initial_seed_placeholder',
        stimuliVersion: 'v1.0',
        lexiconVersion: 'v1.0'
      }, { merge: true });

      return; 
    }
  
    // For all subsequent updates, just merge the data into the existing state and Firestore.
    const newData = { ...sessionData, ...data };
    setSessionData(newData);
    const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
    await setDoc(participantDocRef, data, { merge: true });
  };

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < stepComponents.length) {
      if (nextStep === DEBRIEF_STEP) {
        updateSessionData({ endTime: new Date().toISOString(), status: 'Completed' });
      }
      setCurrentStep(nextStep);
    }
  };
  
  const handleCompleteSurvey = () => {
    router.push('/');
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const endSurvey = async () => {
    if (sessionData) {
        await updateSessionData({ endTime: new Date().toISOString(), status: 'Abandoned' });
    }
    setCurrentStep(END_SURVEY_STEP);
  };

  const isNextDisabled = useMemo(() => {
    if (stepNames[currentStep] === 'Consent') {
      return !sessionData?.consent;
    }
     if (stepNames[currentStep] === 'Objective Choice') {
        if (!sessionData?.objectiveChoice) return true; // Can't proceed without a choice
        
        // If choice is made, check if all subjective questions are answered.
        const dq = sessionData?.subjectiveDQ;
        if (!dq || Object.values(dq).some(v => !v)) return true;
    }
    return false;
  }, [currentStep, sessionData]);
  
  const CurrentStepComponent = stepComponents[currentStep];
  const isDebrief = currentStep === DEBRIEF_STEP || currentStep === END_SURVEY_STEP;

  const [isLastAssessmentSection, setIsLastAssessmentSection] = useState(false);
  const [isLastMediatorSection, setIsLastMediatorSection] = useState(false);
  const [isLastControlSection, setIsLastControlSection] = useState(false);

  const showNextButton = useMemo(() => {
    if (isDebrief) return false;
    if (stepNames[currentStep] === 'Consent') return false; // Handled by component
    if (stepNames[currentStep] === 'Initial Assessments' && !isLastAssessmentSection) return false;
    if (stepNames[currentStep] === 'Mediators' && !isLastMediatorSection) return false;
    if (stepNames[currentStep] === 'Controls' && !isLastControlSection) return false;
    
    return true;
  }, [currentStep, isDebrief, isLastAssessmentSection, isLastMediatorSection, isLastControlSection]);


  const componentProps: any = {
    sessionData,
    updateSessionData,
    endSurvey,
    goToNextStep: handleNext,
    goToPrevStep: handlePrevious,
    handleCompleteSurvey,
    // Multi-part step handlers
    setIsLastAssessmentSection,
    setIsLastMediatorSection,
    setIsLastControlSection,
  };

  if (isLoadingSession) {
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
                total={stepComponents.length - 2} // Exclude Debrief and End
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
              disabled={currentStep <= 0}
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
