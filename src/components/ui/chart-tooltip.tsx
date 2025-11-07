
'use client';

import * as React from 'react';
import { TooltipProps } from 'recharts';
import { Balancer } from 'react-wrap-balancer';

import { cn } from '@/lib/utils';
import { useChart } from '@/components/ui/chart';

// #----------------- Types ----------------- #
export type ChartTooltipContentProps = React.ComponentProps<'div'> &
  React.ComponentProps<typeof ChartTooltipFrame> &
  Pick<TooltipProps<any, any>, 'payload' | 'label'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
  };

// #----------------- Components ----------------- #
export const ChartTooltipFrame = ({
    className,
    ...props
  }: React.ComponentProps<'div'>) => {
    return (
      <div
        className={cn(
          'relative z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    );
  };
  ChartTooltipFrame.displayName = 'ChartTooltipFrame';
  

const ChartTooltip = ChartTooltipFrame;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelKey,
      nameKey,
      payload,
    },
    ref
  ) => {
    const { config } = useChart();

    const finalPayload = payload?.map((item) => {
      const key = `${item.name}`;
      const itemConfig = config[key as keyof typeof config];

      return {
        ...item,
        name: itemConfig?.label || item.name,
        color: itemConfig?.color || item.color,
      };
    });

    const finalLabel = labelKey ? finalPayload?.[0]?.payload?.[labelKey] : label;

    if (!finalPayload || !finalPayload.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-32 items-start gap-1.5',
          className
        )}
      >
        {!hideLabel && finalLabel ? (
          <div className="font-medium">
            <Balancer>{finalLabel}</Balancer>
          </div>
        ) : null}
        <div className="grid gap-1.5">
          {finalPayload.map((item, i) => {
            const key = nameKey ? item.payload[nameKey] : item.name;
            const color = item.color;
            const value = item.value;

            return (
              <div
                key={item.dataKey}
                className={cn('flex items-center justify-between gap-x-4')}
              >
                <div className="flex items-center gap-2">
                  {!hideIndicator && (
                    <div
                      className={cn('size-2.5 shrink-0 rounded-[2px]', {
                        'rounded-full': indicator === 'dot',
                        'w-0 border-[1.5px] border-dashed': indicator === 'dashed',
                        'w-2.5': indicator === 'line',
                      })}
                      style={{
                        background: color,
                        borderColor: color,
                      }}
                    />
                  )}
                  <div className="flex-1 whitespace-nowrap">{key}</div>
                </div>
                <div className="whitespace-nowrap font-medium tabular-nums">
                  {typeof value === 'number'
                    ? value.toLocaleString()
                    : value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

export { ChartTooltip, ChartTooltipContent };
