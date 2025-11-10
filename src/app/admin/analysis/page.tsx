
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, BookText } from 'lucide-react';
import CompletionRateChart from '@/components/admin/CompletionRateChart';
import ChoiceDistributionChart from '@/components/admin/ChoiceDistributionChart';
import CredibilityScoresChart from '@/components/admin/CredibilityScoresChart';
import { getQualityFlags, checkComprehension } from '@/lib/quality-flags';
import { getComposites, getFinancialLiteracyScore } from '@/lib/composites';
import { codebookData } from '@/lib/codebook';
import Papa from 'papaparse';
import type { SessionData } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

const EXPERIMENT_ID = 'exp_001';


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
            const { finlit1, finlit2, finlit3, finlit4 } = getFinancialLiteracyScore(session);
            
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
                FINLIT_SUM: composites.finlit_sum,

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
