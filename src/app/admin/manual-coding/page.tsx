
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X } from 'lucide-react';

const mockResponses = [
  { id: 'SESS_8A2B4C', rationale: 'The decision was based primarily on the need for capital preservation. Option C offered the highest degree of safety, which aligns with the board’s conservative mandate. The lower return was an acceptable trade-off for risk mitigation.' },
  { id: 'SESS_D5E6F7', rationale: 'I chose Option B because it provided a balance between growth and risk. While Option C was safer, the potential returns were too low to justify completely ignoring market opportunities. Option B felt like a reasonable compromise.' },
  { id: 'SESS_J1K2L3', rationale: 'Risk mitigation was the key factor. Given the firm’s strategic goals, losing principal was not an option. Government bonds were the only choice that guaranteed the capital would be available for the IoT launch.' },
  { id: 'SESS_M4N5P6', rationale: 'Felt the advisory for C was the most compelling and detailed.' },
  { id: 'SESS_Q7R8S9', rationale: '' }, // Empty rationale
];

const predefinedCodes = ['Capital Preservation', 'Risk Aversion', 'Balanced Approach', 'Growth Focus', 'Trust in Advisory'];

export default function ManualCodingPage() {
  const [selectedResponse, setSelectedResponse] = useState(mockResponses[0]);
  const [appliedCodes, setAppliedCodes] = useState<string[]>(['Capital Preservation', 'Risk Aversion']);
  const [availableCodes, setAvailableCodes] = useState<string[]>(predefinedCodes);
  const [newCode, setNewCode] = useState('');

  const handleSelectResponse = (response: typeof mockResponses[0]) => {
    setSelectedResponse(response);
    // In a real app, you'd fetch and set the codes for this response
    if(response.id === 'SESS_D5E6F7') {
      setAppliedCodes(['Balanced Approach']);
    } else {
      setAppliedCodes(['Capital Preservation', 'Risk Aversion']);
    }
  };

  const handleAddCode = () => {
    if (newCode && !availableCodes.includes(newCode)) {
      setAvailableCodes([...availableCodes, newCode]);
    }
    if (newCode && !appliedCodes.includes(newCode)) {
      setAppliedCodes([...appliedCodes, newCode]);
      setNewCode('');
    }
  };
  
  const handleToggleCode = (code: string) => {
    if (appliedCodes.includes(code)) {
      setAppliedCodes(appliedCodes.filter(c => c !== code));
    } else {
      setAppliedCodes([...appliedCodes, code]);
    }
  }

  const responsesWithRationale = mockResponses.filter(r => r.rationale);

  return (
    <div className="w-full">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Manual Coding</h1>
                <p className="text-muted-foreground mt-1">Review and code open-ended participant rationale.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Response List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Participant Responses</CardTitle>
                <CardDescription>Select a response to code.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {responsesWithRationale.map(res => (
                      <Button
                        key={res.id}
                        variant={selectedResponse?.id === res.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-left h-auto"
                        onClick={() => handleSelectResponse(res)}
                      >
                        <div>
                          <p className="font-semibold">{res.id}</p>
                          <p className="text-xs text-muted-foreground truncate">{res.rationale}</p>
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
             {selectedResponse ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Coding: {selectedResponse.id}</CardTitle>
                        <CardDescription>Review the rationale and apply relevant codes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 border rounded-lg bg-secondary/30">
                            <p className="font-semibold mb-2">Rationale:</p>
                            <p className="text-muted-foreground">{selectedResponse.rationale}</p>
                        </div>

                        {/* Applied Codes */}
                        <div>
                            <h4 className="font-semibold mb-3">Applied Codes</h4>
                            <div className="flex flex-wrap gap-2">
                                {appliedCodes.length > 0 ? appliedCodes.map(code => (
                                    <Badge key={code} variant="default" className="text-sm bg-primary hover:bg-primary/90">
                                        {code}
                                        <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-transparent hover:text-primary-foreground/70" onClick={() => handleToggleCode(code)}>
                                          <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )) : <p className="text-sm text-muted-foreground">No codes applied yet.</p>}
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Available Codes */}
                            <div>
                                <h4 className="font-semibold mb-3">Available Codes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {availableCodes.filter(c => !appliedCodes.includes(c)).map(code => (
                                        <Badge key={code} variant="outline" className="text-sm cursor-pointer" onClick={() => handleToggleCode(code)}>
                                            <PlusCircle className="h-3 w-3 mr-1" />
                                            {code}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            
                             {/* Add New Code */}
                            <div>
                                <h4 className="font-semibold mb-3">Add New Code</h4>
                                <div className="flex gap-2">
                                    <Input 
                                      value={newCode} 
                                      onChange={(e) => setNewCode(e.target.value)} 
                                      placeholder="Type new code..."
                                      onKeyDown={(e) => e.key === 'Enter' && handleAddCode()}
                                    />
                                    <Button onClick={handleAddCode}>Add</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button>Save & Next</Button>
                    </CardFooter>
                </Card>
             ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a participant response to begin coding.</p>
                </div>
             )}
          </div>
        </div>
    </div>
  );
}

