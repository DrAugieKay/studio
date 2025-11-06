import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"


export default function StepAdvisory() {
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
          <AlertTitle>Financial Advisor's Note</AlertTitle>
          <AlertDescription className="space-y-4 pt-2 text-muted-foreground">
            <p>
              This is where the conditioned advisory text would appear. The content displayed to the participant would be determined by their assigned experimental condition (e.g., human advisor vs. AI advisor, risk-averse vs. risk-seeking frame).
            </p>
            <p>
              For example, one condition might see a formal, data-driven analysis from a "Certified Financial Analyst," while another might see a more intuitive, cautiously optimistic note from an "Experienced AI Investment Model."
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
