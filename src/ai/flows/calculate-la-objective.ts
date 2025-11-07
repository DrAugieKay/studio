// src/ai/flows/calculate-la-objective.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for calculating the objective linguistic abstractness (LA_OBJECTIVE) of a given text.
 *
 * - calculateLaObjective - A function that takes a raw advisory text and returns its LA_OBJECTIVE score.
 * - CalculateLaObjectiveInput - The input type for the calculateLaObjective function.
 * - CalculateLaObjectiveOutput - The output type for the calculateLaObjective function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateLaObjectiveInputSchema = z.object({
  advisoryText: z.string().describe('The raw text of the advisory to be analyzed.'),
});
export type CalculateLaObjectiveInput = z.infer<typeof CalculateLaObjectiveInputSchema>;

const CalculateLaObjectiveOutputSchema = z.object({
  sv_rate: z.number().describe('The rate of State Verbs (SV) in the text.'),
  adj_rate: z.number().describe('The rate of Adjectives (ADJ) in the text.'),
  dav_rate: z.number().describe('The rate of Disambiguating Adverbs (DAV) in the text.'),
  iav_rate: z.number().describe('The rate of Intensifying Adverbs (IAV) in the text.'),
  la_objective: z.number().describe('The final calculated LA_OBJECTIVE score, not yet z-scored.'),
});
export type CalculateLaObjectiveOutput = z.infer<typeof CalculateLaObjectiveOutputSchema>;

export async function calculateLaObjective(input: CalculateLaObjectiveInput): Promise<CalculateLaObjectiveOutput> {
  return calculateLaObjectiveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateLaObjectivePrompt',
  input: {schema: CalculateLaObjectiveInputSchema},
  output: {schema: CalculateLaObjectiveOutputSchema},
  prompt: `You are an expert linguistic analysis tool. Your task is to calculate the objective linguistic abstractness (LA_OBJECTIVE) of the provided advisory text based on the Linguistic Category Model (LCM).

You must perform the following steps:
1.  Tokenize the advisory text.
2.  Count the total number of tokens.
3.  Identify and count the occurrences of the following linguistic categories:
    *   State Verbs (SV): Verbs describing a lasting state (e.g., 'believe', 'love', 'know', 'have').
    *   Adjectives (ADJ): Words that describe nouns (e.g., 'good', 'bad', 'happy').
    *   Disambiguating Adverbs (DAV): Adverbs that clarify or specify (e.g., 'quickly', 'loudly').
    *   Intensifying Adverbs (IAV): Adverbs that modify the intensity of other words (e.g., 'very', 'extremely', 'really').
4.  Calculate the rate for each category by dividing its count by the total number of tokens.
5.  Calculate the final LA_OBJECTIVE score using the formula: LA_OBJECTIVE = (SV_rate + ADJ_rate) - (DAV_rate + IAV_rate).
6.  Return the rates and the final, non-z-scored LA_OBJECTIVE value.

Advisory Text:
{{{advisoryText}}}
`,
});

const calculateLaObjectiveFlow = ai.defineFlow(
  {
    name: 'calculateLaObjectiveFlow',
    inputSchema: CalculateLaObjectiveInputSchema,
    outputSchema: CalculateLaObjectiveOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
