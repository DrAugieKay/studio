
'use client';

import * as React from 'react';
import { Pie, PieChart, Label } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { SessionData } from '@/lib/types';

const chartConfig = {
  sessions: {
    label: 'Sessions',
  },
  Completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-2))',
  },
  Abandoned: {
    label: 'Abandoned',
    color: 'hsl(var(--chart-5))',
  },
  'In Progress': {
    label: 'In Progress',
    color: 'hsl(var(--chart-3))',
  },
};

type CompletionRateChartProps = {
    sessions: SessionData[] | null;
};

export default function CompletionRateChart({ sessions }: CompletionRateChartProps) {
  const chartData = React.useMemo(() => {
    if (!sessions) return [];
    
    const statusCounts = sessions.reduce((acc, session) => {
        acc[session.status] = (acc[session.status] || 0) + 1;
        return acc;
    }, {} as Record<SessionData['status'], number>);

    return Object.entries(chartConfig)
        .filter(([key]) => key !== 'sessions')
        .map(([status, config]) => ({
            status,
            sessions: statusCounts[status as SessionData['status']] || 0,
            fill: `var(--color-${status.replace(' ', '')})`,
        }));
  }, [sessions]);

  const totalSessions = React.useMemo(() => {
    return sessions?.length || 0;
  }, [sessions]);

  return (
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="sessions"
            nameKey="status"
            innerRadius={60}
            strokeWidth={5}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalSessions.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Sessions
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
  );
}
