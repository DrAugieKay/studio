
'use client';

import type { SessionData } from '@/lib/types';
import { BrainCircuit, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

type StepProps = {
    sessionData: Partial<SessionData>;
    updateSessionData: (data: Partial<SessionData>) => void;
};

const advisoryContent = {
    human: {
        title: "Human Financial Analyst Advisory",
        logo: <User className="h-8 w-8 text-primary" />,
        executiveSummary: {
            concrete: "This advisory memo offers a quantitative analysis of three investment options, focusing on risk-adjusted returns and alignment with your firm's conservative mandate. The evaluation is based on financial modeling of historical market data and sector-specific performance metrics. A clear recommendation is provided, balancing capital preservation with modest growth.",
            abstract: "This advisory memo provides a strategic overview of three investment options, emphasizing their alignment with your firm's long-term vision. The evaluation is guided by my experience in navigating market dynamics and assessing leadership potential. A recommendation is offered that considers both financial stability and strategic positioning."
        },
        comparativeAnalysis: {
            concrete: "The analysis prioritized assets with low volatility and stable cash flows. Option B is identified as optimal due to its superior risk-return profile and shorter duration, which aligns with your liquidity needs. Options A and C present higher risks or lower returns, making them less suitable under the current mandate.",
            abstract: "The analysis focused on opportunities that promise sustainable value and resilience against market shifts. Option B emerges as the most prudent choice, reflecting a balanced approach that secures the firm’s foundation while allowing for future growth. Options A and C were deemed less aligned with the overarching goal of strategic stability."
        }
    },
    ai: {
        title: "AI-Generated Organizational Advisory",
        logo: <BrainCircuit className="h-8 w-8 text-primary" />,
        executiveSummary: {
            concrete: "This advisory memo presents a data-driven analysis of three investment options, with a focus on optimizing for your firm's conservative risk profile. The evaluation is derived from a predictive model trained on 1.2 million market data points, simulating performance under various economic conditions. A definitive recommendation is generated based on a 92% confidence interval.",
            abstract: "This advisory memo offers a systems-level perspective on three investment options, assessing their fit within your organization's strategic architecture. The evaluation synthesizes broad market patterns and emergent trends to identify the path of maximum resilience. A recommendation is derived from a logic-based framework that prioritizes systemic stability and long-term value creation."
        },
        comparativeAnalysis: {
            concrete: "The model's algorithm scored each asset based on 47 distinct financial health indicators. Option B received the highest composite score (8.9/10) due to its optimal balance of low beta and positive alpha against the benchmark index. Options A (6.2/10) and C (7.1/10) were computationally determined to be suboptimal for your stated risk tolerance.",
            abstract: "The system identified Option B as the dominant strategy, as it aligns with principles of portfolio theory that favor diversification and risk mitigation in volatile environments. This choice ensures the preservation of the firm’s core operational capacity. Options A and C introduce systemic risks that are inconsistent with the objective of ensuring long-term organizational viability."
        }
    }
};

const scenarioContent = {
    xyz: {
        to: "XYZ Manufacturing Decision-Makers",
        subject: "Re: Investment Decision Support for XYZ Manufacturing",
        context: "Given XYZ Manufacturing’s position as a mid-sized industrial manufacturer with a mandate for capital preservation to support future IoT investments, this analysis focuses on low-risk, liquid options.",
        options: [
            "Option A: Corporate Bond Fund (Investment Grade).",
            "Option B: High-Yield Savings Account.",
            "Option C: Diversified Blue-Chip Stock Portfolio."
        ]
    },
    techtrend: {
        to: "TechTrend Innovations Decision-Makers",
        subject: "Re: Investment Decision Support for TechTrend Innovations",
        context: "Considering TechTrend’s status as an early-stage technology firm in a volatile market, the strategic priority is to extend its operational runway for R&D and a future product launch. This analysis reflects that conservative goal.",
        options: [
            "Option A: Short-Term Government Treasury Bills.",
            "Option B: Certificate of Deposit (CD) Ladder.",
            "OptionC: Conservative Asset Allocation ETF."
        ]
    }
}

export default function AdvisoryMemo({ sessionData, updateSessionData }: StepProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const startTime = Date.now();
        const scrollableContent = scrollRef.current;
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
          console.log(`Advisory view time: ${viewTime}ms, Scrolls: ${scrollCount}`);
          updateSessionData({ advisoryViewTime: viewTime, advisoryScrollCount: scrollCount });
        };
      }, []); // Intentionally empty


    const { condition } = sessionData;
    if (!condition) return <div className="p-8 text-center">Loading advisory...</div>;

    const source = condition.advisorySource;
    const frame = condition.linguisticFrame;
    const scenario = condition.scenario;

    const content = advisoryContent[source];
    const scenarioData = scenarioContent[scenario];

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-white text-gray-800 font-serif p-8" ref={scrollRef}>
            <header className="flex items-center space-x-4 pb-4 border-b-2 border-gray-800">
                <div className="flex-shrink-0">
                    {content.logo}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{content.title}</h1>
                    <p className="text-xs text-gray-500">This document is confidential and intended for the recipient only.</p>
                </div>
            </header>

            <section className="my-6 text-sm">
                <div className="grid grid-cols-[50px_1fr] gap-x-4 gap-y-1">
                    <span className="font-bold">To:</span><span>{scenarioData.to}</span>
                    <span className="font-bold">Date:</span><span>{today}</span>
                    <span className="font-bold">Subject:</span><span>{scenarioData.subject}</span>
                </div>
            </section>

            <main className="space-y-6 text-sm leading-relaxed">
                <section>
                    <h2 className="text-base font-bold text-gray-900 mb-2">1.0 Executive Summary</h2>
                    <p>{content.executiveSummary[frame]}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-gray-900 mb-2">2.0 Contextual Analysis</h2>
                    <p>{scenarioData.context}</p>
                </section>

                <section>
                    <h2 className="text-base font-bold text-gray-900 mb-2">3.0 Comparative Option Analysis</h2>
                    <p className="mb-3">{content.comparativeAnalysis[frame]}</p>
                    <div className="border-l-2 border-gray-300 pl-4 ml-2 space-y-2 text-gray-700">
                        {scenarioData.options.map((option, index) => (
                            <p key={index}>{option}</p>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-base font-bold text-gray-900 mb-2">4.0 Recommendation</h2>
                    <p>Based on the analysis, the recommendation is to allocate the surplus funds to <span className="font-bold">Option B</span>.</p>
                </section>
            </main>

            <footer className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500">
                <p>
                    Disclaimer: This advisory is based on the information provided and represents either a human analyst's judgment or an AI model's computation. It does not constitute a guarantee of future results.
                </p>
            </footer>
        </div>
    );
}
