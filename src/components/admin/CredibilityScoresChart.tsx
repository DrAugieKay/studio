
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { SessionData } from '@/lib/types';
import { getComposites } from '@/lib/composites';

const chartConfig = {
  honesty: {
    label: 'Honesty',
    color: 'hsl(var(--chart-1))',
  },
  trustworthiness: {
    label: 'Trustworthiness',
    color: 'hsl(var(--chart-2))',
  },
  expertise: {
    label: 'Expertise',
    color: 'hsl(var(--chart-3))',
  },
};

type CredibilityScoresChartProps = {
    sessions: SessionData[] | null;
};

export default function CredibilityScoresChart({ sessions }: CredibilityScoresChartProps) {
    const chartData = useMemo(() => {
        if (!sessions) return [];

        const totals = {
            human: { cr_trust: 0, cr_comp: 0, cr_good: 0, count: 0 },
            ai: { cr_trust: 0, cr_comp: 0, cr_good: 0, count: 0 },
        };

        sessions.forEach(session => {
            if (!session.condition) return;
            const source = session.condition.advisorySource;
            const composites = getComposites(session);

            if (composites.cr_trust !== null) {
                totals[source].cr_trust += composites.cr_trust;
            }
            if (composites.cr_comp !== null) {
                totals[source].cr_comp += composites.cr_comp;
            }
            if (composites.cr_good !== null) {
                totals[source].cr_good += composites.cr_good;
            }
            totals[source].count++;
        });

        return [
            {
                source: 'AI',
                honesty: totals.ai.count > 0 ? totals.ai.cr_trust / totals.ai.count : 0,
                trustworthiness: totals.ai.count > 0 ? totals.ai.cr_good / totals.ai.count : 0,
                expertise: totals.ai.count > 0 ? totals.ai.cr_comp / totals.ai.count : 0,
            },
            {
                source: 'Human',
                honesty: totals.human.count > 0 ? totals.human.cr_trust / totals.human.count : 0,
                trustworthiness: totals.human.count > 0 ? totals.human.cr_good / totals.human.count : 0,
                expertise: totals.human.count > 0 ? totals.human.cr_comp / totals.human.count : 0,
            },
        ];

    }, [sessions]);

  return (
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <BarChart 
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid vertical={false} />
          <YAxis />
          <XAxis
            dataKey="source"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="honesty" fill="var(--color-honesty)" radius={4} />
          <Bar dataKey="trustworthiness" fill="var(--color-trustworthiness)" radius={4} />
          <Bar dataKey="expertise" fill="var(--color-expertise)" radius={4} />
        </BarChart>
      </ChartContainer>
  );
}
