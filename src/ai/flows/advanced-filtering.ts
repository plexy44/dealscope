// This is an AI-powered filter suggestion flow that helps users refine their search queries with AI.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview This file defines the AIFilterSuggestor flow, which suggests refined search queries based on initial input.
 *
 * @exports AIFilterSuggestorInput - The input type for the AIFilterSuggestor function.
 * @exports AIFilterSuggestorOutput - The output type for the AIFilterSuggestor function.
 * @exports suggestFilters - The main function that triggers the AIFilterSuggestor flow.
 */

const AIFilterSuggestorInputSchema = z.object({
  initialQuery: z.string().describe('The initial search query entered by the user.'),
  category: z.string().optional().describe('The category of the product being searched for.'),
  brand: z.string().optional().describe('The brand of the product being searched for.'),
  priceRange: z
    .string()
    .optional()
    .describe('The price range for the product (e.g., $100-$200).'),
  condition: z.string().optional().describe('The condition of the product (e.g., New, Used).'),
});

export type AIFilterSuggestorInput = z.infer<typeof AIFilterSuggestorInputSchema>;

const AIFilterSuggestorOutputSchema = z.object({
  refinedQuery: z
    .string()
    .describe(
      'A refined search query with suggested filters based on the initial query and optional parameters.'
    ),
  suggestedFilters: z
    .array(z.string())
    .describe('An array of suggested filters to apply to the search.'),
  reasoning: z
    .string()
    .describe('Explanation of why these particular filters would be useful to the user.'),
});

export type AIFilterSuggestorOutput = z.infer<typeof AIFilterSuggestorOutputSchema>;

export async function suggestFilters(input: AIFilterSuggestorInput): Promise<AIFilterSuggestorOutput> {
  return aiFilterSuggestorFlow(input);
}

const aiFilterSuggestorPrompt = ai.definePrompt({
  name: 'aiFilterSuggestorPrompt',
  input: {schema: AIFilterSuggestorInputSchema},
  output: {schema: AIFilterSuggestorOutputSchema},
  prompt: `You are an AI assistant helping users refine their search queries on an e-commerce platform.

  The user has provided the following initial query: "{{initialQuery}}".

  Consider the following optional parameters provided by the user to the system:
  Category: {{category}}
  Brand: {{brand}}
  Price Range: {{priceRange}}
  Condition: {{condition}}

  Based on this information, suggest a refined search query and a list of suggested filters that would help the user find the exact product they are looking for and filter out unwanted results.

  Explain why these filters would be useful to the user.

  Refined Query: 
  Suggested Filters: 
  Reasoning: `,
});

const aiFilterSuggestorFlow = ai.defineFlow(
  {
    name: 'aiFilterSuggestorFlow',
    inputSchema: AIFilterSuggestorInputSchema,
    outputSchema: AIFilterSuggestorOutputSchema,
  },
  async input => {
    const {output} = await aiFilterSuggestorPrompt(input);
    return output!;
  }
);
