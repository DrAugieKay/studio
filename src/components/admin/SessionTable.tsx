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

const initialMockSessions: Omit<ParticipantSession, 'startTime' | 'endTime'>[] = [
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
  {
    id: 'SESS_G8H9I0',
    status: 'Abandoned',
    condition: { advisorySource: 'ai', linguisticFrame: 'concrete', scenario: 'techtrend' },
  },
  {
    id: 'SESS_J1K2L3',
    status: 'Completed',
    condition: { advisorySource: 'human', linguisticFrame: 'abstract', scenario: 'xyz' },
  },
  {
    id: 'SESS_M4N5P6',
    status: 'Completed',
    condition: { advisorySource: 'ai', linguisticFrame: 'abstract', scenario: 'techtrend' },
  },
];


const getClientSideSessions = (): ParticipantSession[] => [
    {
        ...initialMockSessions[0],
        startTime: new Date('2024-07-28T10:00:00Z'),
        endTime: new Date('2024-07-28T10:18:32Z'),
    },
    {
        ...initialMockSessions[1],
        startTime: new Date('2024-07-28T11:30:15Z'),
        endTime: null,
    },
    {
        ...initialMockSessions[2],
        startTime: new Date('2024-07-28T09:45:00Z'),
        endTime: new Date('2024-07-28T09:51:23Z'),
    },
    {
        ...initialMockSessions[3],
        startTime: new Date('2024-07-27T14:00:00Z'),
        endTime: new Date('2024-07-27T14:21:05Z'),
    },
    {
        ...initialMockSessions[4],
        startTime: new Date('2024-07-27T16:20:11Z'),
        endTime: new Date('2024-07-27T16:38:49Z'),
    },
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
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View session</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
