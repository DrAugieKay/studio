
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SessionData, ExperimentalCondition } from '@/lib/types';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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


/**
 * Determines the correct step to resume to based on existing session data.
 * This is a robust, sequential check to find the first incomplete step.
 */
const resumeToStep = (data: Partial<SessionData>): number => {
    if (!data.consent) {
        return 0; // Must give consent first.
    }
    if (!data.initialAssessments?.financialLiteracy || !data.initialAssessments?.roleAndExperience || !data.initialAssessments?.organizationalProfile) {
        return 1; // Must complete all initial assessments.
    }
    // Step 2 is the scenario intro. After this is the dossier.
    // If dossier hasn't been viewed, they should start at the scenario intro.
    if (data.dossierViewTime === undefined) {
        return 2;
    }
     // After dossier, they must review the advisory.
    if (data.advisoryViewTime === undefined) {
        return 4; // Go to Advisory step
    }
    if (!data.comprehension?.q1 || !data.comprehension?.q2) {
        return 5; // Must complete comprehension checks.
    }
    if (!data.manipulationChecks?.feltHuman || !data.manipulationChecks?.feltAlgorithm || !data.manipulationChecks?.sourceAttribution) {
        return 6; // Must complete manipulation checks.
    }
    if (!data.objectiveChoice) {
        return 7; // Must make a choice.
    }
    if (!data.mediators?.advisoryCredibility || !data.mediators?.psychologicalDistance || !data.mediators?.linguisticAbstractness || !data.mediators?.outcomeFraming) {
        return 8; // Must complete all mediator sections.
    }
    if (!data.controls?.riskTolerance || !data.controls?.digitalLiteracy) {
        return 9; // Must complete all control sections.
    }
    
    // If everything else is complete, they are at the debrief.
    return 10;
};



export default function StartPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState<Partial<SessionData> | null>(null);
  const [isLastAssessmentSection, setIsLastAssessmentSection] = useState(false);
  const [isLastMediatorSection, setIsLastMediatorSection] = useState(false);
  const [isLastControlSection, setIsLastControlSection] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  // This effect now handles the entire session loading and creation logic.
  useEffect(() => {
    const manageSession = async () => {
        if (isUserLoading || !firestore) return; // Wait for dependencies

        let currentUser = user;

        // 1. Ensure we have a user
        if (!currentUser) {
            initiateAnonymousSignIn(auth);
            return; // Exit and wait for onAuthStateChanged to trigger a re-run
        }
        
        // 2. Try to fetch existing session data
        const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, currentUser.uid);
        const docSnap = await getDoc(participantDocRef);

        if (docSnap.exists()) {
            // --- SESSION RESUMPTION ---
            console.log('--- Resuming existing session for UID:', currentUser.uid);
            const existingData = docSnap.data() as SessionData;
            setSessionData(existingData);
            
            const resumedStep = resumeToStep(existingData);
            setCurrentStep(resumedStep);

        } else {
            // --- NEW SESSION (NO DOCUMENT YET) ---
            console.log('--- Preparing for new session for UID:', currentUser.uid);
            // Don't create the document here. Just prepare to start at step 0.
            setSessionData(null); // Explicitly null to indicate no data yet
            setCurrentStep(0);
        }
        setIsLoadingSession(false);
    };

    manageSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading, firestore]);

  
  // This effect scrolls the window to the top whenever the current step changes.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);


  const updateSessionData = (data: Partial<SessionData>) => {
    if (!user || !firestore) {
      console.warn("Update attempted before user or firestore is available.");
      return;
    }
  
    // For the very first interaction of a new participant, create the document.
    if (!sessionData) {
      console.log('--- First interaction: Creating session document in Firestore for UID:', user.uid);
      const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
      
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
            financialLiteracy: null,
            roleAndExperience: null,
            organizationalProfile: null,
        },
        dossierViewTime: undefined,
        dossierScrollCount: undefined,
        advisoryViewTime: undefined,
        advisoryScrollCount: undefined,
        comprehension: {},
        manipulationChecks: {},
        objectiveChoice: null,
        subjectiveDQ: {},
        mediators: {},
        controls: {},
        openRationale: null,
        endTime: null,
        ...data, // Merge the very first update (e.g., consent data)
      };

      setDoc(participantDocRef, fullInitialData, { merge: false });

      const experimentMetaRef = doc(firestore, 'experiment_meta', EXPERIMENT_ID);
      setDoc(experimentMetaRef, {
        id: EXPERIMENT_ID,
        seed: 'initial_seed_placeholder',
        stimuliVersion: 'v1.0',
        lexiconVersion: 'v1.0'
      }, { merge: true });

      setSessionData(fullInitialData);
      return; 
    }
  
    // For all subsequent updates, just merge the data.
    setSessionData((prev) => {
        const newData = { ...prev, ...data };
        const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
        setDoc(participantDocRef, data, { merge: true }); // Use data, not newData, to only save the changed fields
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
    handleCompleteSurvey,
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
