import Header from '@/components/common/Header';
import SessionTable from '@/components/admin/SessionTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Users className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline">Session Management</h1>
            </div>
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
        </div>
      </main>
    </div>
  );
}
