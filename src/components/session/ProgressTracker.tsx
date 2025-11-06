import { Progress } from '@/components/ui/progress';

type ProgressTrackerProps = {
  current: number;
  total: number;
  stepNames: string[];
};

export default function ProgressTracker({ current, total, stepNames }: ProgressTrackerProps) {
  const progressPercentage = (current / (total-1)) * 100;

  return (
    <div className="w-full px-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-primary">
          Step {current + 1} of {total}: {stepNames[current]}
        </span>
        <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2 [&>div]:bg-accent" />
    </div>
  );
}
