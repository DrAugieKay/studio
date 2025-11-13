
'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SessionData } from '@/lib/types';
import { Eye, Loader2, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { useState, useMemo } from 'react';

const EXPERIMENT_ID = 'exp_001';

type SortKey = 'startTime' | 'status';

export default function SessionTable() {
    const firestore = useFirestore();
    const [sortKey, setSortKey] = useState<SortKey>('startTime');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const participantsCollectionQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`));
    }, [firestore]);

    const { data: sessions, isLoading } = useCollection<SessionData>(participantsCollectionQuery);
    
    const sortedSessions = useMemo(() => {
        if (!sessions) return [];
        return [...sessions].sort((a, b) => {
            let valA, valB;

            switch (sortKey) {
                case 'startTime':
                    valA = new Date(a.startTime).getTime();
                    valB = new Date(b.startTime).getTime();
                    break;
                case 'status':
                    valA = a.status;
                    valB = b.status;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [sessions, sortKey, sortDirection]);
    
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const formatCondition = (condition: SessionData['condition']) => {
        if (!condition) return 'N/A';
        return `${condition.advisorySource.toUpperCase()} / ${condition.linguisticFrame.toUpperCase()} / ${condition.scenario.toUpperCase()}`;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading sessions...</p>
            </div>
        );
    }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session ID</TableHead>
            <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </TableHead>
            <TableHead>
                 <Button variant="ghost" onClick={() => handleSort('startTime')}>
                    Start Time
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSessions && sortedSessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="font-medium">{session.id}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    session.status === 'Completed'
                      ? 'default'
                      : session.status === 'In Progress'
                      ? 'secondary'
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
              <TableCell>{new Date(session.startTime).toLocaleString()}</TableCell>
              <TableCell>{session.endTime ? new Date(session.endTime).toLocaleString() : 'N/A'}</TableCell>
              <TableCell>{formatCondition(session.condition)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/session/${session.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View session</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
           {(!sortedSessions || sortedSessions.length === 0) && (
              <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                      No participant sessions found.
                  </TableCell>
              </TableRow>
           )}
        </TableBody>
      </Table>
    </div>
  );
}
