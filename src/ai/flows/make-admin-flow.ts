'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAuth } from 'firebase-admin/auth';
import { initializeAdminApp } from '@/firebase/admin';

const MakeAdminInputSchema = z.object({
  email: z.string().email(),
});

const MakeAdminOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export async function makeAdmin(email: string): Promise<{ success: boolean, message: string }> {
  try {
    const output = await makeAdminFlow({ email });
    return output;
  } catch (error: any) {
    console.error('Error calling makeAdminFlow:', error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

const makeAdminFlow = ai.defineFlow(
  {
    name: 'makeAdminFlow',
    inputSchema: MakeAdminInputSchema,
    outputSchema: MakeAdminOutputSchema,
  },
  async (input) => {
    try {
      initializeAdminApp();
      const auth = getAuth();
      const user = await auth.getUserByEmail(input.email);
      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      await auth.setCustomUserClaims(user.uid, { admin: true });

      return { success: true, message: `Admin claim set for ${input.email}. Please log out and log back in.` };
    } catch (error: any) {
      console.error('Error in makeAdminFlow:', error);
      return { success: false, message: error.message || 'An unknown server error occurred.' };
    }
  }
);
