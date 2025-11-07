'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { status: 'Completed', sessions: 275, fill: 'var(--color-completed)' },
  { status: 'Abandoned', sessions: 50, fill: 'var(--color-abandoned)' },
  { status: 'In Progress', sessions: 25, fill: 'var(--color-inprogress)' },
];

const chartConfig = {
  sessions: {
    label: 'Sessions',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-2))',
  },
  abandoned: {
    label: 'Abandoned',
    color: 'hsl(var(--chart-5))',
  },
  inprogress: {
    label: 'In Progress',
    color: 'hsl(var(--chart-3))',
  },
};

export default function CompletionRateChart() {
  const totalSessions = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.sessions, 0);
  }, []);

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
