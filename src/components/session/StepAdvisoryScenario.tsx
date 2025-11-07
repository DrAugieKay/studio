import { CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Briefcase } from "lucide-react"


export default function StepAdvisoryScenario() {
  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-2xl">Section B: The Advisory Scenario</CardTitle>
        </div>
      </CardHeader>
      <div className="p-6 pt-0">
        <Alert>
          <AlertTitle>Scenario Introduction</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Please consider yourself in the following scenario. Read the information carefully, as you will be asked to ‘make a decision’ based on it.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
