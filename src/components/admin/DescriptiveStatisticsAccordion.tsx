
'use client';

import type { SessionData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useMemo } from 'react';
import { calculateAllDescriptiveStats, QUESTION_SETS } from '@/lib/descriptives';

type DescriptiveStatsProps = {
    sessions: SessionData[] | null;
};

export default function DescriptiveStatisticsAccordion({ sessions }: DescriptiveStatsProps) {
    
    const stats = useMemo(() => {
        if (!sessions) return {};
        return calculateAllDescriptiveStats(sessions);
    }, [sessions]);

    const renderFrequencyTable = (questionSetKey: keyof typeof QUESTION_SETS, questionKey: string) => {
        const dataSet = stats[questionSetKey as keyof typeof stats];
        if (!dataSet || Object.keys(dataSet).length === 0) return <p className="text-muted-foreground">No data available.</p>;
        
        const data = dataSet[questionKey];
        if (!data || Object.keys(data).length === 0) return <div><p className="text-muted-foreground">No data available.</p></div>;
        
        return (
            <Table>
                <TableHeader><TableRow><TableHead>Response</TableHead><TableHead className="text-right">Frequency</TableHead><TableHead className="text-right">Percentage</TableHead></TableRow></TableHeader>
                <TableBody>
                    {Object.entries(data as Record<string, { count: number; percentage: string }>).sort(([, a], [, b]) => b.count - a.count).map(([response, values]) => (
                        <TableRow key={response}><TableCell>{response || "N/A"}</TableCell><TableCell className="text-right">{values.count}</TableCell><TableCell className="text-right">{values.percentage}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    };

    const renderMeanStdTable = (questionSetKey: keyof typeof QUESTION_SETS) => {
        const questionSet = QUESTION_SETS[questionSetKey];
        const data = stats[questionSetKey as keyof typeof stats];
        if (!data) return <p className="text-muted-foreground">No data available.</p>;
        return (
            <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Mean</TableHead><TableHead className="text-right">Std. Dev.</TableHead></TableRow></TableHeader>
                <TableBody>
                    {Object.entries(questionSet.questions).map(([key, label]) => (
                        <TableRow key={key}><TableCell>{label as string}</TableCell><TableCell className="text-right">{data[key].mean}</TableCell><TableCell className="text-right">{data[key].std}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    const renderNumericStatsTable = (questionSetKey: 'behavioralMetrics') => {
        const questionSet = QUESTION_SETS[questionSetKey];
        const data = stats[questionSetKey];
        if (!data) return <p className="text-muted-foreground">No data available.</p>;
        return (
            <Table>
                <TableHeader><TableRow><TableHead>Metric</TableHead><TableHead className="text-right">Mean</TableHead><TableHead className="text-right">Std. Dev.</TableHead><TableHead className="text-right">Min</TableHead><TableHead className="text-right">Max</TableHead></TableRow></TableHeader>
                <TableBody>
                    {Object.entries(questionSet.questions).map(([key, label]) => (
                        <TableRow key={key}>
                            <TableCell>{label as string}</TableCell>
                            <TableCell className="text-right">{data[key].mean}</TableCell>
                            <TableCell className="text-right">{data[key].std}</TableCell>
                            <TableCell className="text-right">{data[key].min}</TableCell>
                            <TableCell className="text-right">{data[key].max}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };


    if (!sessions || Object.keys(stats).length === 0) {
        return <p className="text-muted-foreground text-center py-8">No session data available to calculate statistics.</p>;
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            {Object.entries(QUESTION_SETS).map(([key, { title, type }]) => (
                <AccordionItem value={key} key={key}>
                    <AccordionTrigger>{title}</AccordionTrigger>
                    <AccordionContent>
                        <Card>
                            <CardContent className="p-6">
                                {type === 'numeric' ? (
                                    renderNumericStatsTable(key as 'behavioralMetrics')
                                ) : type === 'frequency' ? (
                                    <div className="space-y-6">
                                        {Object.entries(QUESTION_SETS[key as keyof typeof QUESTION_SETS].questions).map(([qKey, qLabel]) => (
                                            <div key={qKey}>
                                                <h4 className="font-semibold mb-2">{qLabel as string}</h4>
                                                {renderFrequencyTable(key as keyof typeof QUESTION_SETS, qKey)}
                                            </div>
                                        ))}
                                    </div>
                                 ) : renderMeanStdTable(key as keyof typeof QUESTION_SETS)}
                            </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
