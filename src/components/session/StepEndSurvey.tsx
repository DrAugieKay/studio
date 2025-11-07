import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Ban } from 'lucide-react';

export default function StepEndSurvey() {
  return (
    <div className="text-center p-6 sm:p-8 md:p-12">
        <div className="mb-6 flex justify-center">
            <div className="bg-destructive/10 text-destructive p-4 rounded-full">
              <Ban className="w-12 h-12" />
            </div>
        </div>
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-3xl">Survey Ended</CardTitle>
        <CardDescription className="mt-2 text-lg">
          Thank you for your time.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pb-0">
        <p className="text-muted-foreground max-w-2xl mx-auto">
            Unfortunately, you do not meet the eligibility criteria for this study. Your participation has ended, and no data has been saved. We appreciate your interest.
        </p>
        <Button asChild size="lg" className="mt-8">
            <Link href="/">
                Return to Home
            </Link>
        </Button>
      </div>
    </div>
  );
}
