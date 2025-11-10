
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, BookText } from 'lucide-react';
import CompletionRateChart from '@/components/admin/CompletionRateChart';
import ChoiceDistributionChart from '@/components/admin/ChoiceDistributionChart';
import CredibilityScoresChart from '@/components/admin/CredibilityScoresChart';
import { getQualityFlags } from '@/lib/quality-flags';
import { getComposites, getFinancialLiteracyScore } from '@/lib/composites';
import Papa from 'papaparse';
import type { SessionData } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

const EXPERIMENT_ID = 'exp_001';

const codebookData = [
    { Variable: 'participant_id', Label: 'Participant Identifier', Type: 'String', ScoringRule: 'Unique alphanumeric ID assigned by platform', MissingnessRule: 'Never missing (required)' },
    { Variable: 'random_seed', Label: 'RNG Seed', Type: 'String', ScoringRule: 'Seed used for randomization (logged)', MissingnessRule: 'Retain; not used in analysis' },
    { Variable: 'start_time', Label: 'Session start timestamp', Type: 'Datetime', ScoringRule: 'ISO-8601 timestamp', MissingnessRule: 'If missing, flag for logging issues' },
    { Variable: 'device_type', Label: 'Device used', Type: 'Categorical', ScoringRule: 'Desktop / Mobile / Tablet', MissingnessRule: 'If missing, report but keep in models if available' },
    { Variable: 'advisory_view_time', Label: 'Advisory viewing time (s)', Type: 'Numeric', ScoringRule: 'Seconds displayed; recorded from page load to next page', MissingnessRule: 'If <0 or missing, flag; used in sensitivity checks' },
    { Variable: 'comp_org', Label: 'Comprehension: org name', Type: 'Binary', ScoringRule: '1 = correct; 0 = incorrect', MissingnessRule: 'If missing, treated as incorrect for sensitivity flags' },
    { Variable: 'man_algo', Label: 'Perceived algorithmic origin', Type: 'Scale', ScoringRule: '1-7 Likert (1=not at all...7=very much)', MissingnessRule: 'Composite use requires non-missing' },
    { Variable: 'man_whodoneit', Label: 'Forced-choice belief about source', Type: 'Categorical', ScoringRule: '1=AI; 2=Human; 3=Unsure', MissingnessRule: 'If missing, record as NA' },
    { Variable: 'choice_code', Label: 'Objective choice code', Type: 'Categorical', ScoringRule: 'Numeric code mapping options A/B/C; normative = C', MissingnessRule: 'If missing, exclude from OBJ_DQ analyses' },
    { Variable: 'dq1...dq4', Label: 'Subjective DQ items', Type: 'Scale', ScoringRule: 'Four 7-point Likert items; DQ_SUB_MEAN = mean(DQ1-DQ4)', MissingnessRule: 'Compute mean if >=75% items present; otherwise missing' },
    { Variable: 'cr_trust1...3', Label: 'Credibility - trust items', Type: 'Scale', ScoringRule: 'Three 7-point items; CR_TRUST = mean', MissingnessRule: 'Subscale mean if >=75% present' },
    { Variable: 'cr_good1...3', Label: 'Credibility - goodwill items', Type: 'Scale', ScoringRule: 'Three 7-point items; CR_GOOD = mean', MissingnessRule: 'Subscale mean if >=75% present' },
    { Variable: 'cr_comp', Label: 'Credibility competence (mean)', Type: 'Numeric', ScoringRule: 'Mean(cr_comp1..3)', MissingnessRule: 'Missing if <75% present' },
    { Variable: 'pd_temp/soc/spat/hyp', Label: 'Psychological distance items', Type: 'Scale', ScoringRule: 'Four 7-point items; PD_COMPOSITE = mean', MissingnessRule: 'Composite if >=75% items present' },
    { Variable: 'la1...la4', Label: 'Perceived linguistic abstractness items', Type: 'Scale', ScoringRule: 'Four 7-point items; LA_PERCEIVED = mean', MissingnessRule: 'Composite if >=75% items present' },
    { Variable: 'finlit1...4', Label: 'Financial literacy quiz items', Type: 'Binary', ScoringRule: 'Each scored 1=correct; 0=incorrect', MissingnessRule: 'FINLIT_SUM computed if >=3 items present' },
    { Variable: 'risk_f1...5', Label: 'DOSPERT finance items', Type: 'Scale', ScoringRule: 'Five 1-7 items; RISK_F_5 reversed before composite', MissingnessRule: 'Composite if >=75% items present' },
    { Variable: 'risk_f_composite', Label: 'Risk tolerance composite', Type: 'Numeric', ScoringRule: 'Mean of risk_f items after reverse coding', MissingnessRule: 'Missing if <75% present' },
    { Variable: 'choice_reason_text', Label: 'Open rationale', Type: 'String', ScoringRule: 'Participant free-text for decision rationale', MissingnessRule: 'Free text redacted for PII before release' },
    { Variable: 'flag_viewtime', Label: 'Flag: minimal exposure', Type: 'Binary', ScoringRule: '1 if dossier_view_time + advisory_view_time < 10s', MissingnessRule: 'Used for sensitivity exclusions' },
    { Variable: 'flagged_any', Label: 'Any exclusion flag', Type: 'Binary', ScoringRule: '1 if any flag_comprehension OR flag_viewtime OR flag_straightline = 1', MissingnessRule: 'Not used in primary analysis; for robustness' },
];


export default function DataAnalysisPage() {
    const [isExporting, setIsExporting] = useState(false);
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

    const handleExport = () => {
        if (!sessions) return;
        setIsExporting(true);
        console.log('Starting CSV export...');

        const dataToExport = sessions.map(session => {
            const qualityFlags = getQualityFlags(session);
            const composites = getComposites(session);
            const { score, finlit1, finlit2, finlit3, finlit4 } = getFinancialLiteracyScore(session);

            const isCompOrgCorrect = useMemo(() => {
                if (!session.condition || !session.comprehension?.q1) return 0;
                const correctOrg = session.condition.scenario === 'techtrend' ? 'TechTrend Innovations' : 'XYZ Manufacturing';
                return session.comprehension.q1 === correctOrg ? 1 : 0;
            }, [session.condition, session.comprehension]);

            const mapChoiceToCode = (choice: string | null) => {
                if (!choice) return 'NA';
                if (choice.includes('Option A')) return 'A';
                if (choice.includes('Option B')) return 'B';
                if (choice.includes('Option C')) return 'C';
                return 'D';
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
                
                comp_org: isCompOrgCorrect,
                
                man_algo: session.manipulationChecks?.feltAlgorithm,
                man_whodoneit: mapSourceAttribution(session.manipulationChecks?.sourceAttribution),
                
                choice_code: mapChoiceToCode(session.objectiveChoice),
                
                dq1: session.subjectiveDQ?.confidence,
                dq2: session.subjectiveDQ?.informed,
                dq3: session.subjectiveDQ?.clearBasis,
                dq4: session.subjectiveDQ?.satisfied,
                
                cr_trust1: session.mediators?.advisoryCredibility?.q1,
                cr_trust2: session.mediators?.advisoryCredibility?.q2,
                cr_trust3: session.mediators?.advisoryCredibility?.q3,
                
                cr_good1: session.mediators?.advisoryCredibility?.q7,
                cr_good2: session.mediators?.advisoryCredibility?.q8,
                cr_good3: session.mediators?.advisoryCredibility?.q9,

                cr_comp: composites.cr_comp,

                pd_temp: session.mediators?.psychologicalDistance?.q1,
                pd_soc: session.mediators?.psychologicalDistance?.q2,
                pd_spat: session.mediators?.psychologicalDistance?.q3,
                pd_hyp: session.mediators?.psychologicalDistance?.q4,

                la1: session.mediators?.linguisticAbstractness?.q1,
                la2: session.mediators?.linguisticAbstractness?.q2,
                la3: session.mediators?.linguisticAbstractness?.q3,
                la4: session.mediators?.linguisticAbstractness?.q4,

                finlit1,
                finlit2,
                finlit3,
                finlit4,

                risk_f1: session.controls?.riskTolerance?.q1,
                risk_f2: session.controls?.riskTolerance?.q2,
                risk_f3: session.controls?.riskTolerance?.q3,
                risk_f4: session.controls?.riskTolerance?.q4,
                risk_f5: session.controls?.riskTolerance?.q5,
                
                risk_f_composite: composites.risk_f_composite,
                choice_reason_text: session.openRationale ? "REDACTED" : "",
                
                flag_viewtime: Number(qualityFlags.includes('flag_viewtime')),
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
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Data Analysis & Export</h1>
                    <p className="text-muted-foreground mt-1">Visualize and export the collected study data.</p>
                </div>
                <div className="flex gap-2">
                     <Button onClick={handleExportCodebook} variant="outline">
                        <BookText className="mr-2 h-4 w-4" />
                        Download Codebook
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting || !sessions || sessions.length === 0}>
                        {isExporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isExporting ? 'Exporting...' : 'Export Data to CSV'}
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
        </div>
    );
}

    