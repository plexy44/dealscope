
'use server';
/**
 * @fileOverview Ranks deals based on discount percentage, recent posting, and delivery speed,
 * with added intelligence for scam detection and prioritization of single-item deals.
 * It also considers relevance to the user's original search query.
 *
 * - rankDeals - A function that ranks deals.
 * - SmartDealRankerInput - The input type for the smartDealRanker function.
 * - SmartDealRankerOutput - The return type for the smartDealRanker function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Deal } from '@/types'; // Using TypeScript type for internal use
import { DealSchema } from '@/types'; // Using Zod schema for Genkit

const SmartDealRankerInputSchema = z.object({
  deals: z.array(DealSchema).describe('An array of deal objects to be ranked.'),
  userQuery: z.string().optional().describe('The original search query entered by the user. This is crucial for determining relevance.')
});
export type SmartDealRankerInput = z.infer<typeof SmartDealRankerInputSchema>;

const SmartDealRankerOutputSchema = z.object({
  rankedDeals: z.array(DealSchema).describe('An array of deal objects, filtered and ranked according to enhanced criteria.'),
});
export type SmartDealRankerOutput = z.infer<typeof SmartDealRankerOutputSchema>;

export async function rankDeals(input: Deal[], userQuery?: string): Promise<Deal[]> {
  if (!input || input.length === 0) {
    console.log(`[SmartDealRanker AI] Received empty input array. Returning empty.`);
    return [];
  }
  try {
    console.log(`[SmartDealRanker AI] Starting ranking for ${input.length} deals. User query: "${userQuery || 'N/A'}"`);
    // The smartDealRankerFlow is expected to return an object with a rankedDeals array.
    // It has internal checks if the AI output itself is malformed and will return { rankedDeals: [] } in such cases.
    const result = await smartDealRankerFlow({ deals: input, userQuery });
    
    // The flow itself should ideally handle ID validation and property preservation.
    // result.rankedDeals is expected to be an array due to the flow's internal handling and Zod schema.
    const rankedDealsFromFlow = result.rankedDeals;

    if (input.length > 0 && rankedDealsFromFlow.length === 0) {
      console.warn(`[SmartDealRanker AI] AI processed ${input.length} deals and returned 0 deals (all items were filtered out by AI criteria). User query: "${userQuery || 'N/A'}"`);
    }
    
    console.log(`[SmartDealRanker AI] Ranking complete. Returned ${rankedDealsFromFlow.length} deals from an input of ${input.length}.`);
    return rankedDealsFromFlow;

  } catch (error) {
    console.error(`[SmartDealRanker AI] CRITICAL ERROR during smartDealRanker AI flow for ${input.length} deals. User query: "${userQuery || 'N/A'}". Falling back to original input order. Error:`, error);
    return input; // Fallback to original input order on critical AI error
  }
}

const prompt = ai.definePrompt({
  name: 'smartDealRankerPrompt',
  input: {schema: SmartDealRankerInputSchema},
  output: {schema: SmartDealRankerOutputSchema},
  prompt: `You are an AI assistant specialized in identifying and ranking **THE BEST AND MOST RELEVANT DEALS** on eBay for savvy shoppers who are typically looking for a deal on a **SINGLE CONSUMER ITEM**.
You will receive an array of 'deals' objects and an optional 'userQuery'. Each deal object has properties like:
- id: string (unique identifier)
- title: string
- price: string (e.g., "USD 2999.99")
- originalPrice: string (e.g., "USD 4999.99", optional)
- discountPercentage: string (e.g., "40" for 40% off, optional, numeric string. This field has been pre-processed and should be trusted if present and valid.)
- imageUrl: string
- ebayLink: string
- postedDate: string (e.g., "10/26/2023", optional)
- deliveryTime: string (e.g., "Oct 28 - Oct 30", optional)
- category: string (optional, e.g., "Fashion", "Electronics")
- itemCondition: string (optional, e.g., "New", "Pre-owned", "New with defects")
- sellerRating: string (e.g., "99.5% (2500)", optional, format: "PERCENTAGE% (FEEDBACK_COUNT)")
- shortDescription: string (optional, may contain important details about condition, completeness)
- watchCount: number (optional, indicates how many users are watching the item)

The user's original search query, if provided, is: \`{{{userQuery}}}\`

Your primary goal is to apply the CRITICAL RELEVANCE AND FILTERING CRITERIA rigorously. Then, re-rank ALL REMAINING items based on the RANKING criteria to highlight those with the most significant savings on desirable AND RELEVANT products.
The output array 'rankedDeals' MUST contain only the deal objects that pass ALL CRITICAL RELEVANCE AND FILTERING criteria, sorted according to the RANKING criteria.
The 'id' field for each deal object in the output must exactly match the 'id' from the input for those items that are included. Preserve all original fields of the deal objects you return.

**CRITICAL RELEVANCE AND FILTERING CRITERIA (Apply these rigorously. Items failing these checks, especially 1, 2, 4, or 5, should generally be EXCLUDED from \`rankedDeals\`):**

1.  **Primary Product Relevance vs. Accessories/Parts (CRITICAL CHECK):**
    *   **If \`userQuery\` is specific (e.g., "iPhone 15 Pro Max", "iPad Air", "PS5 console"):** The item's \`title\` and \`shortDescription\` MUST strongly indicate it is the **primary product itself**, not an accessory, part, or related item.
        *   For "iPad Air", a listing for an "iPad Air CASE" or "Screen Protector for iPad Air" is **NOT RELEVANT** as the primary deal and should be **EXCLUDED or ranked extremely low**.
        *   For "PS5 console", a "PS5 controller charging stand" is **NOT RELEVANT** as the primary deal.
    *   **Keywords to identify non-primary items:** "case for", "cover for", "charger for", "cable for", "stand for", "mount for", "screen protector for", "skin for", "parts for", "for parts", "replacement part", "box only", "empty box", "manual only", "photo of", "image of", "digital download". If these dominate the item's description in the context of a specific product query, **EXCLUDE it.**
    *   This check is **PARAMOUNT**. High discounts on accessories are not useful if the user searched for the main device.

2.  **Misleading Listings & Non-Genuine Items (CRITICAL CHECK):**
    *   Scrutinize \`title\` and \`shortDescription\`.
    *   Search for: "replica", "inspired by", "style of", "AAA quality", "master copy", "custom made to resemble", "AS-IS for parts" (unless query was for parts).
    *   If such keywords are found OR if the listing seems clearly not the actual full product (and the query was for the full product), **EXCLUDE this item.**

3.  **Multi-Buy/Bulk Pricing Distortion Filtering:**
    *   Examine \`title\` and \`shortDescription\` for indicators that the listed \`price\` is for a **bulk quantity or multi-pack**, not a single unit. Examples: "pack of 200", "100pcs", "lot of 50", "wholesale bundle of X".
    *   If the title or description strongly suggests the \`price\` is for multiple units and this price makes a single unit seem disproportionately expensive, **EXCLUDE this item.** The goal is to filter out listings where the displayed price is misleading for a single-item purchase.

4.  **Grossly Inflated Original Price / Unbelievable Discount Filtering (CRITICAL CHECK):**
    *   Scrutinize the \`originalPrice\`. If it appears **grossly and unquestionably inflated beyond any reasonable market value for *any* variant or condition of that item type** (e.g., a standard new smartphone listed with an \`originalPrice\` of "GBP 20,000" when its typical RRP is around GBP 800-1200 for the highest spec new model), this is a **CRITICAL FLAW**.
    *   **If such an absurdly inflated \`originalPrice\` is identified, EXCLUDE this item from \`rankedDeals\` COMPLETELY, regardless of the calculated \`discountPercentage\`.** The high discount, in this case, is based on a deceptive premise and is not a genuine deal.
    *   If the \`originalPrice\` is high, but *not* astronomically or impossibly so for the item category (i.e., it *could* be a legitimate RRP for a high-end variant, even if discounted significantly), then proceed. In these *non-absurd* cases, a high \`discountPercentage\` (e.g., 30-80% or more) is a strong positive signal for a relevant item and should be prioritized in ranking *after* this critical check is passed.

5.  **True Deal Identification (CRITICAL CHECK):**
    *   A "deal" implies a saving. An item MUST have at least ONE of the following to be considered for ranking as a deal:
        *   A valid, positive \`discountPercentage\` (e.g., "10" for 10% off).
        *   A valid \`originalPrice\` that is demonstrably higher than the current \`price\`, allowing for a discount calculation.
    *   If an item has NEITHER a positive \`discountPercentage\` NOR an \`originalPrice\` from which a discount can be calculated (or if \`originalPrice\` is equal to or less than \`price\`), it is a **regularly priced item, NOT a deal.**
    *   **Regularly priced items (those failing the check above) should be EXCLUDED from \`rankedDeals\` output.** The user is here for deals.

**RANKING (Apply to ALL items that PASS ALL the CRITICAL RELEVANCE AND FILTERING criteria):**

**A. PRIMARY SORT KEY: Effective Discount Percentage (Highest First):**
    *   After the critical filtering, the 'discountPercentage' field (e.g., "40" for 40% off) is your **ABSOLUTE AND ONLY PRIMARY sorting key for items of similar high relevance, or for all items if no specific \`userQuery\` was given or if the query was very broad.** Sort items with the highest valid 'discountPercentage' at the top. A 'discountPercentage' of "70" (meaning 70% off) comes before "50".
    *   Items that pass the "True Deal Identification" check but for which \`discountPercentage\` had to be calculated (because only \`originalPrice\` was available) should be ranked according to that calculated discount. Treat items with no 'discountPercentage' explicitly provided (but where one was calculated and is positive) based on their calculated discount.

**B. SECONDARY Ranking Factors (Apply to items with SIMILAR or IDENTICAL discount percentages, or as further refinement if relevance was the initial tie-breaker):**

    1.  **Significance of Absolute Discount Amount (Strong Tie-breaker):**
        *   For items with similar *percentage* discounts, a larger absolute monetary saving (e.g., $100 off is more impactful than $20 off) is a strong tie-breaker.
    2.  **Item Condition Hierarchy (Preference for New/Excellent).**
    3.  **Seller Reputation & Trust (High percentage AND high feedback count).**
    4.  **Recency (Posted Date).**
    5.  **Popularity/Demand indicators (e.g. 'watchCount' if high).**
    6.  **Delivery Speed (Minor bonus).**

Return ONLY items that pass ALL CRITICAL RELEVANCE AND FILTERING criteria (including "True Deal Identification"), sorted according to the RANKING criteria.
If ALL items are filtered out by the CRITICAL RELEVANCE AND FILTERING criteria, then return an empty 'rankedDeals' array.
Ensure the output strictly adheres to the SmartDealRankerOutputSchema.
`,
});

const smartDealRankerFlow = ai.defineFlow(
  {
    name: 'smartDealRankerFlow',
    inputSchema: SmartDealRankerInputSchema,
    outputSchema: SmartDealRankerOutputSchema,
  },
  async (input: SmartDealRankerInput): Promise<SmartDealRankerOutput> => {
    if (!input.deals || input.deals.length === 0) {
      return { rankedDeals: [] };
    }
    
    const dealsWithShortDescription = input.deals.map(deal => ({
        ...deal,
        shortDescription: deal.shortDescription || undefined 
    }));

    const {output} = await prompt({ deals: dealsWithShortDescription, userQuery: input.userQuery });
    
    if (!output || !output.rankedDeals) {
        console.warn(`[SmartDealRankerFlow] AI did not return a valid 'rankedDeals' array in the output object. Input deals: ${input.deals.length}, User query: "${input.userQuery || 'N/A'}". This might indicate an issue with the AI's response format or a complete filtering. Returning empty rankedDeals.`);
        return { rankedDeals: [] }; 
    }
    
    const originalDealIds = new Set(input.deals.map(d => d.id));
    const validatedRankedDeals = output.rankedDeals.filter(deal => {
        if (!originalDealIds.has(deal.id)) {
            console.warn(`[SmartDealRankerFlow] AI returned a deal with ID '${deal.id}' which was not in the original input. Filtering it out.`);
            return false;
        }
        return true;
    }).map(rankedDeal => { 
        const originalDeal = input.deals.find(d => d.id === rankedDeal.id);
        return { ...originalDeal, ...rankedDeal };
    });
    
    console.log(`[SmartDealRankerFlow] AI processed ${input.deals.length} deals. Returned ${validatedRankedDeals.length} validated deals. User query: "${input.userQuery || 'N/A'}"`);
    return { rankedDeals: validatedRankedDeals };
  }
);

