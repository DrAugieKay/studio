
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="absolute top-0 right-0 p-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Admin Portal</Link>
        </Button>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-card/50 p-6 sm:p-8 rounded-t-xl">
            <div className="mb-6 flex justify-center">
              <div className="text-primary">
                <BrainCircuit className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-headline">
              Welcome to FAConLDQ
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              An experimental platform for financial decision-making analysis.
            </p>
          </div>
          
          <Separator />

          <div className="bg-card/50 p-6 sm:p-8 rounded-b-xl">
              <p className="text-base sm:text-lg text-muted-foreground mb-6">
                You are about to participate in a research study investigating financial decision-making with AI and human advisors. Your contribution is valuable.
              </p>
              <Button asChild size="lg">
                <Link href="/profile">
                  Click to Start
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
          </div>
        </div>
        
      </div>
       <footer className="text-muted-foreground text-sm pb-8 text-center px-4">
          <p>&copy; 2025 FAConLDQ Research Platform. All rights reserved.</p>
        </footer>
    </div>
  );
}
