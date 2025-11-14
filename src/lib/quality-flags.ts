
import type { SessionData } from './types';
import { LIKERT_MAP } from './descriptives';

/**
 * Checks for comprehension failure.
 * Returns true if the participant answered both comprehension questions incorrectly.
 * As per spec: flag_comprehension = 1 if comp_org = 0 AND comp_horizon = 0.
 * The correct answers depend on the scenario.
 */
export function checkComprehension(session: SessionData): { isOrgCorrect: boolean, isHorizonCorrect: boolean, flag: boolean } {
  if (!session.condition || !session.comprehension) {
    return { isOrgCorrect: false, isHorizonCorrect: false, flag: false };
  }

  const correctOrg = session.condition.scenario === 'techtrend' ? 'TechTrend Innovations' : 'XYZ Manufacturing';
  const correctHorizon = '24 months';

  const isOrgCorrect = session.comprehension.q1 === correctOrg;
  const isHorizonCorrect = session.comprehension.q2 === correctHorizon;
  
  // Flag if both are incorrect.
  const flag = !isOrgCorrect && !isHorizonCorrect;
  return { isOrgCorrect, isHorizonCorrect, flag };
}

/**
 * Checks for minimal view time.
 * Returns true if the combined view time for dossier and advisory is less than 10 seconds.
 * As per spec: flag_viewtime = 1 if dossier_view_time + advisory_view_time < 10s.
 */
function checkViewTime(session: SessionData): boolean {
    const totalViewTimeMs = (session.dossierViewTime || 0) + (session.advisoryViewTime || 0);
    return totalViewTimeMs < 10000; // 10 seconds
}

/**
 * Checks for straight-lining in Likert scale matrices.
 * This function has two strategies:
 * 1.  Contradiction Check: For scales with reverse-scored items (like Risk Tolerance), it checks if a user gives the same
 *     strong answer to both a regular item and a reverse-scored item, which is logically inconsistent.
 * 2.  Repetition Check: For scales without reverse-scored items, it falls back to checking if a user gives the same
 *     response for 90% or more of the items.
 */
function checkStraightLining(session: SessionData): boolean {
    if (!session.mediators && !session.controls) return false;

    // --- Strategy 1: Contradiction Check (more reliable) ---
    const rt = session.controls?.riskTolerance;
    if (rt) {
        const riskTakingItems = [rt.q1, rt.q2, rt.q3, rt.q4].filter(Boolean); // Items where 'Extremely likely' is high risk
        const riskAverseItem = rt.q5; // Item where 'Extremely likely' is low risk (reversed)

        if (riskTakingItems.length > 0 && riskAverseItem) {
            // Check for high-risk agreement contradiction
            const highRiskValue = 'Extremely likely';
            if (riskAverseItem === highRiskValue && riskTakingItems.includes(highRiskValue)) {
                return true; // Contradiction: Claims to be extremely likely to take risks AND extremely likely to preserve capital.
            }
            // Check for low-risk agreement contradiction
            const lowRiskValue = 'Extremely unlikely';
            if (riskAverseItem === lowRiskValue && riskTakingItems.every(item => item === lowRiskValue)) {
                 return true; // Contradiction: Claims to be extremely unlikely to preserve capital AND extremely unlikely to take any risks.
            }
        }
    }


    // --- Strategy 2: Repetition Check (less reliable, used as a fallback) ---
    const matricesToCheck = [
        session.mediators?.advisoryCredibility,
        session.mediators?.psychologicalDistance,
        session.mediators?.linguisticAbstractness,
        session.mediators?.outcomeFraming,
        session.controls?.digitalLiteracy,
    ];

    for (const matrix of matricesToCheck) {
        if (!matrix) continue;

        const responses = Object.values(matrix).filter(Boolean); // Filter out null/empty responses
        const totalResponses = responses.length;

        if (totalResponses < 5) continue; // Only check on reasonably long scales

        const responseCounts = responses.reduce((acc, response) => {
            if (response) {
                acc[response] = (acc[response] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        if (Object.keys(responseCounts).length === 0) continue;

        const maxCount = Math.max(...Object.values(responseCounts));
        
        // Use a 90% threshold for pure repetition to be more conservative
        if ((maxCount / totalResponses) >= 0.9) {
            return true; // Found high-repetition straight-lining in a matrix without reverse-scored items.
        }
    }
    
    return false;
}


/**
 * Processes a session and returns an array of data quality flags.
 */
export function getQualityFlags(session: SessionData): string[] {
    const flags: string[] = [];

    if (checkComprehension(session).flag) {
        flags.push('flag_comprehension');
    }
    if (checkViewTime(session)) {
        flags.push('flag_viewtime');
    }
    if (checkStraightLining(session)) {
        flags.push('flag_straightline');
    }

    return flags;
}
