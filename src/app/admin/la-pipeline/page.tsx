
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import { calculateLaObjective, CalculateLaObjectiveOutput } from '@/ai/flows/calculate-la-objective';
import { useToast } from '@/hooks/use-toast';

type AdvisoryScore = {
    id: string;
    advisoryText: string;
    la_objective: number | null;
    status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
};

const initialAdvisoryScores: AdvisoryScore[] = [
  { id: 'xyz-human-abstract', advisoryText: "Given the board’s high-priority directive to prioritize capital preservation, the recommended allocation for the $1,000,000 surplus is: 100% to Option C — Government Bonds.", la_objective: null, status: 'Queued' },
  { id: 'xyz-human-concrete', advisoryText: "To keep your $1,000,000 safe for the IoT launch, put 100% in Government Bonds (Option C). This is the only choice that guarantees you won't lose money.", la_objective: null, status: 'Queued' },
  { id: 'xyz-ai-abstract', advisoryText: "Based on a multi-factor weighted analysis of portfolio risk and strategic alignment, the optimal allocation is 100% to Option C, which minimizes downside volatility.", la_objective: null, status: 'Queued' },
  { id: 'xyz-ai-concrete', advisoryText: "Allocate all $1,000,000 to Option C (Government Bonds). This choice has a 99.8% probability of preserving principal over 24 months, meeting your primary goal.", la_objective: null, status: 'Queued' },
  { id: 'tech-human-abstract', advisoryText: "Prioritizing runway preservation and R&D continuity, the most defensible allocation for the surplus funds is a full commitment to the lowest-risk asset class available.", la_objective: null, status: 'Queued' },
  { id: 'tech-human-concrete', advisoryText: "To make sure you have enough cash for the next 18 months of R&D, put the entire $500,000 surplus into Option C (Government Bonds).", la_objective: null, status: 'Queued' },
  { id: 'tech-ai-abstract', advisoryText: "Analysis indicates that downside risk mitigation is paramount. Therefore, an allocation maximizing capital preservation is the logical imperative.", la_objective: null, status: 'Queued' },
  { id: 'tech-ai-concrete', advisoryText: "To guarantee funds for the product launch, allocate 100% of the $500,000 to Option C. This provides maximum security for your capital.", la_objective: null, status: 'Queued' },
];

export default function LAPipelinePage() {
  const [isPipelinePaused, setIsPipelinePaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scores, setScores] = useState<AdvisoryScore[]>(initialAdvisoryScores);
  const { toast } = useToast();

  const handleTogglePause = (isPaused: boolean) => {
    setIsPipelinePaused(isPaused);
    console.log(`Pipeline ${isPaused ? 'paused' : 'resumed'}`);
  };

  const handleRunAnalysis = async () => {
    if (isPipelinePaused) {
        toast({
            variant: 'destructive',
            title: 'Pipeline Paused',
            description: 'Please resume the pipeline before running the analysis.',
        });
        return;
    }

    setIsProcessing(true);
    setScores(prevScores => prevScores.map(s => ({ ...s, status: 'Processing' })));

    const analysisPromises = scores.map(async (score) => {
      try {
        const result = await calculateLaObjective({ advisoryText: score.advisoryText });
        return { ...score, la_objective: result.la_objective, status: 'Completed' as const };
      } catch (error) {
        console.error(`Failed to analyze ${score.id}:`, error);
        return { ...score, status: 'Failed' as const };
      }
    });

    const results = await Promise.all(analysisPromises);
    
    setScores(results);
    setIsProcessing(false);
    toast({
        title: 'Analysis Complete',
        description: 'All advisory texts have been processed.',
    });
  };

  const jobsInQueue = scores.filter(s => s.status === 'Queued' || s.status === 'Processing').length;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Objective Linguistic Analysis Pipeline</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage the automated linguistic analysis (LA) jobs.</p>
        </div>
        <Button onClick={handleRunAnalysis} disabled={isProcessing || isPipelinePaused}>
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isProcessing ? 'Processing...' : 'Run All Jobs'}
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Control Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="pipeline-toggle" className="flex flex-col space-y-1">
                  <span className="font-medium">Analysis Pipeline</span>
                  <span className="text-xs text-muted-foreground">
                    {isPipelinePaused ? 'Processing is paused.' : 'Actively processing jobs.'}
                  </span>
                </Label>
                <Switch
                  id="pipeline-toggle"
                  checked={!isPipelinePaused}
                  onCheckedChange={(checked) => handleTogglePause(!checked)}
                  aria-label="Toggle analysis pipeline"
                  disabled={isProcessing}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex flex-col space-y-1">
                     <span className="font-medium">Job Queue</span>
                     <span className="text-xs text-muted-foreground">Advisories awaiting analysis.</span>
                  </div>
                  <p className="text-2xl font-bold">{jobsInQueue}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scores Table */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Computed LA_OBJECTIVE Scores</CardTitle>
              <CardDescription>Final z-scored linguistic abstractness for each unique advisory text.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Advisory ID</TableHead>
                      <TableHead>LA_OBJECTIVE</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scores.map((score) => (
                      <TableRow key={score.id}>
                        <TableCell className="font-medium">{score.id}</TableCell>
                        <TableCell>{score.la_objective !== null ? score.la_objective.toFixed(4) : '---'}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                                score.status === 'Completed' ? 'default' : 
                                score.status === 'Processing' ? 'secondary' :
                                score.status === 'Failed' ? 'destructive' : 
                                'secondary'
                            }
                            className={
                                score.status === 'Completed' ? 'bg-green-600/20 text-green-700 border-green-600/30' : 
                                score.status === 'Processing' ? 'bg-yellow-600/20 text-yellow-700 border-yellow-600/30' :
                                score.status === 'Failed' ? 'bg-red-600/20 text-red-700 border-red-600/30' :
                                'bg-blue-600/20 text-blue-700 border-blue-600/30'
                            }
                          >
                            {score.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
