import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight } from 'lucide-react';

export default function ResearchProfilePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">Research Profile</CardTitle>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 md:px-10 space-y-6">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-x-8 gap-y-4">
              <p className="font-semibold text-muted-foreground">Title:</p>
              <p className="font-semibold text-primary">Human vs. AI: How Construal Level and Credibility Perceptions Shape Decision-Making Quality in Financial Advisory Services.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-x-8 gap-y-4">
              <p className="font-semibold text-muted-foreground">Principal Investigator:</p>
              <p>Prof. Tian Hongyun <span className="text-muted-foreground text-sm">[School of Management, Jiangsu University, China]</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-x-8 gap-y-4">
              <p className="font-semibold text-muted-foreground">Co-Investigator:</p>
              <p>Augustine K. Anokye-Wusu <span className="text-muted-foreground text-sm">[School of Management, Jiangsu University, China]</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-x-8 gap-y-4">
              <p className="font-semibold text-muted-foreground">IRB/Ethics:</p>
              <p>This study has been approved by the Jiangsu University Research Ethics Review Committee [Approval Code: <span className="bg-muted px-2 py-1 rounded">JSU/RERC/2025/11/011</span>]</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-x-8 gap-y-4">
              <p className="font-semibold text-muted-foreground">Estimated Completion:</p>
              <p>15—20 minutes</p>
            </div>
            <Separator />
          </CardContent>
        </Card>
        <div className="flex justify-end mt-6">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/start">
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
      </div>
    </div>
  );
}
