


export type ExperimentalCondition = {
  advisorySource: 'ai' | 'human';
  linguisticFrame: 'abstract' | 'concrete';
  scenario: 'xyz' | 'techtrend';
};

export type SessionData = {
  // Metadata
  startTime: string;
  endTime: string | null;
  deviceInfo: {
    userAgent: string;
    screenHeight: number;
    screenWidth: number;
  };

  // Session Data
  consent: boolean;
  condition?: ExperimentalCondition;
  initialAssessments: {
    financialLiteracy: Record<string, string | null> | null;
    roleAndExperience: Record<string, string | null> | null;
    organizationalProfile: Record<string, string | null> | null;
  };
  dossierViewTime: number;
  dossierScrollCount: number;
  advisoryViewTime: number;
  advisoryScrollCount: number;
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
    digitalLiteracy?: Record<string, string | null;
  } | null;
  openRationale: string | null;
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
