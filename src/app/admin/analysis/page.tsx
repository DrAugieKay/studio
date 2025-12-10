
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, BookText, FileSpreadsheet, BarChart3 } from 'lucide-react';
import CompletionRateChart from '@/components/admin/CompletionRateChart';
import ChoiceDistributionChart from '@/components/admin/ChoiceDistributionChart';
import CredibilityScoresChart from '@/components/admin/CredibilityScoresChart';
import DescriptiveStatisticsAccordion from '@/components/admin/DescriptiveStatisticsAccordion';
import CrossTabulation from '@/components/admin/CrossTabulation';
import { getQualityFlags, checkComprehension } from '@/lib/quality-flags';
import { getComposites, getFinancialLiteracyScore } from '@/lib/composites';
import { calculateAllDescriptiveStats, QUESTION_SETS } from '@/lib/descriptives';
import { codebookData } from '@/lib/codebook';
import Papa from 'papaparse';
import type { SessionData } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

const EXPERIMENT_ID = 'exp_004';


export default function DataAnalysisPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isRawExporting, setIsRawExporting] = useState(false);
    const [isDescriptivesExporting, setIsDescriptivesExporting] = useState(false);
    const firestore = useFirestore();

    const participantsCollectionQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`));
    }, [firestore]);

    const { data: sessions, isLoading } = useCollection<SessionData>(participantsCollectionQuery);

    const downloadCsv = (data: any[], fileName: string) => {
        try {
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };
    
    const handleExportCodebook = () => {
        downloadCsv(codebookData, 'codebook.csv');
    };

    const handleExportDescriptives = () => {
        if (!sessions) return;
        setIsDescriptivesExporting(true);
        console.log('Starting descriptives export...');

        const stats = calculateAllDescriptiveStats(sessions);
        const dataToExport: any[] = [];

        Object.entries(QUESTION_SETS).forEach(([setKey, setDetails]) => {
            const setData = stats[setKey as keyof typeof stats];
            if (!setData) return;

            dataToExport.push({ Section: setDetails.title });

            if (setDetails.type === 'numeric') {
                Object.entries(setDetails.questions).forEach(([qKey, qLabel]) => {
                    const qData = setData[qKey];
                    if (qData) {
                       dataToExport.push({ Section: '', Item: qLabel, Statistic: 'Mean', Value: qData.mean });
                       dataToExport.push({ Section: '', Item: qLabel, Statistic: 'Std. Dev.', Value: qData.std });
                       dataToExport.push({ Section: '', Item: qLabel, Statistic: 'Min', Value: qData.min });
                       dataToExport.push({ Section: '', Item: qLabel, Statistic: 'Max', Value: qData.max });
                    }
                });
            } else if (setDetails.type === 'mean') {
                 Object.entries(setDetails.questions).forEach(([qKey, qLabel]) => {
                    const qData = setData[qKey];
                    if (qData) {
                        dataToExport.push({ Section: '', Item: qLabel, Statistic: 'Mean', Value: qData.mean });
                        dataToExport.push({ Section: '', Item: qLabel, Statistic: 'Std. Dev.', Value: qData.std });
                    }
                 });
            } else if (setDetails.type === 'frequency') {
                Object.entries(setDetails.questions).forEach(([qKey, qLabel]) => {
                    const qData = setData[qKey];
                    if (qData) {
                        dataToExport.push({ Section: '', Item: qLabel, Statistic: '---', Value: '---' });
                         Object.entries(qData).forEach(([response, values]) => {
                            dataToExport.push({ Section: '', Item: '', Statistic: response, Value: values.count, Percentage: values.percentage });
                         });
                    }
                });
            }
             dataToExport.push({}); // Add a blank row for spacing
        });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadCsv(dataToExport, `descriptive_stats_export_${timestamp}.csv`);
        setIsDescriptivesExporting(false);
    };

    const handleExportRaw = () => {
        if (!sessions) return;
        setIsRawExporting(true);
        console.log('Starting raw CSV export...');

        const dataToExport = sessions.map(session => {
            const qualityFlags = getQualityFlags(session);
            const duration = session.startTime && session.endTime ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 : 'NA';

            const flattened: Record<string, any> = {
                participant_id: session.id,
                random_seed: session.randomSeed,
                start_time: session.startTime,
                end_time: session.endTime,
                duration_seconds: duration,
                status: session.status,

                consent_q_a: session.consent_ageCheck,
                consent_q_b: session.consent_isEmployed,
                consent_q_c: session.consent_hasParticipated,
                consent_q_d: session.consent_consentGiven,

                fa_q_i: session.initialAssessments?.financialLiteracy?.q1 || 'NA',
                fa_q_ii: session.initialAssessments?.financialLiteracy?.q2 || 'NA',
                fa_q_iii: session.initialAssessments?.financialLiteracy?.q3 || 'NA',
                fa_q_iv: session.initialAssessments?.financialLiteracy?.q4 || 'NA',

                role_q_i: session.initialAssessments?.roleAndExperience?.q1 || 'NA',
                role_q_ii: session.initialAssessments?.roleAndExperience?.q2 || 'NA',
                role_q_iii: session.initialAssessments?.roleAndExperience?.q3 || 'NA',
                role_q_iv: session.initialAssessments?.roleAndExperience?.q4 || 'NA',
                role_q_v: session.initialAssessments?.roleAndExperience?.q5 || 'NA',

                op_q_i: session.initialAssessments?.organizationalProfile?.q1 || 'NA',
                budget_scope: session.initialAssessments?.organizationalProfile?.q2 || 'NA',
                employee_count: session.initialAssessments?.organizationalProfile?.q3 || 'NA',
                op_q_iv: session.initialAssessments?.organizationalProfile?.q4 || 'NA',
                op_q_v: session.initialAssessments?.organizationalProfile?.q5 || 'NA',
                op_q_vi: session.initialAssessments?.organizationalProfile?.q6 || 'NA',
                op_q_vii: session.initialAssessments?.organizationalProfile?.q7 || 'NA',
                
                condition_source: session.condition?.advisorySource,
                condition_frame: session.condition?.linguisticFrame,
                condition_scenario: session.condition?.scenario,

                device_user_agent: session.deviceInfo?.userAgent,
                device_screen_width: session.deviceInfo?.screenWidth,
                device_screen_height: session.deviceInfo?.screenHeight,
                
                dossier_view_time_ms: session.dossierViewTime,
                dossier_scroll_count: session.dossierScrollCount,
                advisory_view_time_ms: session.advisoryViewTime,
                advisory_scroll_count: session.advisoryScrollCount,
                
                comp_q_a: session.comprehension?.q1,
                comp_q_b: session.comprehension?.q2,
                
                manip_q_a: session.manipulationChecks?.feltHuman,
                manip_q_b: session.manipulationChecks?.feltAlgorithm,
                manip_q_c: session.manipulationChecks?.sourceAttribution,
                
                decision_q_a: session.objectiveChoice,
                decision_q_b_i: session.subjectiveDQ?.confidence,
                decision_q_b_ii: session.subjectiveDQ?.informed,
                decision_q_b_iii: session.subjectiveDQ?.clearBasis,
                decision_q_b_iv: session.subjectiveDQ?.satisfied,
                
                cr_q_i: session.mediators?.advisoryCredibility?.q1,
                cr_q_ii: session.mediators?.advisoryCredibility?.q2,
                cr_q_iii: session.mediators?.advisoryCredibility?.q3,
                cr_q_iv: session.mediators?.advisoryCredibility?.q4,
                cr_q_v: session.mediators?.advisoryCredibility?.q5,
                cr_q_vi: session.mediators?.advisoryCredibility?.q6,
                cr_q_vii: session.mediators?.advisoryCredibility?.q7,
                cr_q_viii: session.mediators?.advisoryCredibility?.q8,
                cr_q_ix: session.mediators?.advisoryCredibility?.q9,

                pd_q_i: session.mediators?.psychologicalDistance?.q1,
                pd_q_ii: session.mediators?.psychologicalDistance?.q2,
                pd_q_iii: session.mediators?.psychologicalDistance?.q3,
                pd_q_iv: session.mediators?.psychologicalDistance?.q4,

                la_q_i: session.mediators?.linguisticAbstractness?.q1,
                la_q_ii: session.mediators?.linguisticAbstractness?.q2,
                la_q_iii: session.mediators?.linguisticAbstractness?.q3,
                la_q_iv: session.mediators?.linguisticAbstractness?.q4,

                of_q_i: session.mediators?.outcomeFraming?.q1,
                of_q_ii: session.mediators?.outcomeFraming?.q2,
                of_q_iii: session.mediators?.outcomeFraming?.q3,
                of_q_iv: session.mediators?.outcomeFraming?.q4,

                rt_q_i: session.controls?.riskTolerance?.q1,
                rt_q_ii: session.controls?.riskTolerance?.q2,
                rt_q_iii: session.controls?.riskTolerance?.q3,
                rt_q_iv: session.controls?.riskTolerance?.q4,
                rt_q_v: session.controls?.riskTolerance?.q5,

                dl_q_i: session.controls?.digitalLiteracy?.q1,
                dl_q_ii: session.controls?.digitalLiteracy?.q2,
                dl_q_iii: session.controls?.digitalLiteracy?.q3,
                dl_q_iv: session.controls?.digitalLiteracy?.q4,
                dl_q_v: session.controls?.digitalLiteracy?.q5,
                
                rationale_text: session.openRationale,
                la_objective: session.la_objective ?? 'NA',

                flags: qualityFlags.join(', '),
            };

            return flattened;
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadCsv(dataToExport, `advisory_insights_raw_audit_${timestamp}.csv`);
        setIsRawExporting(false);
        console.log('Raw export successful.');
    };

    const handleExport = () => {
        if (!sessions) return;
        setIsExporting(true);
        console.log('Starting CSV export...');

        const dataToExport = sessions.map(session => {
            const qualityFlags = getQualityFlags(session);
            const composites = getComposites(session);
            const { score: finlit_sum, finlit1, finlit2, finlit3, finlit4 } = getFinancialLiteracyScore(session);
            
            const { isOrgCorrect, isHorizonCorrect } = checkComprehension(session);

            const mapChoiceToCode = (choice: string | null) => {
                if (!choice) return 'NA';
                if (choice.includes('Option A')) return 'A';
                if (choice.includes('Option B')) return 'B';
                if (choice.includes('Option C')) return 'C';
                if (choice.includes('I do not know')) return 'D';
                return 'NA';
            };
            
            const mapSourceAttribution = (attribution: string | null) => {
                if (!attribution) return 'NA';
                if (attribution === 'AI system') return 1;
                if (attribution === 'Human advisor') return 2;
                if (attribution === 'Unsure') return 3;
                return 'NA';
            }


            const flattened: Record<string, any> = {
                participant_id: session.id,
                random_seed: session.randomSeed || 'NOT_LOGGED',
                start_time: session.startTime,
                device_type: session.deviceInfo?.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
                advisory_view_time: session.advisoryViewTime ? (session.advisoryViewTime / 1000).toFixed(2) : 0,
                
                comp_org: Number(isOrgCorrect),
                comp_horizon: Number(isHorizonCorrect),
                
                man_algo: session.manipulationChecks?.feltAlgorithm,
                man_whodoneit: mapSourceAttribution(session.manipulationChecks?.sourceAttribution),
                
                choice_code: mapChoiceToCode(session.objectiveChoice),
                
                dq1: session.subjectiveDQ?.confidence,
                dq2: session.subjectiveDQ?.informed,
                dq3: session.subjectiveDQ?.clearBasis,
                dq4: session.subjectiveDQ?.satisfied,
                DQ_SUB_MEAN: composites.dq_sub_mean,
                
                cr_trust1: session.mediators?.advisoryCredibility?.q1,
                cr_trust2: session.mediators?.advisoryCredibility?.q2,
                cr_trust3: session.mediators?.advisoryCredibility?.q3,
                CR_TRUST: composites.cr_trust,

                cr_good1: session.mediators?.advisoryCredibility?.q7,
                cr_good2: session.mediators?.advisoryCredibility?.q8,
                cr_good3: session.mediators?.advisoryCredibility?.q9,
                CR_GOOD: composites.cr_good,

                cr_comp1: session.mediators?.advisoryCredibility?.q4,
                cr_comp2: session.mediators?.advisoryCredibility?.q5,
                cr_comp3: session.mediators?.advisoryCredibility?.q6,
                CR_COMP: composites.cr_comp,
                CR_GLOBAL_MEAN: composites.cr_global_mean,

                pd_temp: session.mediators?.psychologicalDistance?.q1,
                pd_soc: session.mediators?.psychologicalDistance?.q2,
                pd_spat: session.mediators?.psychologicalDistance?.q3,
                pd_hyp: session.mediators?.psychologicalDistance?.q4,
                PD_COMPOSITE: composites.pd_composite,

                la1: session.mediators?.linguisticAbstractness?.q1,
                la2: session.mediators?.linguisticAbstractness?.q2,
                la3: session.mediators?.linguisticAbstractness?.q3,
                la4: session.mediators?.linguisticAbstractness?.q4,
                LA_PERCEIVED: composites.la_perceived,
                
                la_objective: session.la_objective ?? 'NA',

                finlit1,
                finlit2,
                finlit3,
                finlit4,
                FINLIT_SUM: finlit_sum,

                risk_f1: session.controls?.riskTolerance?.q1,
                risk_f2: session.controls?.riskTolerance?.q2,
                risk_f3: session.controls?.riskTolerance?.q3,
                risk_f4: session.controls?.riskTolerance?.q4,
                risk_f5: session.controls?.riskTolerance?.q5,
                
                RISK_F_COMPOSITE: composites.risk_f_composite,
                choice_reason_text: session.openRationale ? "REDACTED" : "",
                
                flag_comprehension: Number(qualityFlags.includes('flag_comprehension')),
                flag_viewtime: Number(qualityFlags.includes('flag_viewtime')),
                flag_straightline: Number(qualityFlags.includes('flag_straightline')),
                flagged_any: Number(qualityFlags.length > 0),
            };

            return flattened;
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        downloadCsv(dataToExport, `advisory_insights_export_${timestamp}.csv`);
        setIsExporting(false);
        console.log('Export successful.');
    };

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading analysis data...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Data Analysis & Export</h1>
                    <p className="text-muted-foreground mt-1">Visualize, analyze, and export the collected study data.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <Button onClick={handleExportRaw} variant="outline" disabled={isRawExporting || !sessions || sessions.length === 0}>
                        {isRawExporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                        )}
                        {isRawExporting ? 'Exporting...' : 'Export Raw Audit Log'}
                    </Button>
                     <Button onClick={handleExportCodebook} variant="outline">
                        <BookText className="mr-2 h-4 w-4" />
                        Download Codebook
                    </Button>
                    <Button onClick={handleExportDescriptives} variant="outline" disabled={isDescriptivesExporting || !sessions || sessions.length === 0}>
                        {isDescriptivesExporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <BarChart3 className="mr-2 h-4 w-4" />
                        )}
                        {isDescriptivesExporting ? 'Exporting...' : 'Download Descriptives'}
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting || !sessions || sessions.length === 0}>
                        {isExporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isExporting ? 'Exporting...' : 'Export Processed Data'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Session Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CompletionRateChart sessions={sessions} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Decision Choice Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChoiceDistributionChart sessions={sessions} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Advisor Credibility Scores</CardTitle>
                        <CardDescription>Average perceived credibility by advisor source.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CredibilityScoresChart sessions={sessions} />
                    </CardContent>
                </Card>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Cross-Tabulations</h2>
                 <p className="text-muted-foreground mb-6">Explore the relationship between two categorical variables.</p>
                <CrossTabulation sessions={sessions} />
            </div>

            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Descriptive Statistics</h2>
                <p className="text-muted-foreground mb-6">Frequencies and summary statistics for key questionnaire variables. Click a section to expand.</p>
                <DescriptiveStatisticsAccordion sessions={sessions} />
            </div>
        </div>
    );
}
