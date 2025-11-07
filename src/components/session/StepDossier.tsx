
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SessionData } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

const scenarioContent = {
  techtrend: {
    title: 'Project Overview: "TechTrend Innovations"',
    description: "TechTrend Innovations is a technology startup developing a next-generation AI-powered platform for data analysis. The company aims to disrupt the business intelligence market with a more intuitive and powerful solution.",
    imageHint: "tech office",
    projections: "The company projects a 5x growth in revenue over the next three years, driven by strong market demand and a clear go-to-market strategy. Initial seed funding has been secured, and the company is now seeking Series A funding to scale operations.",
    team: "TechTrend is led by a team of experienced entrepreneurs and engineers from top technology companies. The CEO, Jane Doe, has a proven track record of successful exits. The CTO, John Smith, is a leading expert in machine learning and data science.",
    market: "The business intelligence market is valued at over $20 billion and is expected to grow at a CAGR of 8% over the next five years. TechTrend is well-positioned to capture a significant share of this market with its innovative technology and strong leadership team. The main competitors are established players, but their solutions are often seen as complex and overpriced."
  },
  xyz: {
    title: 'Project Overview: "XYZ Manufacturing"',
    description: "XYZ Manufacturing is an established industrial firm planning a major expansion into sustainable production lines. The project involves retrofitting existing facilities with green technology to meet growing ESG demands and reduce long-term operational costs.",
    imageHint: "modern factory",
    projections: "The company projects a 15% increase in production efficiency and a 30% reduction in carbon emissions within two years of project completion. The expansion is expected to open up new markets in environmentally-conscious sectors, with a projected revenue increase of 20% over five years.",
    team: "The project is overseen by a veteran management team with deep expertise in manufacturing and logistics. The Head of Operations, David Chen, has successfully managed three large-scale factory upgrades in his 20-year career with the company.",
    market: "The market for sustainable and ethically-sourced manufactured goods is expanding rapidly. While the initial capital outlay is significant, XYZ's move positions them as a leader in a growing niche, appealing to a new generation of B2B clients and government contracts that prioritize sustainability."
  }
};


export default function StepDossier({ sessionData, updateSessionData }: StepProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dossierImage = PlaceHolderImages.find(img => img.id === 'dossier-1');

  const content = scenarioContent[sessionData.condition?.scenario || 'techtrend'];

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
  }, []);

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
            <h3 className="font-semibold text-lg">{content.title}</h3>
            <p className="text-muted-foreground">
              {content.description}
            </p>
            {dossierImage && (
              <div className="relative w-full h-96 rounded-lg overflow-hidden my-4">
                 <Image
                    src={dossierImage.imageUrl}
                    alt={dossierImage.description}
                    data-ai-hint={content.imageHint}
                    fill
                    className="object-cover"
                />
              </div>
            )}
            <h3 className="font-semibold text-lg">Financial Projections</h3>
            <p className="text-muted-foreground">
              {content.projections}
            </p>
            <h3 className="font-semibold text-lg">Team and Leadership</h3>
            <p className="text-muted-foreground">
              {content.team}
            </p>
             <h3 className="font-semibold text-lg">Market Analysis</h3>
            <p className="text-muted-foreground">
              {content.market}
            </p>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
