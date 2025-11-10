
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ManualCodingTask from '@/components/admin/ManualCodingTask';
import { CheckCircle2, TriangleAlert, Loader2 } from 'lucide-react';
import type { SessionData, CodingTask } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

const EXPERIMENT_ID = 'exp_001';

const predefinedCodes = ['Capital Preservation', 'Risk Aversion', 'Balanced Approach', 'Growth Focus', 'Trust in Advisory', 'Strategic Alignment'];

export default function ManualCodingPage() {
  const [selectedTask, setSelectedTask] = useState<CodingTask | null>(null);
  const [kappaScore, setKappaScore] = useState(0.68); // Mock kappa score < 0.70 to show warning
  
  const firestore = useFirestore();

  const codingTasksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`),
        where('openRationale', '!=', null)
    );
  }, [firestore]);

  const { data: sessions, isLoading } = useCollection<SessionData>(codingTasksQuery);

  const codingTasks: CodingTask[] = useMemo(() => {
    if (!sessions) return [];
    return sessions.map(session => ({
        id: session.id,
        rationale: session.openRationale || '',
        // These would come from another collection in a real app
        coderA_codes: session.id.includes('D5E6F7') ? ['Balanced Approach', 'Growth Focus'] : ['Risk Aversion'], 
        coderB_codes: session.id.includes('D5E6F7') ? ['Balanced Approach'] : ['Risk Aversion'],
    }));
  }, [sessions]);


  const handleSelectTask = (task: CodingTask) => {
    setSelectedTask(task);
  };
  
  if (isLoading) {
    return (
        <div className="flex h-64 w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading coding tasks...</p>
        </div>
    );
  }

  return (
    <div className="w-full">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Manual Coding & Validation</h1>
                <p className="text-muted-foreground mt-1">Review, code, and validate open-ended participant rationale.</p>
            </div>
        </div>

         <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inter-Rater Reliability (Cohen's Kappa)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <p className={`text-5xl font-bold ${kappaScore >= 0.7 ? 'text-green-600' : 'text-amber-600'}`}>{kappaScore.toFixed(2)}</p>
              <div>
                {kappaScore >= 0.7 ? (
                   <Alert className="border-green-500/50 text-green-700 [&>svg]:text-green-700">
                     <CheckCircle2 className="h-4 w-4" />
                     <AlertTitle>Agreement: Good</AlertTitle>
                     <AlertDescription>The current agreement level is sufficient for reliable automated analysis.</AlertDescription>
                   </Alert>
                ) : (
                  <Alert variant="destructive" className="bg-amber-50 border-amber-500/50 text-amber-700 [&>svg]:text-amber-700">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Agreement: Needs Review (κ &lt; 0.70)</AlertTitle>
                    <AlertDescription>Consider refining coding guidelines or pausing the LA pipeline until agreement improves.</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Response List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Double-Coding Queue</CardTitle>
                <CardDescription>Select a response to validate.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {codingTasks.length > 0 ? codingTasks.map(task => (
                      <Button
                        key={task.id}
                        variant={selectedTask?.id === task.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-left h-auto"
                        onClick={() => handleSelectTask(task)}
                      >
                        <div>
                          <p className="font-semibold">{task.id}</p>
                          <p className="text-xs text-muted-foreground truncate">{task.rationale}</p>
                        </div>
                      </Button>
                    )) : (
                        <div className="text-center p-8 text-muted-foreground">
                            No responses with rationale found.
                        </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Coding Interface */}
          <div className="lg:col-span-2">
             {selectedTask ? (
                <ManualCodingTask 
                  task={selectedTask}
                  predefinedCodes={predefinedCodes}
                />
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground rounded-lg border border-dashed">
                    <p>Select a participant response to begin validation.</p>
                </div>
             )}
          </div>
        </div>
    </div>
  );
}

    