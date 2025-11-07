

export type ExperimentalCondition = {
  advisorySource: 'ai' | 'human';
  linguisticFrame: 'abstract' | 'concrete';
  scenario: 'xyz' | 'techtrend';
};

export type SessionData = {
  consent: boolean;
  condition?: ExperimentalCondition;
  initialAssessments: {
    financialLiteracy: Record<string, string | null> | null;
    roleAndExperience: Record<string, string | null> | null;
    organizationalProfile: Record<string, string | null> | null;
  };
  dossierViewTime: number;
  advisoryViewTime: number;
  advisoryScrollCount: number;
  comprehension: Record<string, string | null>;
  manipulationChecks: Record<string, string | null>;
  objectiveChoice: string | null;
  subjectiveDQ: Record<string, number | null>;
  mediators: Record<string, number | null>;
  controls: Record<string, number | null>;
  openRationale: string | null;
};
