
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
import { collection, getDocs, writeBatch, doc, DocumentReference, DocumentData, CollectionReference } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DeleteDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPERIMENT_ID = 'exp_004';

// List of all subcollections under a participant
const SUBCOLLECTIONS = [
    'responses', 
    'derived_composites', 
    'data_quality_flags', 
    'payment_reconciliation'
];

// Deeper nested subcollections
const RESPONSE_SUBCOLLECTIONS = ['objective_linguistic_analysis', 'manual_coding'];

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

        const deletePromises: Promise<void>[] = [];
        const CHUNK_SIZE = 400; // Keep batch size well under 500 limit to be safe

        // Create chunks of participant docs to process
        const docChunks: DocumentData[][] = [];
        for (let i = 0; i < querySnapshot.docs.length; i += CHUNK_SIZE) {
            docChunks.push(querySnapshot.docs.slice(i, i + CHUNK_SIZE));
        }

        for (const docChunk of docChunks) {
            const batch = writeBatch(firestore);
            
            for (const participantDoc of docChunk) {
                const participantRef = participantDoc.ref;
                
                // 1. Queue the main participant document for deletion
                batch.delete(participantRef);

                // 2. Queue documents from direct subcollections
                for (const subcollectionName of SUBCOLLECTIONS) {
                    const subcollectionRef = collection(firestore, participantRef.path, subcollectionName);
                    const subcollectionSnapshot = await getDocs(subcollectionRef);
                    for (const subDoc of subcollectionSnapshot.docs) {
                        batch.delete(subDoc.ref);

                        // 3. Handle sub-sub-collections (e.g., under 'responses')
                        if (subcollectionName === 'responses') {
                            for (const responseSubColName of RESPONSE_SUBCOLLECTIONS) {
                                const deepSubColRef = collection(firestore, subDoc.ref.path, responseSubColName);
                                const deepSubColSnapshot = await getDocs(deepSubColRef);
                                for (const deepDoc of deepSubColSnapshot.docs) {
                                    batch.delete(deepDoc.ref);
                                }
                            }
                        }
                    }
                }
            }
            
            // Commit the batch
            deletePromises.push(batch.commit());
        }

        await Promise.all(deletePromises);

        toast({
            title: "Success",
            description: `${querySnapshot.size} participant sessions and all related sub-collection data have been deleted. The table will refresh.`,
            className: "bg-green-100 text-green-800",
        });

    } catch (error: any) {
        console.error("Error deleting data:", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message || "An error occurred. Check console for details.",
        });
    } finally {
        setIsDeleting(false);
        onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all participant session data from the database, including all responses, composites, and flags.
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
