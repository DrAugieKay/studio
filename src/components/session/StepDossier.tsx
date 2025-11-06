'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SessionData } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type StepProps = {
  updateSessionData: (data: Partial<SessionData>) => void;
};

export default function StepDossier({ updateSessionData }: StepProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dossierImage = PlaceHolderImages.find(img => img.id === 'dossier-1');

  useEffect(() => {
    const startTime = Date.now();
    const scrollableContent = scrollRef.current;
    let scrollCount = 0;

    const handleScroll = () => {
      scrollCount++;
    };

    scrollableContent?.addEventListener('scroll', handleScroll);

    return () => {
      scrollableContent?.removeEventListener('scroll', handleScroll);
      const viewTime = Date.now() - startTime;
      console.log(`Dossier view time: ${viewTime}ms, Scrolls: ${scrollCount}`);
      updateSessionData({ dossierViewTime: viewTime, advisoryScrollCount: scrollCount });
    };
  }, [updateSessionData]);

  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Investment Dossier</CardTitle>
        <CardDescription>
          Please review the following information about a potential investment opportunity.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <ScrollArea className="h-[60vh] w-full" ref={scrollRef}>
          <div className="p-1 pr-4 space-y-6">
            <h3 className="font-semibold text-lg">Project Overview: "Innovate Inc."</h3>
            <p className="text-muted-foreground">
              Innovate Inc. is a technology startup developing a next-generation AI-powered platform for data analysis. The company aims to disrupt the business intelligence market with a more intuitive and powerful solution.
            </p>
            {dossierImage && (
              <div className="relative w-full h-96 rounded-lg overflow-hidden my-4">
                 <Image
                    src={dossierImage.imageUrl}
                    alt={dossierImage.description}
                    data-ai-hint={dossierImage.imageHint}
                    fill
                    className="object-cover"
                />
              </div>
            )}
            <h3 className="font-semibold text-lg">Financial Projections</h3>
            <p className="text-muted-foreground">
              The company projects a 5x growth in revenue over the next three years, driven by strong market demand and a clear go-to-market strategy. Initial seed funding has been secured, and the company is now seeking Series A funding to scale operations. The chart above illustrates projected revenue against market size.
            </p>
            <h3 className="font-semibold text-lg">Team and Leadership</h3>
            <p className="text-muted-foreground">
              Innovate Inc. is led by a team of experienced entrepreneurs and engineers from top technology companies. The CEO, Jane Doe, has a proven track record of successful exits. The CTO, John Smith, is a leading expert in machine learning and data science.
            </p>
             <h3 className="font-semibold text-lg">Market Analysis</h3>
            <p className="text-muted-foreground">
              The business intelligence market is valued at over $20 billion and is expected to grow at a CAGR of 8% over the next five years. Innovate Inc. is well-positioned to capture a significant share of this market with its innovative technology and strong leadership team. The main competitors are established players, but their solutions are often seen as complex and overpriced.
            </p>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
