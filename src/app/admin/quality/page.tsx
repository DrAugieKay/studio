
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, BarChartHorizontal } from 'lucide-react';
import type { ParticipantSession } from '@/lib/types';

// Mock data representing flagged sessions
const initialMockFlaggedSessions: (Omit<ParticipantSession, 'startTime' | 'endTime'> & { flags: string[] })[] = [
  {
    id: 'SESS_G8H9I0',
    status: 'Abandoned',
    condition: { advisorySource: 'ai', linguisticFrame: 'concrete', scenario: 'techtrend' },
    flags: ['flag_viewtime'],
  },
  {
    id: 'SESS_A1B2C3',
    status: 'Completed',
    condition: { advisorySource: 'human', linguisticFrame: 'abstract', scenario: 'xyz' },
    flags: ['flag_comprehension', 'flag_straightline'],
  },
  {
    id: 'SESS_X4Y5Z6',
    status: 'Completed',
    condition: { advisorySource: 'ai', linguisticFrame: 'abstract', scenario: 'xyz' },
    flags: ['flag_straightline'],
  },
];

type FlaggedSession = ParticipantSession & { flags: string[] };

const getClientSideFlaggedSessions = (): FlaggedSession[] => [
    {
        ...initialMockFlaggedSessions[0],
        startTime: new Date('2024-07-28T09:45:00Z'),
        endTime: new Date('2024-07-28T09:51:23Z'),
    },
    {
        ...initialMockFlaggedSessions[1],
        startTime: new Date('2024-07-29T11:00:00Z'),
        endTime: new Date('2024-07-29T11:22:15Z'),
    },
    {
        ...initialMockFlaggedSessions[2],
        startTime: new Date('2024-07-29T14:10:00Z'),
        endTime: new Date('2024-07-29T14:30:05Z'),
    },
];

const flagDetails: Record<string, { label: string; Icon: React.ElementType, className: string }> = {
    'flag_comprehension': { label: 'Comprehension Failure', Icon: AlertCircle, className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
    'flag_viewtime': { label: 'Low Exposure Time', Icon: Clock, className: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
    'flag_straightline': { label: 'Straight-Lining', Icon: BarChartHorizontal, className: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
};

export default function DataQualityPage() {
    const [flaggedSessions, setFlaggedSessions] = useState<FlaggedSession[]>([]);

    useEffect(() => {
        // Set sessions on the client side to avoid hydration mismatch
        setFlaggedSessions(getClientSideFlaggedSessions());
    }, []);

    const flagCounts = flaggedSessions.reduce((acc, session) => {
        session.flags.forEach(flag => {
            acc[flag] = (acc[flag] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Data Quality & Flagging</h1>
                    <p className="text-muted-foreground mt-1">Review sessions flagged for potential data quality issues.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {Object.entries(flagDetails).map(([key, { label, Icon }]) => (
                    <Card key={key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{label}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{flagCounts[key] || 0}</div>
                            <p className="text-xs text-muted-foreground">Sessions flagged</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Flagged Sessions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Flagged Sessions ({flaggedSessions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Session ID</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Flags Triggered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {flaggedSessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell className="font-medium">{session.id}</TableCell>
                                        <TableCell>{session.startTime.toLocaleString()}</TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                {session.flags.map(flag => {
                                                    const detail = flagDetails[flag];
                                                    return (
                                                        <Badge key={flag} variant="outline" className={detail.className}>
                                                            <detail.Icon className="h-3 w-3 mr-1.5" />
                                                            {detail.label}
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     {flaggedSessions.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            No sessions have been flagged for data quality issues.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
