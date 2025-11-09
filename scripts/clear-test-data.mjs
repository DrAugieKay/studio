/**
 * @fileoverview A script to clear all test data from the Firestore database.
 *
 * This script is intended to be run once before going live to ensure a clean database.
 * It uses the service account credentials to gain admin access and perform deletion operations.
 *
 * To run this script:
 * 1. Make sure your `service-account.json` file is in the root of the project.
 * 2. Run the command: `npm run clean-db`
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

// --- Configuration ---
const EXPERIMENT_ID = 'exp_001';
// -------------------

async function deleteCollection(db, collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve, reject);
  });
}

async function deleteQueryBatch(db, query, resolve, reject) {
  try {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      // When there are no documents left, we are done
      return resolve();
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      // Recursively delete subcollections
      // For this app, we know participants have subcollections
      if (collectionPath.includes('participants')) {
          const subcollections = ['responses', 'derived_composites', 'data_quality_flags', 'objective_linguistic_analysis', 'manual_coding', 'payment_reconciliation'];
          subcollections.forEach(async sub => {
             await deleteCollection(db, `${doc.ref.path}/${sub}`);
          });
      }
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`Deleted ${snapshot.size} documents from ${query._queryOptions.collectionId}.`);

    // Recurse on the next process tick, to avoid exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(db, query, resolve, reject);
    });
  } catch (error) {
    console.error("Error deleting batch: ", error);
    reject(error);
  }
}

async function main() {
  try {
    console.log('--- Database Cleanup Script ---');
    
    // 1. Initialize Firebase Admin SDK
    const serviceAccount = JSON.parse(await readFile(new URL('../service-account.json', import.meta.url)));

    initializeApp({
      credential: cert(serviceAccount)
    });

    const db = getFirestore();
    console.log('Firebase Admin SDK initialized successfully.');

    // 2. Define collections to be cleared
    const participantCollectionPath = `experiment_meta/${EXPERIMENT_ID}/participants`;
    const adminAuditLogPath = 'admin_audit_logs';

    // 3. Clear the participants collection
    console.log(`\nAttempting to delete all documents in '${participantCollectionPath}'...`);
    await deleteCollection(db, participantCollectionPath);
    console.log(`Successfully cleared collection: ${participantCollectionPath}`);
    
    // 4. Clear the admin audit log collection
    console.log(`\nAttempting to delete all documents in '${adminAuditLogPath}'...`);
    await deleteCollection(db, adminAuditLogPath);
    console.log(`Successfully cleared collection: ${adminAuditLogPath}`);


    console.log('\n--- Database cleanup complete! ---');
    console.log('Your Firestore database is now ready for production data.');

  } catch (error) {
    if (error.code === 'ENOENT' && error.path.includes('service-account.json')) {
        console.error('\nERROR: `service-account.json` not found.');
        console.error('Please download your service account key from the Firebase Console and place it in the root directory.');
    } else {
        console.error('\nAn unexpected error occurred:', error.message);
    }
    process.exit(1);
  }
}

main();
