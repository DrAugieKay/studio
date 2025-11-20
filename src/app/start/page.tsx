
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { SessionData, ExperimentalCondition } from '@/lib/types';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProgressTracker from '@/components/session/ProgressTracker';
import { Loader2 } from 'lucide-react';
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
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const stepComponents = [
  StepConsent, StepInitialAssessment, StepAdvisoryScenario, StepDossier,
  StepAdvisory, StepComprehension, StepManipulationChecks, StepObjectiveChoice,
  StepMediators, StepControls, StepDebrief, StepEndSurvey,
];

const stepNames = [
  'Consent', 'Initial Assessments', 'Advisory Scenario', 'Dossier',
  'Advisory', 'Comprehension', 'Manipulation Checks', 'Decision Task',
  'Mediators', 'Controls', 'Debrief', 'End of Survey',
];

const EXPERIMENT_ID = 'exp_001';
const DEBRIEF_STEP = stepComponents.length - 2;
const END_SURVEY_STEP = stepComponents.length - 1;

// Hashing function to convert a string to a number
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export default function StartPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState<Partial<SessionData> | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const resumeToStep = (data: SessionData) => {
    if (!data.consent) return 0;
    const roleAndExp = data.initialAssessments?.roleAndExperience;
    if (!roleAndExp || Object.values(roleAndExp).some(v => !v)) return 1;
    if (!data.condition) return 1; // Stay on assessment step until condition is assigned
    if (data.dossierViewTime === null) return 2;
    if (data.advisoryViewTime === null) return 3;
    if (Object.keys(data.comprehension || {}).length < 2) return 4;
    if (Object.keys(data.manipulationChecks || {}).length < 3) return 5;
    if (!data.objectiveChoice) return 6;
    if (Object.keys(data.subjectiveDQ || {}).length < 4) return 7;
    const mediators = data.mediators;
    if (!mediators?.advisoryCredibility || Object.keys(mediators.advisoryCredibility).length < 9) return 8;
    if (!mediators?.psychologicalDistance || Object.keys(mediators.psychologicalDistance).length < 4) return 8;
    const controls = data.controls;
    if (!controls?.riskTolerance || Object.keys(controls.riskTolerance).length < 5) return 9;
    return DEBRIEF_STEP;
  };

  useEffect(() => {
    const manageSession = async () => {
      if (isUserLoading || !auth || !firestore) return;

      if (!user) {
        await signOut(auth); // Clear any previous session
        await auth.signInAnonymously();
        return; // Let the hook re-run with the new user
      }

      const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
      const docSnap = await getDoc(participantDocRef);

      if (docSnap.exists()) {
        const existingData = docSnap.data() as SessionData;
        setSessionData(existingData);
        setCurrentStep(resumeToStep(existingData));
      } else {
        // New user, data will be created on first interaction (consent)
        setSessionData(null);
        setCurrentStep(0);
      }
      setIsLoadingSession(false);
    };

    manageSession();
  }, [user, isUserLoading, auth, firestore]);
  
    // New function to assign condition after ROLE_LEVEL is known
    const assignCondition = (roleLevel: string) => {
        if (!user || !sessionData) return;
    
        const sources: ExperimentalCondition['advisorySource'][] = ['ai', 'human'];
        const scenarios: ExperimentalCondition['scenario'][] = ['xyz', 'techtrend'];
    
        // Use a combination of user ID and roleLevel for deterministic assignment
        const userHash = simpleHash(user.uid);
        const roleHash = simpleHash(roleLevel);
        const combinedHash = userHash + roleHash;
    
        const assignedSource = sources[combinedHash % sources.length];
        const assignedScenario = scenarios[Math.floor(combinedHash / sources.length) % scenarios.length];
    
        const assignedCondition: ExperimentalCondition = {
            advisorySource: assignedSource,
            scenario: assignedScenario,
        };
    
        console.log(`Assigning condition for role ${roleLevel}:`, assignedCondition);
        updateSessionData({ condition: assignedCondition });
    };

  const updateSessionData = async (data: Partial<SessionData>) => {
    if (!user || !firestore) {
      console.warn("Update attempted before user or firestore is available.");
      return;
    }

    if (!sessionData) {
      console.log('--- First interaction: Creating session document for UID:', user.uid);
      const deviceInfo = {
        userAgent: navigator.userAgent || 'Unknown',
        screenWidth: window.screen.width || 0,
        screenHeight: window.screen.height || 0,
      };

      const fullInitialData: SessionData = {
        id: user.uid,
        startTime: new Date().toISOString(),
        status: 'In Progress',
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
      await setDoc(participantDocRef, fullInitialData, { merge: true });

      const experimentMetaRef = doc(firestore, 'experiment_meta', EXPERIMENT_ID);
      await setDoc(experimentMetaRef, {
        id: EXPERIMENT_ID,
        seed: 'initial_seed_placeholder', // This can be enhanced later if needed
        stimuliVersion: 'v1.0',
        lexiconVersion: 'v1.0'
      }, { merge: true });
      return;
    }

    const newData = { ...sessionData, ...data };
    setSessionData(newData);
    const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, user.uid);
    updateDocumentNonBlocking(participantDocRef, data);
  };

  const handleNext = () => {
    if (currentStep < stepComponents.length - 1) {
      if (currentStep + 1 === DEBRIEF_STEP && sessionData?.status !== 'Completed') {
        updateSessionData({ endTime: new Date().toISOString(), status: 'Completed' });
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleCompleteSurvey = () => router.push('/');
  const endSurvey = async () => {
    if (sessionData) {
      await updateSessionData({ endTime: new Date().toISOString(), status: 'Abandoned' });
    }
    setCurrentStep(END_SURVEY_STEP);
  };

  const isNextDisabled = useMemo(() => {
    if (stepNames[currentStep] === 'Consent') return !sessionData?.consent;
    if (stepNames[currentStep] === 'Objective Choice') {
      if (!sessionData?.objectiveChoice) return true;
      const dq = sessionData?.subjectiveDQ;
      return !dq || Object.values(dq).some(v => !v);
    }
    return false;
  }, [currentStep, sessionData]);

  const CurrentStepComponent = stepComponents[currentStep];
  const isDebrief = currentStep >= DEBRIEF_STEP;
  const [isLastAssessmentSection, setIsLastAssessmentSection] = useState(false);
  const [isLastMediatorSection, setIsLastMediatorSection] = useState(false);
  const [isLastControlSection, setIsLastControlSection] = useState(false);

  useEffect(() => {
    if (stepNames[currentStep] !== 'Initial Assessments') setIsLastAssessmentSection(false);
    if (stepNames[currentStep] !== 'Mediators') setIsLastMediatorSection(false);
    if (stepNames[currentStep] !== 'Controls') setIsLastControlSection(false);
  }, [currentStep]);

  const showNextButton = useMemo(() => {
    if (isDebrief) return false;
    if (stepNames[currentStep] === 'Consent') return false;
    if (stepNames[currentStep] === 'Initial Assessments' && !isLastAssessmentSection) return false;
    if (stepNames[currentStep] === 'Mediators' && !isLastMediatorSection) return false;
    if (stepNames[currentStep] === 'Controls' && !isLastControlSection) return false;
    return true;
  }, [currentStep, isDebrief, isLastAssessmentSection, isLastMediatorSection, isLastControlSection]);

  if (isLoadingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Initializing session...</p>
      </div>
    );
  }

  const componentProps = {
    sessionData,
    updateSessionData,
    endSurvey,
    goToNextStep: handleNext,
    goToPrevStep: handlePrevious,
    handleCompleteSurvey,
    setIsLastAssessmentSection,
    setIsLastMediatorSection,
    setIsLastControlSection,
    assignCondition, // Pass the new function down
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {!isDebrief && (
          <ProgressTracker
            current={currentStep}
            total={stepComponents.length - 2}
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
              disabled={currentStep <= 0 || stepNames[currentStep] === 'Consent'}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {showNextButton && (
              <Button
                onClick={handleNext}
                disabled={isNextDisabled}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {currentStep === stepComponents.length - 3 ? 'Finish' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
