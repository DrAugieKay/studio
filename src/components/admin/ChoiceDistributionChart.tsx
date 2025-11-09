
'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useMemo } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { SessionData } from '@/lib/types';

const chartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-1))',
  },
};

type ChoiceDistributionChartProps = {
    sessions: SessionData[] | null;
};

export default function ChoiceDistributionChart({ sessions }: ChoiceDistributionChartProps) {
    const chartData = useMemo(() => {
        if (!sessions) return [];
        
        const choiceCounts = sessions.reduce((acc, session) => {
            const choice = session.objectiveChoice || 'No Choice';
            acc[choice] = (acc[choice] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Ensure all possible choices are represented, even if count is 0
        const allChoices = [
            'Option A: Growth Equity Fund',
            'Option B: Balanced Mutual Fund',
            'Option C: Government Treasury Bond Portfolio',
            'Option D: I do not know / Prefer not to decide',
            'No Choice'
        ];

        return allChoices.map(choice => ({
            choice: choice.startsWith('Option D') ? 'No Decide' : choice.replace(/(:.*)/, ''),
            count: choiceCounts[choice] || 0,
        }));

    }, [sessions]);

  return (
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="choice"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
  );
}
