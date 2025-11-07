
// A central source for mock session data for the admin dashboard.
import type { SessionData, ExperimentalCondition } from './types';

// We need more detailed session data to test the flagging logic.
// This data includes granular responses.
export const mockDetailedSessions: (SessionData & { id: string, status: 'Completed' | 'In Progress' | 'Abandoned' })[] = [
  {
    // Session 1: Fails comprehension, should be flagged.
    id: 'SESS_A1B2C3',
    status: 'Completed',
    startTime: new Date('2024-07-29T11:00:00Z').toISOString(),
    endTime: new Date('2024-07-29T11:22:15Z').toISOString(),
    deviceInfo: { userAgent: 'Chrome', screenHeight: 1080, screenWidth: 1920 },
    consent: true,
    condition: { advisorySource: 'human', linguisticFrame: 'abstract', scenario: 'xyz' },
    initialAssessments: { financialLiteracy: { q1: 'More than $102' }, roleAndExperience: {}, organizationalProfile: {} },
    dossierViewTime: 35000,
    dossierScrollCount: 5,
    advisoryViewTime: 45000,
    advisoryScrollCount: 8,
    comprehension: { 
      q1: 'WrongCorp', // Incorrect
      q2: '12 months',  // Incorrect
    },
    manipulationChecks: {},
    objectiveChoice: 'Option A: Growth Equity Fund',
    subjectiveDQ: { confidence: 'Agree', informed: 'Somewhat agree', clearBasis: 'Agree', satisfied: 'Somewhat agree' },
    mediators: {
      advisoryCredibility: { q1: 'Agree', q2: 'Agree', q3: 'Agree', q4: 'Agree', q5: 'Agree', q6: 'Agree', q7: 'Agree', q8: 'Agree', q9: 'Agree' }
    },
    controls: {
      riskTolerance: { q1: 'Somewhat likely', q2: 'Neither likely nor unlikely', q3: 'Somewhat unlikely', q4: 'Moderately likely', q5: 'Extremely unlikely'},
      digitalLiteracy: {},
    },
    openRationale: 'I went with A because it seemed like the best path.'
  },
  {
    // Session 2: Very short view time, should be flagged.
    id: 'SESS_G8H9I0',
    status: 'Abandoned',
    startTime: new Date('2024-07-28T09:45:00Z').toISOString(),
    endTime: new Date('2024-07-28T09:51:23Z').toISOString(),
    deviceInfo: { userAgent: 'Firefox', screenHeight: 900, screenWidth: 1440 },
    consent: true,
    condition: { advisorySource: 'ai', linguisticFrame: 'concrete', scenario: 'techtrend' },
    initialAssessments: { financialLiteracy: {}, roleAndExperience: {}, organizationalProfile: {} },
    dossierViewTime: 4000, // 4s
    dossierScrollCount: 0,
    advisoryViewTime: 5000, // 5s. Total < 10s
    advisoryScrollCount: 0,
    comprehension: {
        q1: 'TechTrend Innovations', // Correct
        q2: '24 months', // Correct
    },
    manipulationChecks: {},
    objectiveChoice: null,
    subjectiveDQ: {},
    mediators: {},
    controls: {},
    openRationale: null,
  },
  {
    // Session 3: Straight-lines the credibility check, should be flagged.
    id: 'SESS_X4Y5Z6',
    status: 'Completed',
    startTime: new Date('2024-07-29T14:10:00Z').toISOString(),
    endTime: new Date('2024-07-29T14:30:05Z').toISOString(),
    deviceInfo: { userAgent: 'Safari', screenHeight: 900, screenWidth: 1600 },
    consent: true,
    condition: { advisorySource: 'ai', linguisticFrame: 'abstract', scenario: 'xyz' },
    initialAssessments: { financialLiteracy: {}, roleAndExperience: {}, organizationalProfile: {} },
    dossierViewTime: 40000,
    dossierScrollCount: 4,
    advisoryViewTime: 55000,
    advisoryScrollCount: 7,
    comprehension: {
        q1: 'XYZ Manufacturing', // Correct
        q2: '24 months', // Correct
    },
    manipulationChecks: {},
    objectiveChoice: 'Option C: Government Treasury Bond Portfolio',
    subjectiveDQ: { confidence: 'Strongly agree', informed: 'Strongly agree', clearBasis: 'Strongly agree', satisfied: 'Strongly agree' },
    mediators: {
      // All 'Neither agree nor disagree' -> 9/9 = 100% straight-lining
      advisoryCredibility: { 
        q1: 'Neither agree nor disagree', q2: 'Neither agree nor disagree', q3: 'Neither agree nor disagree',
        q4: 'Neither agree nor disagree', q5: 'Neither agree nor disagree', q6: 'Neither agree nor disagree',
        q7: 'Neither agree nor disagree', q8: 'Neither agree nor disagree', q9: 'Neither agree nor disagree',
      }
    },
    controls: {},
    openRationale: 'Felt C was the safest option as advised.'
  },
  {
    // Session 4: A good session, should not be flagged.
    id: 'SESS_8A2B4C',
    status: 'Completed',
    startTime: new Date('2024-07-28T10:00:00Z').toISOString(),
    endTime: new Date('2024-07-28T10:18:32Z').toISOString(),
    deviceInfo: { userAgent: 'Chrome', screenHeight: 1080, screenWidth: 1920 },
    consent: true,
    condition: { advisorySource: 'ai', linguisticFrame: 'abstract', scenario: 'xyz' },
    initialAssessments: { financialLiteracy: {}, roleAndExperience: {}, organizationalProfile: {} },
    dossierViewTime: 50000,
    dossierScrollCount: 6,
    advisoryViewTime: 65000,
    advisoryScrollCount: 10,
    comprehension: {
        q1: 'XYZ Manufacturing', // Correct
        q2: '24 months', // Correct
    },
    manipulationChecks: {},
    objectiveChoice: 'Option C: Government Treasury Bond Portfolio',
    subjectiveDQ: { confidence: 'Agree', informed: 'Strongly agree', clearBasis: 'Agree', satisfied: 'Strongly agree' },
    mediators: {
        advisoryCredibility: { q1: 'Agree', q2: 'Strongly agree', q3: 'Agree', q4: 'Somewhat agree', q5: 'Agree', q6: 'Agree', q7: 'Neither agree nor disagree', q8: 'Somewhat agree', q9: 'Agree' }
    },
    controls: {},
    openRationale: 'The advisory made a strong case for capital preservation, and Option C aligns with that goal perfectly.'
  },
  {
    id: 'SESS_D5E6F7',
    status: 'In Progress',
    startTime: new Date('2024-07-28T11:30:15Z').toISOString(),
    endTime: null,
    deviceInfo: { userAgent: 'Edge', screenHeight: 1440, screenWidth: 2560 },
    consent: true,
    condition: { advisorySource: 'human', linguisticFrame: 'concrete', scenario: 'techtrend' },
    initialAssessments: { financialLiteracy: {}, roleAndExperience: {}, organizationalProfile: {} },
    dossierViewTime: 25000,
    dossierScrollCount: 3,
    advisoryViewTime: 0,
    advisoryScrollCount: 0,
    comprehension: { q1: null, q2: null},
    manipulationChecks: {},
    objectiveChoice: null,
    subjectiveDQ: {},
    mediators: {},
    controls: {},
    openRationale: null
  }
];
