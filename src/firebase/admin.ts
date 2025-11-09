import admin from 'firebase-admin';

const firebaseAdminConfig = {
  credential: admin.credential.applicationDefault(),
  // Add other necessary configurations, e.g., databaseURL
};

export function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp(firebaseAdminConfig);
}
