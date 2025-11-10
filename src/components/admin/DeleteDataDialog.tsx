
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DeleteDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPERIMENT_ID = 'exp_001';

export default function DeleteDataDialog({ isOpen, onClose }: DeleteDataDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Firestore is not initialized.",
        });
        return;
    }

    setIsDeleting(true);

    try {
        const participantsCollectionRef = collection(firestore, `experiment_meta/${EXPERIMENT_ID}/participants`);
        const querySnapshot = await getDocs(participantsCollectionRef);
        
        if (querySnapshot.empty) {
            toast({
                title: "No Data",
                description: "There is no session data to delete.",
            });
            setIsDeleting(false);
            onClose();
            return;
        }

        // Firestore limits batches to 500 operations.
        // We'll process in chunks if there are more than 500 participants.
        const chunks: any[] = [];
        for (let i = 0; i < querySnapshot.docs.length; i += 500) {
            chunks.push(querySnapshot.docs.slice(i, i + 500));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(firestore);
            chunk.forEach((doc: any) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        toast({
            title: "Success",
            description: `${querySnapshot.size} participant sessions have been deleted. The session table will refresh.`,
            className: "bg-green-100 text-green-800",
        });

    } catch (error) {
        console.error("Error deleting data:", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "An error occurred while trying to delete the data. Please check the console for details.",
        });
    } finally {
        setIsDeleting(false);
        onClose();
        // The table will auto-refresh due to the real-time listener in `useCollection`.
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all participant session data from the database. This includes all responses, composites, and flags.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isDeleting ? 'Deleting...' : 'Yes, delete all data'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
