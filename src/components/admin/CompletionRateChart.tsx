
'use client';

import * as React from 'react';
import { Pie, PieChart, Label, Cell } from 'recharts';
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
    color: 'hsl(142.1 76.2% 36.3%)', // Green
  },
  Abandoned: {
    label: 'Abandoned',
    color: 'hsl(0 62.8% 30.6%)', // Red
  },
  'In Progress': {
    label: 'In Progress',
    color: 'hsl(215 39% 30%)', // Blue
  },
};

type CompletionRateChartProps = {
    sessions: SessionData[] | null;
};

// Helper to render a custom label with the percentage
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) {
        return null;
    }

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
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
            fill: config.color,
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
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
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
