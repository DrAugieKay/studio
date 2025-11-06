/**
 * @fileOverview This file defines a Genkit flow for suggesting reasons for a participant's objective choice.
 *
 * - suggestChoiceReason - A function that takes the participant's choice and context as input and returns suggested reasons.
 * - SuggestChoiceReasonInput - The input type for the suggestChoiceReason function.
 * - SuggestChoiceReasonOutput - The output type for the suggestChoiceReason function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestChoiceReasonInputSchema = z.object({
  choice: z.string().describe('The participant`s objective choice.'),
  context: z.string().describe('Contextual information relevant to the choice.'),
});

export type SuggestChoiceReasonInput = z.infer<typeof SuggestChoiceReasonInputSchema>;

const SuggestChoiceReasonOutputSchema = z.object({
  suggestedReasons: z.array(z.string()).describe('AI-powered suggestions for explaining the participant`s choice.'),
});

export type SuggestChoiceReasonOutput = z.infer<typeof SuggestChoiceReasonOutputSchema>;

export async function suggestChoiceReason(input: SuggestChoiceReasonInput): Promise<SuggestChoiceReasonOutput> {
  return suggestChoiceReasonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestChoiceReasonPrompt',
  input: {schema: SuggestChoiceReasonInputSchema},
  output: {schema: SuggestChoiceReasonOutputSchema},
  prompt: `You are an AI assistant designed to help participants articulate their reasoning for their objective choice in an experiment.

  Given the participant's choice and the context, provide 3 distinct and clear suggestions for explaining their choice.

  Choice: {{{choice}}}
  Context: {{{context}}}

  Suggestions:
  `,
});

const suggestChoiceReasonFlow = ai.defineFlow(
  {
    name: 'suggestChoiceReasonFlow',
    inputSchema: SuggestChoiceReasonInputSchema,
    outputSchema: SuggestChoiceReasonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
