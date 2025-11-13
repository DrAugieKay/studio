
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
        
        const getChoiceCategory = (choice: string | null): string => {
            if (!choice) return 'No Decision';
            if (choice.startsWith('Option A')) return 'Option A';
            if (choice.startsWith('Option B')) return 'Option B';
            if (choice.startsWith('Option C')) return 'Option C';
            if (choice.startsWith('Option D')) return 'No Decision';
            return 'No Decision';
        };

        const choiceCounts = sessions.reduce((acc, session) => {
            const category = getChoiceCategory(session.objectiveChoice);
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const allCategories = [
            'Option A',
            'Option B',
            'Option C',
            'No Decision'
        ];

        return allCategories.map(category => ({
            choice: category,
            count: choiceCounts[category] || 0,
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
