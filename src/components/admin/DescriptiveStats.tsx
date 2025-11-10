
'use client';

import type { SessionData } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useMemo } from 'react';

type DescriptiveStatsProps = {
    sessions: SessionData[] | null;
};

const LIKERT_MAP: Record<string, number> = {
    'Strongly disagree': 1,
    'Disagree': 2,
    'Somewhat disagree': 3,
    'Neither agree nor disagree': 4,
    'Somewhat agree': 5,
    'Agree': 6,
    'Strongly agree': 7,
};

const calculateFrequency = (data: (string | null | undefined)[]) => {
    const counts: Record<string, { count: number; percentage: string }> = {};
    const total = data.filter(Boolean).length;
    if (total === 0) return {};

    data.forEach(item => {
        if (item) {
            counts[item] = counts[item] || { count: 0, percentage: '' };
            counts[item].count++;
        }
    });

    for (const key in counts) {
        counts[key].percentage = ((counts[key].count / total) * 100).toFixed(1) + '%';
    }
    return counts;
};

const calculateMeanStd = (data: (string | null | undefined)[]) => {
    const numericData = data.map(d => d ? LIKERT_MAP[d] : null).filter((d): d is number => d !== null);
    if (numericData.length === 0) return { mean: 'N/A', std: 'N/A' };

    const mean = numericData.reduce((a, b) => a + b, 0) / numericData.length;
    const std = Math.sqrt(numericData.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / numericData.length);
    
    return {
        mean: mean.toFixed(2),
        std: std.toFixed(2),
    };
};

const DEMOGRAPHIC_QUESTIONS = {
    "Your Role and Experience": {
        q1: "Role Level",
        q2: "Primary Functional Area",
        q3: "Involvement in Financial Decision-Making",
        q4: "Years of Experience (Corporate Financial Decisions)",
        q5: "Years Relying on Advisory Services",
    },
    "Organizational Profile": {
        q1: "Primary Industry",
        q2: "Annual Revenue",
        q3: "Number of Employees",
        q4: "Ownership Structure",
        q5: "Appetite for Financial Risk",
        q6: "Formal Investment Policy",
    }
};

const LIKERT_QUESTIONS = {
    "Digital Literacy": {
        q1: "Confident finding reliable info",
        q2: "Confident evaluating quality",
        q3: "Confident using online platforms",
        q4: "Confident comparing reports",
        q5: "Confident finding specialized data",
    },
    "Advisory Credibility": {
        q1: "Honest",
        q2: "Trustworthy",
        q3: "Sincere",
        q4: "Competent",
        q5: "Knowledgeable",
        q6: "Expert",
        q7: "Cares about best interests",
        q8: "Has welfare at heart",
        q9: "Is concerned about us",
    },
     "Psychological Distance": {
        q1: "Distant in time",
        q2: "Socially distant",
        q3: "Geographically distant",
        q4: "Unlikely to occur",
    },
    "Linguistic Abstractness": {
        q1: "Abstract and high-level",
        q2: "General descriptions, not specific steps",
        q3: "Difficulty forming mental picture",
        q4: "Focused on broad principles",
    },
};


export default function DescriptiveStats({ sessions }: DescriptiveStatsProps) {
    const stats = useMemo(() => {
        if (!sessions) return {};

        const allStats: Record<string, any> = {};

        // Demographic Frequencies
        const roleAndExp = sessions.map(s => s.initialAssessments?.roleAndExperience).filter(Boolean);
        const orgProfile = sessions.map(s => s.initialAssessments?.organizationalProfile).filter(Boolean);

        allStats['roleAndExperience'] = {
            q1: calculateFrequency(roleAndExp.map(r => r!.q1)),
            q2: calculateFrequency(roleAndExp.map(r => r!.q2)),
            q3: calculateFrequency(roleAndExp.map(r => r!.q3)),
            q4: calculateFrequency(roleAndExp.map(r => r!.q4)),
            q5: calculateFrequency(roleAndExp.map(r => r!.q5)),
        };

        allStats['organizationalProfile'] = {
            q1: calculateFrequency(orgProfile.map(o => o!.q1)),
            q2: calculateFrequency(orgProfile.map(o => o!.q2)),
            q3: calculateFrequency(orgProfile.map(o => o!.q3)),
            q4: calculateFrequency(orgProfile.map(o => o!.q4)),
            q5: calculateFrequency(orgProfile.map(o => o!.q5)),
            q6: calculateFrequency(orgProfile.map(o => o!.q6)),
        };

        // Likert Means & SDs
        const digitalLiteracy = sessions.map(s => s.controls?.digitalLiteracy).filter(Boolean);
        const advisoryCredibility = sessions.map(s => s.mediators?.advisoryCredibility).filter(Boolean);
        const psychologicalDistance = sessions.map(s => s.mediators?.psychologicalDistance).filter(Boolean);
        const linguisticAbstractness = sessions.map(s => s.mediators?.linguisticAbstractness).filter(Boolean);
        
        allStats['digitalLiteracy'] = {
            q1: calculateMeanStd(digitalLiteracy.map(d => d!.q1)),
            q2: calculateMeanStd(digitalLiteracy.map(d => d!.q2)),
            q3: calculateMeanStd(digitalLiteracy.map(d => d!.q3)),
            q4: calculateMeanStd(digitalLiteracy.map(d => d!.q4)),
            q5: calculateMeanStd(digitalLiteracy.map(d => d!.q5)),
        };

        allStats['advisoryCredibility'] = {
            q1: calculateMeanStd(advisoryCredibility.map(d => d!.q1)),
            q2: calculateMeanStd(advisoryCredibility.map(d => d!.q2)),
            q3: calculateMeanStd(advisoryCredibility.map(d => d!.q3)),
            q4: calculateMeanStd(advisoryCredibility.map(d => d!.q4)),
            q5: calculateMeanStd(advisoryCredibility.map(d => d!.q5)),
            q6: calculateMeanStd(advisoryCredibility.map(d => d!.q6)),
            q7: calculateMeanStd(advisoryCredibility.map(d => d!.q7)),
            q8: calculateMeanStd(advisoryCredibility.map(d => d!.q8)),
            q9: calculateMeanStd(advisoryCredibility.map(d => d!.q9)),
        };

        allStats['psychologicalDistance'] = {
            q1: calculateMeanStd(psychologicalDistance.map(d => d!.q1)),
            q2: calculateMeanStd(psychologicalDistance.map(d => d!.q2)),
            q3: calculateMeanStd(psychologicalDistance.map(d => d!.q3)),
            q4: calculateMeanStd(psychologicalDistance.map(d => d!.q4)),
        };

         allStats['linguisticAbstractness'] = {
            q1: calculateMeanStd(linguisticAbstractness.map(d => d!.q1)),
            q2: calculateMeanStd(linguisticAbstractness.map(d => d!.q2)),
            q3: calculateMeanStd(linguisticAbstractness.map(d => d!.q3)),
            q4: calculateMeanStd(linguisticAbstractness.map(d => d!.q4)),
        };

        return allStats;
    }, [sessions]);


    const renderFrequencyTable = (title: string, questions: Record<string, string>, data: Record<string, any>) => (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                {Object.entries(questions).map(([key, label]) => (
                    <div key={key} className="mb-6">
                        <h4 className="font-semibold mb-2">{label}</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Response</TableHead>
                                    <TableHead className="text-right">Frequency (n)</TableHead>
                                    <TableHead className="text-right">Percentage (%)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(data[key] as Record<string, { count: number; percentage: string }>).map(([response, values]) => (
                                    <TableRow key={response}>
                                        <TableCell>{response}</TableCell>
                                        <TableCell className="text-right">{values.count}</TableCell>
                                        <TableCell className="text-right">{values.percentage}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
            </CardContent>
        </Card>
    );

    const renderMeanStdTable = (title: string, questions: Record<string, string>, data: Record<string, any>) => (
        <Card>
            <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Mean</TableHead>
                            <TableHead className="text-right">Std. Dev.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(questions).map(([key, label]) => (
                            <TableRow key={key}>
                                <TableCell>{label}</TableCell>
                                <TableCell className="text-right">{data[key].mean}</TableCell>
                                <TableCell className="text-right">{data[key].std}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );

    if (!sessions || Object.keys(stats).length === 0) return null;

    return (
        <div className="space-y-8">
            {renderFrequencyTable("Demographics: Role & Experience", DEMOGRAPHIC_QUESTIONS["Your Role and Experience"], stats.roleAndExperience)}
            {renderFrequencyTable("Demographics: Organizational Profile", DEMOGRAPHIC_QUESTIONS["Organizational Profile"], stats.organizationalProfile)}
            {renderMeanStdTable("Digital Literacy", LIKERT_QUESTIONS["Digital Literacy"], stats.digitalLiteracy)}
            {renderMeanStdTable("Advisory Credibility", LIKERT_QUESTIONS["Advisory Credibility"], stats.advisoryCredibility)}
            {renderMeanStdTable("Psychological Distance", LIKERT_QUESTIONS["Psychological Distance"], stats.psychologicalDistance)}
            {renderMeanStdTable("Perceived Linguistic Abstractness", LIKERT_QUESTIONS["Linguistic Abstractness"], stats.linguisticAbstractness)}
        </div>
    );
}
