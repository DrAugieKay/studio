import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-open-rationale.ts';
import '@/ai/flows/generate-advisory-text.ts';
import '@/ai/flows/suggest-choice-reason.ts';
import '@/ai/flows/calculate-la-objective.ts';
