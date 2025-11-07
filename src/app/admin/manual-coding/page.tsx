
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ManualCodingTask from '@/components/admin/ManualCodingTask';
import { CheckCircle2, TriangleAlert } from 'lucide-react';
import type { CodingTask } from '@/lib/types';


const mockCodingTasks: CodingTask[] = [
  {
    id: 'SESS_8A2B4C',
    rationale: 'The decision was based primarily on the need for capital preservation. Option C offered the highest degree of safety, which aligns with the board’s conservative mandate. The lower return was an acceptable trade-off for risk mitigation.',
    coderA_codes: ['Capital Preservation', 'Risk Aversion'],
    coderB_codes: ['Capital Preservation', 'Risk Aversion'],
  },
  {
    id: 'SESS_D5E6F7',
    rationale: 'I chose Option B because it provided a balance between growth and risk. While Option C was safer, the potential returns were too low to justify completely ignoring market opportunities. Option B felt like a reasonable compromise.',
    coderA_codes: ['Balanced Approach', 'Growth Focus'],
    coderB_codes: ['Balanced Approach'],
  },
  {
    id: 'SESS_J1K2L3',
    rationale: 'Risk mitigation was the key factor. Given the firm’s strategic goals, losing principal was not an option. Government bonds were the only choice that guaranteed the capital would be available for the IoT launch.',
    coderA_codes: ['Risk Aversion', 'Strategic Alignment'],
    coderB_codes: ['Risk Aversion'],
  },
  {
    id: 'SESS_M4N5P6',
    rationale: 'Felt the advisory for C was the most compelling and detailed.',
    coderA_codes: ['Trust in Advisory'],
    coderB_codes: ['Trust in Advisory'],
  },
];


const predefinedCodes = ['Capital Preservation', 'Risk Aversion', 'Balanced Approach', 'Growth Focus', 'Trust in Advisory', 'Strategic Alignment'];

export default function ManualCodingPage() {
  const [selectedTask, setSelectedTask] = useState<CodingTask>(mockCodingTasks[0]);
  const [kappaScore, setKappaScore] = useState(0.68); // Mock kappa score < 0.70 to show warning

  const handleSelectTask = (task: CodingTask) => {
    setSelectedTask(task);
  };
  
  const tasksWithRationale = mockCodingTasks.filter(r => r.rationale);

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
                    {tasksWithRationale.map(task => (
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
                    ))}
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
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a participant response to begin validation.</p>
                </div>
             )}
          </div>
        </div>
    </div>
  );
}

