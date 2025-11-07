
'use client';

import { useEffect, useRef } from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SessionData } from '@/lib/types';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

const scenarioContent = {
  techtrend: {
    briefing: "You are the financial decision-maker for TechTrend Innovations, a technology startup developing AI-powered logistics solutions. The firm recently secured a Series A funding round, generating $500,000 in surplus funds. With annual revenue of $2 million, TechTrend faces high market volatility due to rapid technological shifts. Your task is to allocate these funds across three investment options to manage risk. The board has mandated a conservative investment strategy prioritizing financial stability to support R&D and a major product launch in 5 years. Review the Firm Dossier:",
    sectorAndSize: "Early‑stage technology firm; revenue ≈ $2M.",
    priority: "Extend runway to support R&D and product launch.",
    financials: "Surplus = $500,000; liquidity horizon = 18—24 months.",
  },
  xyz: {
    briefing: "You are part of the financial decision-makers for XYZ Manufacturing, a mid-sized firm specializing in industrial equipment. Recently, XYZ expanded into new markets, boosting annual revenue to $50 million but increasing exposure to economic fluctuations. With $1,000,000 in surplus funds, your task is to allocate these funds across three investment options. The board has mandated a conservative investment strategy prioritizing financial stability to support operations and future growth. Review the Firm Dossier:",
    sectorAndSize: "Mid‑sized industrial manufacturer; revenue ≈ $50M.",
    priority: "Preserve capital and maintain liquidity for planned IoT investment.",
    financials: "Surplus = $1,000,000; liquidity target = 24 months",
  }
};


export default function StepDossier({ sessionData, updateSessionData }: StepProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const content = scenarioContent[sessionData.condition?.scenario || 'techtrend'];

  useEffect(() => {
    const startTime = Date.now();
    const scrollableContent = scrollRef.current?.querySelector('div');
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
        <CardTitle className="font-headline text-2xl">Scenario Briefing</CardTitle>
        <CardDescription>
          {content.briefing}
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <ScrollArea className="h-[40vh] w-full" ref={scrollRef}>
          <div className="p-1 pr-4 space-y-6">
            <div className="border rounded-lg p-4 bg-secondary/30">
              <h3 className="font-semibold text-lg mb-4">Firm Dossier</h3>
              <ul className="space-y-3 text-muted-foreground list-disc pl-5">
                <li><span className="font-medium text-foreground">Sector & Size:</span> {content.sectorAndSize}</li>
                <li><span className="font-medium text-foreground">Strategic Priority:</span> {content.priority}</li>
                <li><span className="font-medium text-foreground">Financial Context:</span> {content.financials}</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
