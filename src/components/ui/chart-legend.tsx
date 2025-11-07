
'use client';

import * as React from 'react';
import { ContentType, Formatter, Legend as RechartsLegend, LegendProps } from 'recharts';
import { Balancer } from 'react-wrap-balancer';

import { cn } from '@/lib/utils';
import { useChart } from '@/components/ui/chart';

// #----------------- Types ----------------- #
export type ChartLegendContentProps = React.ComponentProps<'div'> &
  Pick<LegendProps, 'payload' | 'verticalAlign'> & {
    hideIcon?: boolean;
    name?: string;
  };

// #----------------- Components ----------------- #
const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsLegend>,
  React.ComponentProps<typeof RechartsLegend> & {
    hide?: boolean;
  }
>(({ className, hide = false, ...props }, ref) => {
  const { config } = useChart();

  const payload = props.payload?.filter((item) => {
    const key = item.dataKey?.toString() || item.value;
    if (key && config[key]?.hide) {
      return false;
    }
    return true;
  });

  return hide ? null : (
    <RechartsLegend
      ref={ref}
      className={cn(
        '[&_.recharts-legend-item]:flex [&_.recharts-legend-item]:items-center [&_.recharts-legend-item]:gap-2 [&_.recharts-legend-icon]:size-3',
        className
      )}
      payload={payload}
      {...props}
    />
  );
});
ChartLegend.displayName = 'ChartLegend';

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = 'bottom',
      name,
    },
    ref
  ) => {
    const { config } = useChart();

    if (!payload || !payload.length) {
      return null;
    }

    const finalPayload = payload.map((item) => {
      const key = `${item.value}`;
      if (key in config) {
        return {
          ...item,
          value: config[key]?.label || item.value,
        };
      }
      return item;
    });

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4',
          verticalAlign === 'top' ? 'mb-4' : 'mt-4',
          className
        )}
      >
        {finalPayload.map((item) => {
          const key = name || String(item.value);
          const itemConfig = config[key as keyof typeof config];
          const color = item.color;
          const Icon = itemConfig?.icon;

          return (
            <div
              key={item.value}
              className={cn(
                'flex items-center gap-1.5 [&>svg]:size-3 [&>svg]:text-muted-foreground'
              )}
            >
              {hideIcon ? null : Icon ? (
                <Icon />
              ) : (
                <div
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: color,
                  }}
                />
              )}
              <Balancer>{item.value}</Balancer>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = 'ChartLegendContent';

export { ChartLegend, ChartLegendContent };
