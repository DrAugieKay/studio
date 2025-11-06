// src/ai/flows/generate-advisory-text.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating variations of advisory text using AI.
 *
 * - generateAdvisoryText - A function that generates advisory text variations based on the given input.
 * - GenerateAdvisoryTextInput - The input type for the generateAdvisoryText function.
 * - GenerateAdvisoryTextOutput - The output type for the generateAdvisoryText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAdvisoryTextInputSchema = z.object({
  topic: z.string().describe('The topic of the advisory text.'),
  style: z.string().describe('The desired style of the advisory text (e.g., formal, informal, persuasive).'),
  length: z.string().describe('The desired length of the advisory text (e.g., short, medium, long).'),
  existingText: z.string().optional().describe('The existing advisory text.'),
});
export type GenerateAdvisoryTextInput = z.infer<typeof GenerateAdvisoryTextInputSchema>;

const GenerateAdvisoryTextOutputSchema = z.object({
  advisoryText: z.string().describe('The generated advisory text.'),
});
export type GenerateAdvisoryTextOutput = z.infer<typeof GenerateAdvisoryTextOutputSchema>;

export async function generateAdvisoryText(input: GenerateAdvisoryTextInput): Promise<GenerateAdvisoryTextOutput> {
  return generateAdvisoryTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAdvisoryTextPrompt',
  input: {schema: GenerateAdvisoryTextInputSchema},
  output: {schema: GenerateAdvisoryTextOutputSchema},
  prompt: `You are an expert in generating advisory text for various topics.

You will generate advisory text based on the following information:

Topic: {{{topic}}}
Style: {{{style}}}
Length: {{{length}}}

Existing Text: {{existingText}}

Generate advisory text that adheres to the specified style and length, while remaining relevant to the topic.
`,
});

const generateAdvisoryTextFlow = ai.defineFlow(
  {
    name: 'generateAdvisoryTextFlow',
    inputSchema: GenerateAdvisoryTextInputSchema,
    outputSchema: GenerateAdvisoryTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
