// scripts/make-admin.mjs
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

/**
 * This is a one-time use script to grant admin privileges to a user.
 *
 * HOW TO USE:
 * 1. Go to your Firebase Project Settings -> Service Accounts.
 * 2. Click "Generate new private key" and download the serviceAccountKey.json file.
 * 3. Place the downloaded 'serviceAccountKey.json' file in the root directory of this project.
 * 4. Create the user you want to make an admin in the Firebase Console (Authentication -> Users).
 * 5. Run this script from your terminal using the command:
 *    npm run make-admin -- an_email@example.com
 *
 *    (Replace 'an_email@example.com' with the actual email of the user).
 * 6. VERY IMPORTANT: For security, delete the 'serviceAccountKey.json' file after you have
 *    successfully created your admin.
 */

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Error: Please provide an email address as an argument.');
    console.error('Usage: npm run make-admin -- <email@example.com>');
    process.exit(1);
  }

  try {
    // Read the service account key from the file system.
    const serviceAccount = JSON.parse(
      await readFile(new URL('../serviceAccountKey.json', import.meta.url))
    );

    // Initialize the Firebase Admin SDK.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log(`Fetching user with email: ${email}...`);
    const user = await admin.auth().getUserByEmail(email);

    if (user.customClaims && user.customClaims.admin === true) {
        console.log(`User ${email} is already an admin. No changes made.`);
        process.exit(0);
    }
    
    console.log('Setting custom claim { admin: true }...');
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    console.log(`\n✅ Success! User '${email}' (UID: ${user.uid}) has been granted admin privileges.`);
    console.log('IMPORTANT: The user must log out and log back in for the changes to take effect.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ An error occurred:');
    if (error.code === 'auth/user-not-found') {
        console.error(`   User with email "${email}" not found.`);
        console.error('   Please ensure the user has been created in the Firebase Authentication console first.');
    } else if (error.code === 'ENOENT') {
        console.error("   'serviceAccountKey.json' not found in the project root directory.");
        console.error("   Please follow the instructions in the script comments to download it from your Firebase project settings.");
    }
    else {
        console.error(error);
    }
    process.exit(1);
  }
}

main();
