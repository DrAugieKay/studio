
'use client';

import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SessionData } from '@/lib/types';
import AdvisoryMemo from './AdvisoryMemo';
import { FileSearch } from 'lucide-react';
import { useRef, useEffect } from 'react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

export default function StepAdvisory({ sessionData, updateSessionData }: StepProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const startTime = Date.now();
        const scrollableContent = scrollAreaRef.current;
        let scrollCount = 0;
    
        const handleScroll = () => {
          scrollCount++;
        };
    
        // Find the scrollable viewport within the ScrollArea component
        const viewport = scrollableContent?.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.addEventListener('scroll', handleScroll);
        }
        
        // This is the cleanup function that runs when the component unmounts
        return () => {
          if (viewport) {
            viewport.removeEventListener('scroll', handleScroll);
          }
          const viewTime = Date.now() - startTime;
          console.log(`Advisory view time: ${viewTime}ms, Scrolls: ${scrollCount}`);
          // Update the session data ONLY on unmount
          updateSessionData({ advisoryViewTime: viewTime, advisoryScrollCount: scrollCount });
        };
      // The empty dependency array ensures this effect runs only once on mount
      // and the cleanup function runs only on unmount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);


  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileSearch className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">Advisory Information</CardTitle>
        </div>
        <CardDescription>
          Please review the following advisory memo related to the investment. You may need to scroll to see the full content.
        </CardDescription>
      </CardHeader>
      <div className="pt-0">
        <ScrollArea className="h-[60vh] rounded-lg border" ref={scrollAreaRef}>
          <AdvisoryMemo sessionData={sessionData} />
        </ScrollArea>
      </div>
    </>
  );
}
