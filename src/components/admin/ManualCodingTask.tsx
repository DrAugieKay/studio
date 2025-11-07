
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X } from 'lucide-react';
import type { CodingTask } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ManualCodingTaskProps {
    task: CodingTask;
    predefinedCodes: string[];
}

export default function ManualCodingTask({ task, predefinedCodes }: ManualCodingTaskProps) {
  const [coderBCodes, setCoderBCodes] = useState(task.coderB_codes);
  const availableCodes = predefinedCodes.filter(c => !coderBCodes.includes(c));

  const handleToggleCode = (code: string) => {
    setCoderBCodes(prev => 
        prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const getAgreementStatus = (code: string) => {
    const inA = task.coderA_codes.includes(code);
    const inB = coderBCodes.includes(code);
    if (inA && inB) return 'agree';
    if (inA || inB) return 'disagree';
    return 'none';
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
                <p className="text-muted-foreground">{task.rationale}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coder A */}
                <div>
                    <h4 className="font-semibold mb-3">Coder A's Codes</h4>
                    <div className="flex flex-wrap gap-2 p-3 rounded-md border min-h-[40px] bg-muted/20">
                        {task.coderA_codes.length > 0 ? task.coderA_codes.map(code => (
                            <Badge key={code} variant="secondary" className="text-sm">
                                {code}
                            </Badge>
                        )) : <p className="text-sm text-muted-foreground">No codes applied.</p>}
                    </div>
                </div>
                 {/* Coder B */}
                <div>
                    <h4 className="font-semibold mb-3">Coder B's Codes (You)</h4>
                    <div className="flex flex-wrap gap-2 p-3 rounded-md border min-h-[40px] border-primary/30">
                       {coderBCodes.length > 0 ? coderBCodes.map(code => (
                            <Badge key={code} variant="default" className="text-sm bg-primary hover:bg-primary/90">
                                {code}
                                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-transparent hover:text-primary-foreground/70" onClick={() => handleToggleCode(code)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        )) : <p className="text-sm text-muted-foreground">Apply codes from the list below.</p>}
                    </div>
                </div>
            </div>
            
            <Separator />
            
            <div>
                <h4 className="font-semibold mb-3">Code Agreement</h4>
                 <div className="flex flex-wrap gap-2">
                    {predefinedCodes.map(code => {
                        const status = getAgreementStatus(code);
                        if (status === 'none' && !coderBCodes.includes(code)) return null;

                        const isAppliedByB = coderBCodes.includes(code);

                        return (
                             <Badge 
                                key={code} 
                                variant="outline" 
                                className={cn("text-sm cursor-pointer transition-all", {
                                    'border-green-500 bg-green-500/10 text-green-700': status === 'agree',
                                    'border-red-500 bg-red-500/10 text-red-700': status === 'disagree',
                                    'hover:bg-secondary/80': !isAppliedByB
                                })}
                                onClick={() => handleToggleCode(code)}
                             >
                               {isAppliedByB ? <X className="h-3 w-3 mr-1.5" /> : <Check className="h-3 w-3 mr-1.5" />}
                               {code}
                            </Badge>
                        )
                    })}
                </div>
            </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Skip</Button>
          <Button>Save & Next</Button>
        </CardFooter>
    </Card>
  );
}
