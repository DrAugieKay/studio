
'use client';

import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, CheckCircle2, Clock, BarChartHorizontal, Loader2 } from 'lucide-react';
import { getQualityFlags } from '@/lib/quality-flags';
import { getComposites } from '@/lib/composites';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { SessionData } from '@/lib/types';

const EXPERIMENT_ID = 'exp_001';

const flagDetails: Record<string, { label: string; Icon: React.ElementType, className: string }> = {
    'flag_comprehension': { label: 'Comprehension Failure', Icon: AlertCircle, className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
    'flag_viewtime': { label: 'Low Exposure Time', Icon: Clock, className: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
    'flag_straightline': { label: 'Straight-Lining', Icon: BarChartHorizontal, className: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
};


export default function SessionDetailPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const firestore = useFirestore();

    const participantDocRef = useMemoFirebase(() => {
        if (!firestore || !sessionId) return null;
        return doc(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`, sessionId);
    }, [firestore, sessionId]);

    const { data: session, isLoading } = useDoc<SessionData>(participantDocRef);
    
    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) {
        return <div>Session not found.</div>;
    }

    const qualityFlags = getQualityFlags(session);
    const composites = getComposites(session);

    const formatCondition = (condition: any) => {
        if (!condition) return 'N/A';
        return `${condition.advisorySource.toUpperCase()} / ${condition.linguisticFrame.toUpperCase()} / ${condition.scenario.toUpperCase()}`;
    }

    const renderValue = (value: any) => {
        if (value === null || typeof value === 'undefined') return <span className="text-muted-foreground">N/A</span>;
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'number') return value.toFixed(2);
        return String(value);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Session: {session.id}</h1>
                    <p className="text-muted-foreground mt-1">Detailed view of participant session data and computed scores.</p>
                </div>
            </div>

            {/* Metadata Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Session Metadata</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="font-semibold">Status</p>
                        <Badge
                            variant={
                                session.status === 'Completed' ? 'default'
                                : session.status === 'In Progress' ? 'secondary'
                                : 'destructive'
                            }
                            className={
                                session.status === 'Completed' ? 'bg-green-600/20 text-green-700 border-green-600/30'
                                : session.status === 'In Progress' ? 'bg-blue-600/20 text-blue-700 border-blue-600/30'
                                : 'bg-red-600/20 text-red-700 border-red-600/30'
                            }
                        >
                            {session.status}
                        </Badge>
                    </div>
                    <div>
                        <p className="font-semibold">Condition</p>
                        <p>{formatCondition(session.condition)}</p>
                    </div>
                     <div>
                        <p className="font-semibold">Start Time</p>
                        <p>{new Date(session.startTime).toLocaleString()}</p>
                    </div>
                     <div>
                        <p className="font-semibold">End Time</p>
                        <p>{session.endTime ? new Date(session.endTime).toLocaleString() : 'N/A'}</p>
                    </div>
                     <div className="col-span-2 md:col-span-4">
                        <p className="font-semibold">Data Quality Flags</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {qualityFlags.length > 0 ? qualityFlags.map(flag => {
                                const detail = flagDetails[flag];
                                if (!detail) return null;
                                return <Badge key={flag} variant="outline" className={detail.className}><detail.Icon className="h-3 w-3 mr-1.5" />{detail.label}</Badge>;
                            }) : <Badge variant="outline" className="bg-green-600/20 text-green-700 border-green-600/30"><CheckCircle2 className="h-3 w-3 mr-1.5" />No Flags</Badge>}
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Composites */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold font-headline mb-4">Derived Composites</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Objective DQ</CardTitle></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{composites.obj_dq_binary ? '1 (Normative)' : '0 (Non-Normative)'}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Subjective DQ</CardTitle><CardDescription>Mean Score</CardDescription></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{renderValue(composites.dq_sub_mean)}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Financial Literacy</CardTitle><CardDescription>Sum Score (0-4)</CardDescription></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{renderValue(composites.finlit_sum)}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Risk Tolerance</CardTitle><CardDescription>Composite Mean</CardDescription></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{renderValue(composites.risk_f_composite)}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Credibility</CardTitle><CardDescription>Global Mean</CardDescription></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{renderValue(composites.cr_global_mean)}</p></CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Psychological Dist.</CardTitle><CardDescription>Composite Mean</CardDescription></CardHeader>
                        <CardContent><p className="text-3xl font-bold">{renderValue(composites.pd_composite)}</p></CardContent>
                    </Card>
                </div>
            </div>

            {/* Raw Data */}
            <div>
                 <h2 className="text-2xl font-bold font-headline mb-4">Raw Data Viewer</h2>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Subjective Decision Quality</AccordionTrigger>
                        <AccordionContent>
                           <pre className="p-4 bg-muted rounded-md text-sm">{JSON.stringify(session.subjectiveDQ, null, 2)}</pre>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Credibility</AccordionTrigger>
                        <AccordionContent>
                             <pre className="p-4 bg-muted rounded-md text-sm">{JSON.stringify(session.mediators?.advisoryCredibility, null, 2)}</pre>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Risk Tolerance</AccordionTrigger>
                        <AccordionContent>
                             <pre className="p-4 bg-muted rounded-md text-sm">{JSON.stringify(session.controls?.riskTolerance, null, 2)}</pre>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                        <AccordionTrigger>Open Rationale</AccordionTrigger>
                        <AccordionContent>
                            <p className="p-4 bg-muted rounded-md text-sm italic">{session.openRationale || "No rationale provided."}</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}
