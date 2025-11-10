
'use client';

import SessionTable from '@/components/admin/SessionTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import DeleteDataDialog from '@/components/admin/DeleteDataDialog';

export default function AdminDashboardPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold font-headline">Session Management</h1>
        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete All Session Data
        </Button>
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
      <DeleteDataDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
