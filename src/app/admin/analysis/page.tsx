'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import CompletionRateChart from '@/components/admin/CompletionRateChart';
import ChoiceDistributionChart from '@/components/admin/ChoiceDistributionChart';
import CredibilityScoresChart from '@/components/admin/CredibilityScoresChart';
import { mockDetailedSessions } from '@/lib/data';
import { getQualityFlags } from '@/lib/quality-flags';
import { getComposites } from '@/lib/composites';
import Papa from 'papaparse';

export default function DataAnalysisPage() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        console.log('Starting CSV export...');

        try {
            const dataToExport = mockDetailedSessions.map(session => {
                const qualityFlags = getQualityFlags(session);
                const composites = getComposites(session);

                // Flatten the data structure for CSV
                const flattened = {
                    participant_id: session.id,
                    status: session.status,
                    start_time: session.startTime,
                    end_time: session.endTime,
                    // Condition
                    condition_source: session.condition?.advisorySource,
                    condition_frame: session.condition?.linguisticFrame,
                    condition_scenario: session.condition?.scenario,
                    // Timings and Engagement
                    dossier_view_time: session.dossierViewTime,
                    advisory_view_time: session.advisoryViewTime,
                    dossier_scroll_count: session.dossierScrollCount,
                    advisory_scroll_count: session.advisoryScrollCount,
                    // Raw choices and checks
                    ...session.initialAssessments?.financialLiteracy,
                    ...session.manipulationChecks,
                    objective_choice: session.objectiveChoice,
                    // Composites
                    ...composites,
                    // Flags
                    flag_comprehension: qualityFlags.includes('flag_comprehension'),
                    flag_viewtime: qualityFlags.includes('flag_viewtime'),
                    flag_straightline: qualityFlags.includes('flag_straightline'),
                    // REDACTED rationale
                    open_rationale: "REDACTED", 
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

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Data Analysis & Export</h1>
                    <p className="text-muted-foreground mt-1">Visualize and export the collected study data.</p>
                </div>
                <Button onClick={handleExport} disabled={isExporting}>
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
                        <CompletionRateChart />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Decision Choice Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChoiceDistributionChart />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Advisor Credibility Scores</CardTitle>
                        <CardDescription>Average perceived credibility by advisor source.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CredibilityScoresChart />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}