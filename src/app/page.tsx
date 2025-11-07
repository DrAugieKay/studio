import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FlaskConical, ArrowRight } from 'lucide-react';
import Header from '@/components/common/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-border/20 max-w-2xl w-full">
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/10 text-primary p-4 rounded-full">
              <FlaskConical className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-headline">
            Advisory Insights Platform
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            A robust platform for academic research, data collection, and analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/profile">
                Start New Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/admin">Admin Login</Link>
            </Button>
          </div>
        </div>
        <footer className="text-muted-foreground text-sm mt-12">
            <p>&copy; {new Date().getFullYear()} Advisory Insights Platform. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
