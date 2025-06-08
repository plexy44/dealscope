
import { z } from 'zod';

export const DealSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.string(),
  originalPrice: z.string().optional(),
  discountPercentage: z.string().optional(), // Should be numeric string e.g., "40" for 40%
  imageUrl: z.string(),
  dataAiHint: z.string().optional(),
  ebayLink: z.string(),
  postedDate: z.string().optional(),
  deliveryTime: z.string().optional(),
  category: z.string().optional(),
  fomoBadges: z.array(z.string()).optional(),
  sellerRating: z.string().optional(),
  itemCondition: z.string().optional(),
  riskScore: z.number().optional(), // Potentially for future AI-driven risk assessment
  rarityScore: z.number().optional(), // Potentially for future AI-driven rarity assessment
  urgencyScore: z.number().optional(), // Potentially for future AI-driven urgency
  buyingOption: z.enum(["Buy It Now", "Auction"]).optional(),
  shortDescription: z.string().optional(), // Added for more context for AI
  watchCount: z.number().optional(), // Added for item popularity
});
export type Deal = z.infer<typeof DealSchema>;


export interface Auction {
  id: string;
  title: string;
  currentBid: string;
  endTime?: string;
  imageUrl: string;
  dataAiHint?: string;
  ebayLink: string;
  watchCount?: number;
  deliveryTime?: string;
  fomoBadges?: string[];
  sellerRating?: string;
  itemCondition?: string;
  urgencyScore?: number;
  shortDescription?: string; // Added for more context
}

export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isProMember: boolean;
  savedSearches?: string[];
  savedItems?: string[];
}

// This EbayItem type is largely superseded by DealSchema and the Auction interface.
// It can be kept for reference or removed if no longer directly used.
export interface EbayItem {
  title: string;
  price: string;
  delivery_estimate?: string; 
  ebay_link: string;
  estimated_retail_value?: string;
  discount_percentage?: string;
  rarity_score?: number; 
  urgency_score?: number; 
  risk_score?: number;   
  seller_rating?: string; 
  item_condition?: string; 
  buying_option: "Buy It Now" | "Auction";
}

