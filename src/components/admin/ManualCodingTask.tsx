
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, Plus } from 'lucide-react';
import type { CodingTask } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ManualCodingTaskProps {
    task: CodingTask;
    predefinedCodes: string[];
}

export default function ManualCodingTask({ task, predefinedCodes }: ManualCodingTaskProps) {
  const [coderBCodes, setCoderBCodes] = useState(task.coderB_codes);
  const { toast } = useToast();

  const handleToggleCode = (code: string) => {
    setCoderBCodes(prev => 
        prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const getAgreementStatus = (code: string): 'agree' | 'disagree' | 'none' => {
    const inA = task.coderA_codes.includes(code);
    const inB = coderBCodes.includes(code);
    if (inA && inB) return 'agree'; // Agreement
    if (inA || inB) return 'disagree'; // Disagreement
    return 'none'; // Not applied by either
  };

  const handleSave = () => {
    // In a real app, this would save the `coderBCodes` to Firestore for this task.
    console.log('Saving Coder B codes:', coderBCodes);
    toast({
      title: 'Validation Saved',
      description: `Codes for task ${task.id} have been updated.`,
    });
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Validation Task: {task.id}</CardTitle>
            <CardDescription>Review Coder A's work and apply your own codes as Coder B to check for agreement.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="p-4 border rounded-lg bg-secondary/30">
                <p className="font-semibold mb-2">Participant's Rationale:</p>
                <p className="text-muted-foreground italic">"{task.rationale}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coder A */}
                <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Coder A's Codes</h4>
                    <div className="flex flex-wrap gap-2 p-3 rounded-md border min-h-[40px] bg-muted/20">
                        {task.coderA_codes.length > 0 ? task.coderA_codes.map(code => (
                            <Badge key={code} variant="secondary" className="text-sm">
                                {code}
                            </Badge>
                        )) : <p className="text-sm text-muted-foreground p-1">No codes applied.</p>}
                    </div>
                </div>
                 {/* Coder B */}
                <div>
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Coder B's Codes (You)</h4>
                    <div className="flex flex-wrap gap-2 p-3 rounded-md border min-h-[40px] border-primary/30">
                       {coderBCodes.length > 0 ? coderBCodes.map(code => (
                            <Badge key={code} variant="default" className="text-sm bg-primary hover:bg-primary/90">
                                {code}
                                <button className="ml-1.5 rounded-full hover:bg-primary-foreground/20 p-0.5" onClick={() => handleToggleCode(code)}>
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        )) : <p className="text-sm text-muted-foreground p-1">Apply codes from the list below.</p>}
                    </div>
                </div>
            </div>
            
            <Separator />
            
            <div>
                <h4 className="font-semibold mb-3">Available Codes & Agreement</h4>
                 <div className="flex flex-wrap gap-2">
                    {predefinedCodes.map(code => {
                        const status = getAgreementStatus(code);
                        const isAppliedByB = coderBCodes.includes(code);

                        return (
                             <button
                                key={code} 
                                onClick={() => handleToggleCode(code)}
                                className={cn(
                                    "text-sm rounded-full border px-3 py-1 flex items-center gap-1.5 transition-all",
                                    status === 'agree' && 'bg-green-100 border-green-400 text-green-800',
                                    status === 'disagree' && 'bg-red-100 border-red-400 text-red-800',
                                    status === 'none' && 'bg-secondary text-secondary-foreground hover:bg-muted',
                                    isAppliedByB && 'ring-2 ring-primary ring-offset-1'
                                )}
                             >
                               {status === 'agree' ? <Check className="h-3.5 w-3.5" /> : isAppliedByB ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 text-muted-foreground" />}
                               {code}
                            </button>
                        )
                    })}
                </div>
            </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Skip</Button>
          <Button onClick={handleSave}>Save & Next</Button>
        </CardFooter>
    </Card>
  );
}
