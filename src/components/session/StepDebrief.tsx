import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PartyPopper } from 'lucide-react';

export default function StepDebrief() {
  return (
    <div className="text-center p-6 sm:p-8 md:p-12">
        <div className="mb-6 flex justify-center">
            <div className="bg-accent/10 text-accent p-4 rounded-full">
              <PartyPopper className="w-12 h-12" />
            </div>
        </div>
      <CardHeader className="p-0">
        <CardTitle className="font-headline text-3xl">Thank You!</CardTitle>
        <CardDescription className="mt-2 text-lg">
          You have completed the session.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pb-0">
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Thank you for your participation. Your responses have been recorded. The purpose of this study is to understand how different types of advice influence investment decisions. Your contribution is valuable to our research. If you have any questions, please contact the research team.
        </p>
        <Button asChild size="lg" className="mt-8">
            <Link href="/">
                Complete and Return to Home
            </Link>
        </Button>
      </div>
    </div>
  );
}
