
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Play, Pause } from 'lucide-react';

const mockAdvisoryScores = [
  { id: 'xyz-human-abstract', la_objective: 0.85, status: 'Completed' },
  { id: 'xyz-human-concrete', la_objective: -1.12, status: 'Completed' },
  { id: 'xyz-ai-abstract', la_objective: 0.91, status: 'Completed' },
  { id: 'xyz-ai-concrete', la_objective: -1.25, status: 'Completed' },
  { id: 'tech-human-abstract', la_objective: 0.79, status: 'Completed' },
  { id: 'tech-human-concrete', la_objective: -1.05, status: 'Completed' },
  { id: 'tech-ai-abstract', la_objective: null, status: 'Queued' },
  { id: 'tech-ai-concrete', la_objective: null, status: 'Queued' },
];

export default function LAPipelinePage() {
  const [isPipelinePaused, setIsPipelinePaused] = useState(false);
  const [jobsInQueue, setJobsInQueue] = useState(2); // Mock data

  const handleTogglePause = (isPaused: boolean) => {
    setIsPipelinePaused(isPaused);
    // In a real app, you would make an API call here to pause/resume the pipeline
    console.log(`Pipeline ${isPaused ? 'paused' : 'resumed'}`);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Objective Linguistic Analysis Pipeline</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage the automated linguistic analysis (LA) jobs.</p>
        </div>
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
                      <TableHead>LA_OBJECTIVE (z-score)</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAdvisoryScores.map((score) => (
                      <TableRow key={score.id}>
                        <TableCell className="font-medium">{score.id}</TableCell>
                        <TableCell>{score.la_objective !== null ? score.la_objective.toFixed(2) : '---'}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={score.status === 'Completed' ? 'default' : 'secondary'}
                            className={score.status === 'Completed' ? 'bg-green-600/20 text-green-700 border-green-600/30' : 'bg-blue-600/20 text-blue-700 border-blue-600/30'}
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
