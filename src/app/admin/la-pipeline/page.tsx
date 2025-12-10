
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import { calculateLaObjective } from '@/ai/flows/calculate-la-objective';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import type { SessionData } from '@/lib/types';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { cn } from '@/lib/utils';

const EXPERIMENT_ID = 'exp_003';

type RationaleScore = {
    id: string; // Participant ID
    rationale: string;
    la_objective: number | null;
    status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
};


export default function LAPipelinePage() {
  const [isPipelinePaused, setIsPipelinePaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scores, setScores] = useState<RationaleScore[]>([]);
  const { toast } = useToast();
  const firestore = useFirestore();

  const rationaleQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Fetch participants who have a non-empty rationale. 
    // Using '>' with an empty string is the correct way to find documents where the field is a non-empty string.
    return query(
        collection(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`),
        where('openRationale', '>', '')
    );
  }, [firestore]);

  const { data: sessions, isLoading: isLoadingSessions } = useCollection<SessionData>(rationaleQuery);
  
  useEffect(() => {
    if (sessions) {
        const initialScores = sessions.map(session => ({
            id: session.id,
            rationale: session.openRationale || '',
            la_objective: session.la_objective || null,
            status: session.la_objective ? 'Completed' : 'Queued',
        }));
        setScores(initialScores);
    }
  }, [sessions]);


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
    // Set status to 'Processing' only for queued items
    setScores(prevScores => prevScores.map(s => s.status === 'Queued' ? { ...s, status: 'Processing' } : s));

    const analysisPromises = scores
      .filter(score => score.status !== 'Completed') // Only process non-completed
      .map(async (score) => {
        try {
          const result = await calculateLaObjective({ advisoryText: score.rationale });
          
          // Save the result back to Firestore
          if (firestore) {
              const participantDocRef = doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, score.id);
              updateDocumentNonBlocking(participantDocRef, { la_objective: result.la_objective });
          }

          return { ...score, la_objective: result.la_objective, status: 'Completed' as const };
        } catch (error) {
          console.error(`Failed to analyze ${score.id}:`, error);
          return { ...score, status: 'Failed' as const };
        }
    });

    const results = await Promise.all(analysisPromises);
    
    // Update the local state with the results
    setScores(prevScores => {
        const newScores = [...prevScores];
        results.forEach(result => {
            const index = newScores.findIndex(s => s.id === result.id);
            if (index !== -1) {
                newScores[index] = result;
            }
        });
        return newScores;
    });

    setIsProcessing(false);
    toast({
        title: 'Analysis Complete',
        description: 'All pending rationales have been processed.',
    });
  };

  const jobsInQueue = useMemo(() => {
    return scores.filter(s => s.status === 'Queued').length;
  }, [scores]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Objective Linguistic Analysis Pipeline</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage the automated linguistic analysis (LA) jobs for participant rationale.</p>
        </div>
        <Button onClick={handleRunAnalysis} disabled={isProcessing || isPipelinePaused || jobsInQueue === 0}>
          {isProcessing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isProcessing ? `Processing ${jobsInQueue} Jobs...` : `Run ${jobsInQueue} Pending Jobs`}
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
                     <span className="text-xs text-muted-foreground">Rationales awaiting analysis.</span>
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
              <CardDescription>Linguistic abstractness scores for each participant's open rationale.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant ID</TableHead>
                      <TableHead>LA_OBJECTIVE</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingSessions ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                            </TableCell>
                        </TableRow>
                    ) : scores.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No participant rationale found to analyze.
                            </TableCell>
                        </TableRow>
                    ) : (
                        scores.map((score) => (
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
                                className={cn(
                                    'text-xs',
                                    score.status === 'Completed' ? 'bg-green-600/20 text-green-700 border-green-600/30' : 
                                    score.status === 'Processing' ? 'bg-yellow-600/20 text-yellow-700 border-yellow-600/30 animate-pulse' :
                                    score.status === 'Failed' ? 'bg-red-600/20 text-red-700 border-red-600/30' :
                                    'bg-blue-600/20 text-blue-700 border-blue-600/30'
                                )}
                            >
                                {score.status}
                            </Badge>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
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
