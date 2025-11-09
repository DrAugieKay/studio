
'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, BarChartHorizontal, Loader2 } from 'lucide-react';
import { getQualityFlags } from '@/lib/quality-flags';
import type { SessionData } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

const EXPERIMENT_ID = 'exp_001';

type FlaggedSession = SessionData & { id: string; flags: string[] };

const flagDetails: Record<string, { label: string; Icon: React.ElementType, className: string }> = {
    'flag_comprehension': { label: 'Comprehension Failure', Icon: AlertCircle, className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30' },
    'flag_viewtime': { label: 'Low Exposure Time', Icon: Clock, className: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
    'flag_straightline': { label: 'Straight-Lining', Icon: BarChartHorizontal, className: 'bg-purple-500/20 text-purple-700 border-purple-500/30' },
};

export default function DataQualityPage() {
    const firestore = useFirestore();

    const participantsCollectionQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`));
    }, [firestore]);

    const { data: sessions, isLoading } = useCollection<SessionData>(participantsCollectionQuery);

    const flaggedSessions = useMemo((): FlaggedSession[] => {
        if (!sessions) return [];
        return sessions
            .map(session => ({ ...session, flags: getQualityFlags(session) }))
            .filter(session => session.flags.length > 0);
    }, [sessions]);


    const flagCounts = useMemo(() => {
        return flaggedSessions.reduce((acc, session) => {
            session.flags.forEach(flag => {
                acc[flag] = (acc[flag] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);
    }, [flaggedSessions]);
    
    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading quality data...</p>
            </div>
        );
    }

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
                                        <TableCell>{new Date(session.startTime).toLocaleString()}</TableCell>
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
                                                    if (!detail) return null;
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
