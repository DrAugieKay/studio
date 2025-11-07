
'use client';

import { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SessionData } from '@/lib/types';
import { Briefcase, Target, Landmark, FileText } from 'lucide-react';

type StepProps = {
  sessionData: Partial<SessionData>;
  updateSessionData: (data: Partial<SessionData>) => void;
};

const scenarioContent = {
  techtrend: {
    briefing: "You are the financial decision-maker for TechTrend Innovations, a technology startup developing AI-powered logistics solutions. The firm recently secured a Series A funding round, generating $500,000 in surplus funds. With annual revenue of $2 million, TechTrend faces high market volatility due to rapid technological shifts. Your task is to allocate these funds across three investment options to manage risk. The board has mandated a conservative investment strategy prioritizing financial stability to support R&D and a major product launch in 5 years. Review the Firm Dossier:",
    dossier: [
      {
        icon: Briefcase,
        label: "Sector & Size",
        value: "Early‑stage technology firm; revenue ≈ $2M."
      },
      {
        icon: Target,
        label: "Strategic Priority",
        value: "Extend runway to support R&D and product launch."
      },
      {
        icon: Landmark,
        label: "Financial Context",
        value: "Surplus = $500,000; liquidity horizon = 18—24 months."
      }
    ]
  },
  xyz: {
    briefing: "You are part of the financial decision-makers for XYZ Manufacturing, a mid-sized firm specializing in industrial equipment. Recently, XYZ expanded into new markets, boosting annual revenue to $50 million but increasing exposure to economic fluctuations. With $1,000,000 in surplus funds, your task is to allocate these funds across three investment options. The board has mandated a conservative investment strategy prioritizing financial stability to support operations and future growth. Review the Firm Dossier:",
    dossier: [
        {
          icon: Briefcase,
          label: "Sector & Size",
          value: "Mid‑sized industrial manufacturer; revenue ≈ $50M."
        },
        {
          icon: Target,
          label: "Strategic Priority",
          value: "Preserve capital and maintain liquidity for planned IoT investment."
        },
        {
          icon: Landmark,
          label: "Financial Context",
          value: "Surplus = $1,000,000; liquidity target = 24 months"
        }
    ]
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

    if (scrollableContent) {
        scrollableContent.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollableContent) {
        scrollableContent.removeEventListener('scroll', handleScroll);
      }
      const viewTime = Date.now() - startTime;
      console.log(`Dossier view time: ${viewTime}ms, Scrolls: ${scrollCount}`);
      updateSessionData({ dossierViewTime: viewTime, dossierScrollCount: scrollCount });
    };
  }, []);

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl">Scenario Briefing</CardTitle>
        </div>
      </CardHeader>
      <div className="p-6 pt-0 space-y-6">
        <Alert>
          <AlertDescription className="text-muted-foreground">
            {content.briefing}
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-lg text-primary">Firm Dossier</h3>
        </div>
        
        <div className="space-y-4 pr-4">
            {content.dossier.map((item, index) => (
              <Card key={index} className="bg-secondary/40">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">
                      <span className="font-semibold text-card-foreground">{item.label}:</span>
                      {' '}
                      {item.value}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </>
  );
}
