'use server';

/**
 * @fileOverview Summarizes the open rationale response using AI.
 *
 * - summarizeOpenRationale - A function that summarizes the open rationale response.
 * - SummarizeOpenRationaleInput - The input type for the summarizeOpenRationale function.
 * - SummarizeOpenRationaleOutput - The return type for the summarizeOpenRationale function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeOpenRationaleInputSchema = z.object({
  rationale: z.string().describe('The open rationale response to summarize.'),
});
export type SummarizeOpenRationaleInput = z.infer<typeof SummarizeOpenRationaleInputSchema>;

const SummarizeOpenRationaleOutputSchema = z.object({
  summary: z.string().describe('The summarized open rationale response.'),
});
export type SummarizeOpenRationaleOutput = z.infer<typeof SummarizeOpenRationaleOutputSchema>;

export async function summarizeOpenRationale(input: SummarizeOpenRationaleInput): Promise<SummarizeOpenRationaleOutput> {
  return summarizeOpenRationaleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeOpenRationalePrompt',
  input: {schema: SummarizeOpenRationaleInputSchema},
  output: {schema: SummarizeOpenRationaleOutputSchema},
  prompt: `Summarize the following open rationale response in a concise and clear manner:\n\n{{{rationale}}}`,
});

const summarizeOpenRationaleFlow = ai.defineFlow(
  {
    name: 'summarizeOpenRationaleFlow',
    inputSchema: SummarizeOpenRationaleInputSchema,
    outputSchema: SummarizeOpenRationaleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
