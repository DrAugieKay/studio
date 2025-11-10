
import type { SessionData } from './types';

const LIKERT_MAP: Record<string, number> = {
    'Strongly disagree': 1,
    'Disagree': 2,
    'Somewhat disagree': 3,
    'Neither agree nor disagree': 4,
    'Somewhat agree': 5,
    'Agree': 6,
    'Strongly agree': 7,
    // For risk tolerance scale
    'Extremely unlikely': 1,
    'Moderately unlikely': 2,
    'Somewhat unlikely': 3,
    'Neither likely nor unlikely': 4,
    'Somewhat likely': 5,
    'Moderately likely': 6,
    'Extremely likely': 7,
};

/**
 * Calculates the mean of a set of Likert scale responses.
 * Returns null if the completeness threshold (>=75%) is not met.
 */
function calculateMean(responses: Record<string, string | null>): number | null {
    const values = Object.values(responses)
        .map(response => response ? LIKERT_MAP[response] : null)
        .filter(v => v !== null) as number[];
    
    const totalItems = Object.keys(responses).length;
    
    if (values.length / totalItems < 0.75) {
        return null; // Completeness threshold not met
    }

    if (values.length === 0) return null;

    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
}

/**
 * Calculates financial literacy score.
 */
export function getFinancialLiteracyScore(session: SessionData) {
    const answers = session.initialAssessments?.financialLiteracy || {};
    const correctAnswers = {
        q1: 'More than $102',
        q2: 'Less than today',
        q3: 'False',
        q4: '1%',
    };

    const finlit1 = answers.q1 === correctAnswers.q1 ? 1 : 0;
    const finlit2 = answers.q2 === correctAnswers.q2 ? 1 : 0;
    const finlit3 = answers.q3 === correctAnswers.q3 ? 1 : 0;
    const finlit4 = answers.q4 === correctAnswers.q4 ? 1 : 0;
    
    const score = finlit1 + finlit2 + finlit3 + finlit4;

    const answeredCount = Object.values(answers).filter(a => a).length;
    
    // FINLIT_SUM computed if >=3 items present
    const finlit_sum = answeredCount >= 3 ? score : null;

    return { score: finlit_sum, finlit1, finlit2, finlit3, finlit4 };
}


/**
 * Calculates all derived composite scores for a given session.
 */
export function getComposites(session: SessionData) {
    const isNormativeChoice = session.objectiveChoice === 'Option C: Government Treasury Bond Portfolio';

    const dq_sub_mean = calculateMean(session.subjectiveDQ || {});

    const cr_trust = calculateMean({
        q1: session.mediators?.advisoryCredibility?.q1,
        q2: session.mediators?.advisoryCredibility?.q2,
        q3: session.mediators?.advisoryCredibility?.q3,
    } as Record<string, string | null>);
    const cr_comp = calculateMean({
        q4: session.mediators?.advisoryCredibility?.q4,
        q5: session.mediators?.advisoryCredibility?.q5,
        q6: session.mediators?.advisoryCredibility?.q6,
    } as Record<string, string | null>);
    const cr_good = calculateMean({
        q7: session.mediators?.advisoryCredibility?.q7,
        q8: session.mediators?.advisoryCredibility?.q8,
        q9: session.mediators?.advisoryCredibility?.q9,
    } as Record<string, string | null>);
    
    const cr_all_means = [cr_trust, cr_comp, cr_good].filter(v => v !== null) as number[];
    const cr_global_mean = cr_all_means.length > 0 ? cr_all_means.reduce((a, b) => a + b, 0) / cr_all_means.length : null;

    const pd_composite = calculateMean(session.mediators?.psychologicalDistance || {});

    const { score: finlit_sum } = getFinancialLiteracyScore(session);

    // Risk tolerance with reverse scoring
    const riskToleranceResponses = session.controls?.riskTolerance;
    let risk_f_composite = null;
    if (riskToleranceResponses) {
        const processedResponses = { ...riskToleranceResponses };
        if (processedResponses.q5) {
            // Reverse score q5
            const originalScore = LIKERT_MAP[processedResponses.q5];
            if(originalScore) {
                // Not a real Likert option, but need a string for calculateMean
                const reversedScoreString = Object.keys(LIKERT_MAP).find(key => LIKERT_MAP[key] === (8 - originalScore)) || '';
                processedResponses.q5 = reversedScoreString;
            }
        }
        risk_f_composite = calculateMean(processedResponses);
    }
    
    return {
        obj_dq_binary: isNormativeChoice,
        dq_sub_mean,
        cr_trust,
        cr_comp,
        cr_good,
        cr_global_mean,
        pd_composite,
        finlit_sum,
        risk_f_composite,
    };
}
