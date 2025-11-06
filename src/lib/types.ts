export type SessionData = {
  consent: boolean;
  preScreen: {
    age: string | null;
    education: string | null;
  };
  dossierViewTime: number;
  advisoryViewTime: number;
  advisoryScrollCount: number;
  comprehension: Record<string, string | null>;
  objectiveChoice: string | null;
  subjectiveDQ: Record<string, number | null>;
  mediators: Record<string, number | null>;
  controls: Record<string, number | null>;
  openRationale: string | null;
};
