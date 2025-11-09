'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeAdminApp } from '@/firebase/admin';

export async function setAdminClaim(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const adminApp = initializeAdminApp();
    const auth = getAuth(adminApp);
    
    const user = await auth.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    // Set custom user claims on this user.
    await auth.setCustomUserClaims(user.uid, { admin: true });

    return { success: true, message: `Admin claim set for ${email}. Please log out and log back in.` };

  } catch (error: any) {
    console.error('Error setting admin claim:', error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
