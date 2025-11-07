
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import type { SessionData } from '@/lib/types';


type StepProps = {
  sessionData: Partial<SessionData>;
};

const advisoryContent = {
    human: {
      title: "Financial Analyst's Note",
      concrete: "Based on a detailed review of the balance sheet and cash flow statements, the numbers indicate a strong potential for short-term growth. The debt-to-equity ratio is within acceptable industry limits. I recommend proceeding, but with a clear milestone-based funding structure.",
      abstract: "From my experience, the overall strategic vision is sound and aligns with major market trends. The leadership team appears capable of navigating future challenges. My gut feeling is that this is a favorable opportunity worth pursuing.",
    },
    ai: {
      title: "AI Investment Model's Analysis",
      concrete: "Analysis of 1.2 million market data points and the company's financial documents shows an 82% probability of exceeding projected ROI within 36 months. The algorithm flags a potential risk in supply chain volatility, but the overall expected value is positive. The recommendation is to invest.",
      abstract: "The predictive models suggest a high likelihood of success, as the company's trajectory aligns with patterns seen in historically successful ventures. The system identifies a synergy between market opportunity and the company's core competencies. The logical conclusion is that this is a strong investment.",
    },
};


export default function StepAdvisory({ sessionData }: StepProps) {
    const { condition } = sessionData;
    const source = condition?.advisorySource || 'human';
    const frame = condition?.linguisticFrame || 'concrete';

    const content = advisoryContent[source];
    const advisoryText = content[frame];
    
  return (
    <>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Advisory Information</CardTitle>
        <CardDescription>
          Please review the following advisory text related to the investment.
        </CardDescription>
      </CardHeader>
      <div className="p-6 pt-0">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{content.title}</AlertTitle>
          <AlertDescription className="space-y-4 pt-2 text-muted-foreground">
            <p>
              {advisoryText}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
