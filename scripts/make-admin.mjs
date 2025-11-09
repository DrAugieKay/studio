// scripts/make-admin.mjs
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Sets a custom 'admin' claim on a Firebase user account.
 * 
 * Instructions:
 * 1. Download your service account key from Firebase project settings
 *    (Project settings > Service accounts > Generate new private key).
 * 2. Rename the downloaded file to 'service-account.json' and place it in the root of this project.
 * 3. Run this script from your terminal: `npm run make-admin your-email@example.com`
 * 4. For the claim to take effect, the user must log out and log back in.
 */

// --- Script Start ---

const SERVICE_ACCOUNT_FILE = 'service-account.json';

try {
  // Check if an email was provided
  const email = process.argv[2];
  if (!email) {
    throw new Error('Please provide an email address as an argument.');
  }

  // Resolve the absolute path to the service account key
  const serviceAccountPath = resolve(process.cwd(), SERVICE_ACCOUNT_FILE);

  // Load the service account key
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  } catch (e) {
    throw new Error(`'${SERVICE_ACCOUNT_FILE}' not found in the project root directory. Please follow the instructions in the script comments to download it from your Firebase project settings.`);
  }

  // Initialize the Firebase Admin SDK
  initializeApp({
    credential: cert(serviceAccount)
  });

  // Get the user by email and set the custom claim
  console.log(`Fetching user: ${email}...`);
  getAuth()
    .getUserByEmail(email)
    .then((user) => {
      console.log(`Setting admin claim for user: ${user.uid}...`);
      return getAuth().setCustomUserClaims(user.uid, { admin: true });
    })
    .then(() => {
      console.log(`\n✅ Successfully set admin claim for ${email}`);
      console.log('   The user must log out and log back in for the changes to take effect.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ An error occurred:');
      if (error.code === 'auth/user-not-found') {
        console.error(`   User with email "${email}" not found.`);
        console.error('   Please make sure you have created the user in the Firebase Authentication console first.');
      } else {
        console.error(error.message);
      }
      process.exit(1);
    });

} catch (error) {
    console.error('\n❌ An error occurred:');
    console.error(error.message);
    process.exit(1);
}
