import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import CompletionRateChart from '@/components/admin/CompletionRateChart';
import ChoiceDistributionChart from '@/components/admin/ChoiceDistributionChart';
import CredibilityScoresChart from '@/components/admin/CredibilityScoresChart';

export default function DataAnalysisPage() {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Data Analysis & Export</h1>
                    <p className="text-muted-foreground mt-1">Visualize and export the collected study data.</p>
                </div>
                <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
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
