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
        <div className="text-muted-foreground max-w-3xl mx-auto space-y-4 text-left">
            <p>
                The purpose of this research is to understand how the source of advice (AI vs. Human) and its credibility influence financial decision-making. The advisor profiles were constructed for this experiment.
            </p>
            <p>
                There is no objectively "correct" choice in the real world, regardless of the fact that the board's priority in the scenario presented in this study had a corresponding objective. Your participation helps us understand the psychology of decision-making in business.
            </p>
            <p>
                If you have questions about the study, please contact the research team on the email below: <a href="mailto:5103231208@stmail.ujs.edu.cn" className="text-primary underline">5103231208@stmail.ujs.edu.cn</a>
            </p>
             <p className="font-semibold text-center pt-4">
                This concludes the study. Thank you for your valuable contribution.
            </p>
        </div>
        <Button asChild size="lg" className="mt-8">
            <Link href="/">
                Complete and Return to Home
            </Link>
        </Button>
      </div>
    </div>
  );
}
