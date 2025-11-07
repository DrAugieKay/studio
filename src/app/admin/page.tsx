import Header from '@/components/common/Header';
import SessionTable from '@/components/admin/SessionTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, BarChart, Users } from 'lucide-react';
import CompletionRateChart from '@/components/admin/CompletionRateChart';
import ChoiceDistributionChart from '@/components/admin/ChoiceDistributionChart';
import CredibilityScoresChart from '@/components/admin/CredibilityScoresChart';

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
          </div>

          <Tabs defaultValue="sessions" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="sessions">
                <Users className="mr-2 h-4 w-4" />
                Session Management
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <BarChart className="mr-2 h-4 w-4" />
                Data Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participant Sessions</CardTitle>
                  <CardDescription>
                    Browse and manage all participant sessions from this dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SessionTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Data Analysis & Export</h2>
                    <p className="text-muted-foreground">Visualize and export the collected study data.</p>
                  </div>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                  </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Session Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CompletionRateChart />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Decision Choice Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChoiceDistributionChart />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Advisor Credibility Scores</CardTitle>
                        <CardDescription>Average perceived credibility by advisor source.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CredibilityScoresChart />
                    </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
