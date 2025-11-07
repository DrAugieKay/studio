
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
import type { ParticipantSession } from '@/lib/types';
import { Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const initialMockSessions: Omit<ParticipantSession, 'startTime' | 'endTime'>[] = [
  {
    id: 'SESS_A1B2C3',
    status: 'Completed',
    condition: { advisorySource: 'human', linguisticFrame: 'abstract', scenario: 'xyz' },
  },
  {
    id: 'SESS_G8H9I0',
    status: 'Abandoned',
    condition: { advisorySource: 'ai', linguisticFrame: 'concrete', scenario: 'techtrend' },
  },
   {
    id: 'SESS_X4Y5Z6',
    status: 'Completed',
    condition: { advisorySource: 'ai', linguisticFrame: 'abstract', scenario: 'xyz' },
  },
  {
    id: 'SESS_8A2B4C',
    status: 'Completed',
    condition: { advisorySource: 'ai', linguisticFrame: 'abstract', scenario: 'xyz' },
  },
  {
    id: 'SESS_D5E6F7',
    status: 'In Progress',
    condition: { advisorySource: 'human', linguisticFrame: 'concrete', scenario: 'techtrend' },
  },
];


const getClientSideSessions = (): ParticipantSession[] => [
    {
        ...initialMockSessions[0],
        startTime: new Date('2024-07-29T11:00:00Z'),
        endTime: new Date('2024-07-29T11:22:15Z'),
    },
     {
        ...initialMockSessions[1],
        startTime: new Date('2024-07-28T09:45:00Z'),
        endTime: new Date('2024-07-28T09:51:23Z'),
    },
    {
        ...initialMockSessions[2],
        startTime: new Date('2024-07-29T14:10:00Z'),
        endTime: new Date('2024-07-29T14:30:05Z'),
    },
    {
        ...initialMockSessions[3],
        startTime: new Date('2024-07-28T10:00:00Z'),
        endTime: new Date('2024-07-28T10:18:32Z'),
    },
    {
        ...initialMockSessions[4],
        startTime: new Date('2024-07-28T11:30:15Z'),
        endTime: null,
    }
];


export default function SessionTable() {
    const [sessions, setSessions] = useState<ParticipantSession[]>([]);

    useEffect(() => {
        // Set sessions on the client side to avoid hydration mismatch
        setSessions(getClientSideSessions());
    }, []);

    const formatCondition = (condition: ParticipantSession['condition']) => {
        if (!condition) return 'N/A';
        return `${condition.advisorySource.toUpperCase()} / ${condition.linguisticFrame.toUpperCase()} / ${condition.scenario.toUpperCase()}`;
    }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
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
                  className={session.status === 'Completed' ? 'bg-green-600/20 text-green-700 border-green-600/30' : session.status === 'In Progress' ? 'bg-blue-600/20 text-blue-700 border-blue-600/30' : 'bg-red-600/20 text-red-700 border-red-600/30'}
                >
                  {session.status}
                </Badge>
              </TableCell>
              <TableCell>{session.startTime.toLocaleString()}</TableCell>
              <TableCell>{session.endTime?.toLocaleString() ?? 'N/A'}</TableCell>
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
        </TableBody>
      </Table>
    </div>
  );
}

