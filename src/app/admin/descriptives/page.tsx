
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { SessionData } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import DescriptiveStats from '@/components/admin/DescriptiveStats';

const EXPERIMENT_ID = 'exp_001';

export default function DescriptivesPage() {
    const firestore = useFirestore();

    const participantsCollectionQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`));
    }, [firestore]);

    const { data: sessions, isLoading } = useCollection<SessionData>(participantsCollectionQuery);

    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading descriptive statistics...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Descriptive Statistics</h1>
                    <p className="text-muted-foreground mt-1">Frequencies and summary statistics for key variables.</p>
                </div>
            </div>
            <DescriptiveStats sessions={sessions} />
        </div>
    );
}
