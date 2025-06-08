
'use server';

import { analyzeItem, type AnalyzeItemInput, type AnalyzeItemOutput } from '@/ai/flows/item-analyzer';

export interface DealAnalysisInput extends AnalyzeItemInput {}
export interface DealAnalysisOutput extends AnalyzeItemOutput {}

export async function getDealAnalysis(input: DealAnalysisInput): Promise<DealAnalysisOutput | { error: string }> {
  try {
    // Ensure all required fields for analyzeItem are present
    if (!input.title || !input.description || !input.sellerRating || !input.itemCondition) {
      console.error("[getDealAnalysis] Missing required fields for analysis:", input);
      const missingFields = [
        !input.title && "title",
        !input.description && "description",
        !input.sellerRating && "sellerRating",
        !input.itemCondition && "itemCondition"
      ].filter(Boolean).join(", ");
      
      return { error: `Analysis failed: Missing required item details (${missingFields || 'unknown fields'}). Seller and condition info are crucial.` };
    }
    
    console.log("[getDealAnalysis] Calling analyzeItem with input:", {
        title: input.title.substring(0,50) + "...", 
        description: input.description.substring(0,50) + "...", 
        sellerRating: input.sellerRating,
        itemCondition: input.itemCondition
    });

    let result = await analyzeItem(input);
    
    if (typeof result.riskScore !== 'number' || typeof result.rarityScore !== 'number') {
        console.error("[getDealAnalysis] AI did not return valid numeric scores. Result:", result);
        return { error: "AI analysis did not return valid scores. Please try again." };
    }

    // Safeguard: Clamp scores to be within 0-10 range
    const originalRiskScore = result.riskScore;
    const originalRarityScore = result.rarityScore;

    result.riskScore = Math.max(0, Math.min(10, result.riskScore));
    result.rarityScore = Math.max(0, Math.min(10, result.rarityScore));

    if (result.riskScore !== originalRiskScore) {
        console.warn(`[getDealAnalysis] AI returned riskScore ${originalRiskScore}, clamped to ${result.riskScore}.`);
    }
    if (result.rarityScore !== originalRarityScore) {
        console.warn(`[getDealAnalysis] AI returned rarityScore ${originalRarityScore}, clamped to ${result.rarityScore}.`);
    }


    console.log("[getDealAnalysis] Analysis successful. Result:", result);
    return result;

  } catch (e) {
    console.error("[getDealAnalysis] Error during AI deal analysis:", e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during analysis.";
    return { error: `Analysis failed: ${errorMessage}` };
  }
}

