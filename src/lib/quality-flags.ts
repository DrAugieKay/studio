
import type { SessionData } from './types';

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
 * Returns true if a participant gives the same response for 80% or more of the items in any single matrix.
 */
function checkStraightLining(session: SessionData): boolean {
    if (!session.mediators) return false;

    // We can check multiple matrices here. For now, let's focus on the longest one: advisoryCredibility.
    const matricesToCheck = [
        session.mediators.advisoryCredibility,
        session.mediators.psychologicalDistance,
        session.mediators.linguisticAbstractness,
        session.mediators.outcomeFraming,
        session.controls?.riskTolerance,
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

        const maxCount = Math.max(...Object.values(responseCounts));
        
        if ((maxCount / totalResponses) >= 0.8) {
            return true; // Found straight-lining in at least one matrix
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
