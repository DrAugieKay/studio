'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

const chartData = [
    { source: 'AI', honesty: 4.5, trustworthiness: 4.2, expertise: 4.8 },
    { source: 'Human', honesty: 5.8, trustworthiness: 6.1, expertise: 6.2 },
];

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

export default function CredibilityScoresChart() {
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
