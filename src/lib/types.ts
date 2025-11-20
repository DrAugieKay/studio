

export type ExperimentalCondition = {
  advisorySource: 'ai' | 'human';
  linguisticFrame: 'abstract' | 'concrete';
  scenario: 'xyz' | 'techtrend';
};

export type SessionData = {
  // Metadata
  id: string; // Participant ID, same as Firebase Auth UID
  randomSeed?: string; // Seed for randomization
  startTime: string;
  endTime: string | null;
  deviceInfo: {
    userAgent: string;
    screenHeight: number;
    screenWidth: number;
  };

  // Session Data
  consent: boolean;
  // Raw consent answers
  consent_ageCheck: 'Yes' | 'No' | null;
  consent_isEmployed: 'Yes' | 'No' | null;
  consent_hasParticipated: 'Yes' | 'No' | null;
  consent_consentGiven: 'Yes' | 'No' | null;

  condition?: ExperimentalCondition;
  initialAssessments: {
    financialLiteracy: Record<string, string | null> | null;
    roleAndExperience: Record<string, string | null> | null;
    organizationalProfile: Record<string, string | null> | null;
  };
  dossierViewTime: number | undefined;
  dossierScrollCount: number | undefined;
  advisoryViewTime: number | undefined;
  advisoryScrollCount: number | undefined;
  comprehension: Record<string, string | null>;
  manipulationChecks: Record<string, string | null>;
  objectiveChoice: string | null;
  subjectiveDQ: Record<string, string | null>;
  mediators: {
    advisoryCredibility?: Record<string, string | null>;
    psychologicalDistance?: Record<string, string | null>;
    linguisticAbstractness?: Record<string, string | null>;
    outcomeFraming?: Record<string, string | null>;
  } | null;
  controls: {
    riskTolerance?: Record<string, string | null>;
    digitalLiteracy?: Record<string, string | null>;
  } | null;
  openRationale: string | null;
  status: 'Completed' | 'In Progress' | 'Abandoned';
  la_objective?: number;
};

export type ParticipantSession = {
    id: string;
    status: 'Completed' | 'In Progress' | 'Abandoned';
    startTime: Date;
    endTime: Date | null;
    condition: ExperimentalCondition | null;
    // data?: Partial<SessionData>; // We can add the full session data later
};

export type CodingTask = {
  id: string;
  rationale: string;
  coderA_codes: string[];
  coderB_codes: string[];
};

    

    