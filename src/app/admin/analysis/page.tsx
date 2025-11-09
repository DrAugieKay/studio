
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import CompletionRateChart from '@/components/admin/CompletionRateChart';
import ChoiceDistributionChart from '@/components/admin/ChoiceDistributionChart';
import CredibilityScoresChart from '@/components/admin/CredibilityScoresChart';
import { getQualityFlags } from '@/lib/quality-flags';
import { getComposites } from '@/lib/composites';
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

    const handleExport = () => {
        if (!sessions) return;
        setIsExporting(true);
        console.log('Starting CSV export...');

        try {
            const dataToExport = sessions.map(session => {
                const qualityFlags = getQualityFlags(session);
                const composites = getComposites(session);

                // Flatten the data structure for CSV to match the codebook exactly
                const flattened: Record<string, any> = {
                    participant_id: session.id,
                    condition_code: session.condition ? `${session.condition.advisorySource}-${session.condition.linguisticFrame}-${session.condition.scenario}` : 'N/A',
                    random_seed: 'NOT_IMPLEMENTED', // Placeholder
                    start_time: session.startTime,
                    end_time: session.endTime,
                    device_type: session.deviceInfo?.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
                    browser_info: session.deviceInfo?.userAgent,
                    
                    // Exposure and engagement
                    dossier_view_time: session.dossierViewTime / 1000, // to seconds
                    advisory_view_time: session.advisoryViewTime / 1000, // to seconds
                    scroll_events: session.advisoryScrollCount,

                    // Consent
                    consent_ageCheck: session.consent_ageCheck,
                    consent_isEmployed: session.consent_isEmployed,
                    consent_hasParticipated: session.consent_hasParticipated,
                    consent_consentGiven: session.consent_consentGiven,
                    
                    // Initial Assessments (Raw)
                    ...session.initialAssessments?.financialLiteracy,
                    ...session.initialAssessments?.roleAndExperience,
                    ...session.initialAssessments?.organizationalProfile,

                    // Comprehension Checks (Raw)
                    comp_q1: session.comprehension?.q1,
                    comp_q2: session.comprehension?.q2,

                    // Manipulation Checks (Raw)
                    ...session.manipulationChecks,

                    // Behavioral Outcome (Raw)
                    choice_raw: session.objectiveChoice,
                    
                    // Subjective DQ (Raw)
                    ...session.subjectiveDQ,

                    // Mediators (Raw)
                    ...session.mediators?.advisoryCredibility,
                    ...session.mediators?.psychologicalDistance,
                    ...session.mediators?.linguisticAbstractness,
                    ...session.mediators?.outcomeFraming,

                    // Controls (Raw)
                    ...session.controls?.riskTolerance,
                    ...session.controls?.digitalLiteracy,

                    // Open Rationale
                    choice_reason_text: "REDACTED",

                    // Computed Composites & Coded Variables
                    obj_dq_binary: Number(composites.obj_dq_binary),
                    dq_sub_mean: composites.dq_sub_mean,
                    cr_trust: composites.cr_trust,
                    cr_comp: composites.cr_comp,
                    cr_good: composites.cr_good,
                    cr_global_mean: composites.cr_global_mean,
                    pd_composite: composites.pd_composite,
                    finlit_sum: composites.finlit_sum,
                    risk_f_composite: composites.risk_f_composite,
                    la_objective: null, // Placeholder for LA pipeline output
                    
                    // Flags
                    flag_comprehension: Number(qualityFlags.includes('flag_comprehension')),
                    flag_viewtime: Number(qualityFlags.includes('flag_viewtime')),
                    flag_straightline: Number(qualityFlags.includes('flag_straightline')),
                    flagged_any: Number(qualityFlags.length > 0),
                };

                return flattened;
            });

            const csv = Papa.unparse(dataToExport);
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            link.setAttribute('download', `advisory_insights_export_${timestamp}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('Export successful.');
        } catch (error) {
            console.error('Export failed:', error);
            // Here you could add a user-facing error message, e.g., using a toast.
        } finally {
            setIsExporting(false);
        }
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
                <Button onClick={handleExport} disabled={isExporting || !sessions || sessions.length === 0}>
                    {isExporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export to CSV'}
                </Button>
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
