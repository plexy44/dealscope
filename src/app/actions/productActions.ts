
'use server';

import { searchEbayItems, fetchEbayRapidAPI, fetchEbayMarketplaceDeals } from '@/services/ebayService';
import type { Deal, Auction } from '@/types';
import { rankDeals as smartDealRanker } from '@/ai/flows/smart-deal-ranker';

const DEALS_INITIAL_FETCH_SIZE = 50;
const AUCTIONS_INITIAL_FETCH_SIZE = 50;

const USE_RAPID_API_FALLBACK_FOR_DEALS = false; // Remains false to pause RapidAPI

const EXPANDED_HOMEPAGE_THEMES = [
  "laptop", "camera", "headphones", "smart watch", "gaming console",
  "kitchen appliance", "toys", "fashion accessories", "sports equipment", "home decor"
];
const NUMBER_OF_THEMES_TO_DISPLAY_ON_HOMEPAGE = 1;

interface FetchEbayDataResult {
  deals: Deal[];
  auctions: Auction[];
  error?: string;
  isHomepageContext?: boolean;
  searchQueryUsed?: string;
  hasMoreDealsOnServer?: boolean;
  hasMoreAuctionsOnServer?: boolean;
  apiTotalDeals?: number;
  apiTotalAuctions?: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function selectRandomThemes(allThemes: string[], count: number): string[] {
  if (count <= 0) return [];
  if (count >= allThemes.length) return [...allThemes];
  const shuffled = shuffleArray(allThemes);
  return shuffled.slice(0, count);
}

async function fetchAndProcessDeals(
  query: string,
  offset: number,
  limit: number,
  isUserSearch: boolean
): Promise<{ deals: Deal[]; total: number; error?: string; queryUsed: string }> {
  let dealsFromEbay: Deal[] = [];
  let apiTotal = 0;
  let officialApiError: string | undefined;
  let queryUsedForFetch = query;

  console.log(`[fetchAndProcessDeals] User search: ${isUserSearch}, Query: "${query}", Offset: ${offset}, Limit: ${limit}`);

  const response = await searchEbayItems(query, limit, offset, { searchMode: 'deals' });
  dealsFromEbay = response.deals;
  apiTotal = response.total;
  officialApiError = response.error;

  if (officialApiError) {
    console.error(`[fetchAndProcessDeals] Official API error for query "${query}": ${officialApiError}`);
  }
  // Enhanced log:
  console.log(`[fetchAndProcessDeals] Deals from eBay API (searchEbayItems) before AI: ${dealsFromEbay.length}. API total for this query: ${apiTotal}. Query used for fetch: "${queryUsedForFetch}"`);


  if (USE_RAPID_API_FALLBACK_FOR_DEALS && (officialApiError || dealsFromEbay.length === 0) && query) {
    console.log(`[fetchAndProcessDeals] RapidAPI Fallback: Official API failed or no deals for "${query}". Fetching via RapidAPI.`);
    const rapidResponse = await searchEbayRapidAPI(query, limit);
    if (rapidResponse.deals.length > 0) {
      console.log(`[fetchAndProcessDeals] RapidAPI Fallback: Success, ${rapidResponse.deals.length} deals for "${query}".`);
      dealsFromEbay = rapidResponse.deals; // Overwrite with RapidAPI deals
      apiTotal = rapidResponse.total; // Update total
      officialApiError = undefined; // Clear previous error
      console.log(`[fetchAndProcessDeals] Deals from RapidAPI before AI: ${dealsFromEbay.length}. API total (RapidAPI): ${apiTotal}.`);
    } else if (rapidResponse.error) {
      console.error(`[fetchAndProcessDeals] RapidAPI Fallback: Error for query "${query}": ${rapidResponse.error}`);
      officialApiError = (officialApiError ? officialApiError + "; " : "") + `Fallback failed: ${rapidResponse.error}`;
    } else {
      console.log(`[fetchAndProcessDeals] RapidAPI Fallback: No deals for "${query}".`);
    }
  }

  let processedDeals: Deal[] = []; // Initialize as empty

  if (dealsFromEbay.length > 0) {
    const userQueryForRanker = isUserSearch && query.trim() !== "" ? query : undefined;
    // console.log(`[fetchAndProcessDeals] Attempting AI processing for ${dealsFromEbay.length} deals. User query context for AI: "${userQueryForRanker || 'N/A (Homepage/Themed)'}"`);
    console.log(`[fetchAndProcessDeals] AI smartDealRanker BYPASSED for testing. Using raw deals from API. Raw count: ${dealsFromEbay.length}. User query context: "${userQueryForRanker || 'N/A (Homepage/Themed)'}"`);
    // try {
    //   processedDeals = await smartDealRanker(dealsFromEbay, userQueryForRanker);
    //   // Enhanced log:
    //   console.log(`[fetchAndProcessDeals] AI processing (smartDealRanker) complete. ${processedDeals.length} deals returned after ranking (AI input was ${dealsFromEbay.length}).`);
    // } catch (aiError) {
    //   console.error(`[fetchAndProcessDeals] CRITICAL ERROR during smartDealRanker AI processing. Falling back to unranked deals. Error:`, aiError);
    //   processedDeals = dealsFromEbay;
    //   if (!officialApiError) officialApiError = "";
    //   const aiErrorMessage = aiError instanceof Error ? aiError.message : "Unknown AI error";
    //   officialApiError += (officialApiError ? " " : "") + `AI ranking failed (${aiErrorMessage}); showing unranked deals.`;
    // }
    processedDeals = dealsFromEbay; // Directly use deals from eBay
    console.log(`[fetchAndProcessDeals] After bypassing AI, ${processedDeals.length} deals are being returned.`);
  } else {
     console.log(`[fetchAndProcessDeals] No deals from eBay API to process with AI (or bypass AI) for query "${query}". processedDeals will be empty.`);
     // processedDeals is already an empty array, so this is fine.
  }

  return { deals: processedDeals, total: apiTotal, error: officialApiError, queryUsed: queryUsedForFetch };
}

async function fetchAndProcessAuctions(
  query: string,
  offset: number,
  limit: number
): Promise<{ auctions: Auction[]; total: number; error?: string; queryUsed: string }> {
  console.log(`[fetchAndProcessAuctions] Query: "${query}", Offset: ${offset}, Limit: ${limit}`);
  const response = await searchEbayItems(query, limit, offset, { searchMode: 'auctions' });
  if (response.error) {
    console.error(`[fetchAndProcessAuctions] API error for auctions (query "${query}"): ${response.error}`);
  }
  console.log(`[fetchAndProcessAuctions] API returned ${response.auctions.length} auctions. API total: ${response.total}`);
  return { auctions: response.auctions, total: response.total, error: response.error, queryUsed: query };
}

export async function fetchEbayData(
  userQuery: string,
  dealsOffset: number = 0,
  auctionsOffset: number = 0,
  fetchContext: 'dealsOnly' | 'auctionsOnly'
): Promise<FetchEbayDataResult> {

  const isHomepageFetch = !userQuery;
  let homepageContextFlag = isHomepageFetch;
  let effectiveQuery = userQuery;
  let displayQuery = userQuery; // This will be dynamically set

  let deals: Deal[] = [];
  let auctions: Auction[] = [];
  let apiTotalDeals = 0;
  let apiTotalAuctions = 0;
  let combinedError: string | undefined;

  try {
    if (isHomepageFetch) {
      const selectedThemes = selectRandomThemes(EXPANDED_HOMEPAGE_THEMES, NUMBER_OF_THEMES_TO_DISPLAY_ON_HOMEPAGE);
      if (selectedThemes.length > 0) {
        effectiveQuery = selectedThemes[0];
        // Initial displayQuery, might be overridden by fallback or results
        displayQuery = fetchContext === 'dealsOnly'
            ? `Deals for "${effectiveQuery.charAt(0).toUpperCase() + effectiveQuery.slice(1)}"`
            : `Auctions for "${effectiveQuery.charAt(0).toUpperCase() + effectiveQuery.slice(1)}"`;
        console.log(`[fetchEbayData - Homepage] Using theme: "${effectiveQuery}" for ${fetchContext}`);
      } else {
        console.warn("[fetchEbayData - Homepage] No themes selected. Effective query will be empty for initial fetch.");
        effectiveQuery = ""; // Will fetch general deals/auctions if no theme
        displayQuery = fetchContext === 'dealsOnly' ? "Today's Top Deals" : "Trending Auctions";
      }
    } else {
      displayQuery = userQuery; // For user searches, displayQuery starts as the user's query
      console.log(`[fetchEbayData - User Search] Query: "${userQuery}", Context: ${fetchContext}`);
    }

    if (fetchContext === 'dealsOnly') {
      const dealData = await fetchAndProcessDeals(effectiveQuery, dealsOffset, DEALS_INITIAL_FETCH_SIZE, !isHomepageFetch);
      deals = dealData.deals;
      apiTotalDeals = dealData.total;
      if (dealData.error) combinedError = dealData.error;

      let usedFallbackSuccessfully = false;
      // Fallback logic for homepage deals if themed query yields 0 results
      if (isHomepageFetch && deals.length === 0 && !dealData.error) { // Also trigger fallback if effectiveQuery was empty initially
        console.log(`[fetchEbayData - Homepage Deals] Initial query ("${effectiveQuery || 'empty'}") yielded 0 deals. Attempting fallback to eBay Marketplace Deals API.`);
        
        // Using fetchEbayMarketplaceDeals as the fallback
        const marketplaceDealsResponse = await fetchEbayMarketplaceDeals(undefined, DEALS_INITIAL_FETCH_SIZE, dealsOffset);
        
        if (marketplaceDealsResponse.deals.length > 0) {
          console.log(`[fetchEbayData - Homepage Deals] Fallback to Marketplace Deals API succeeded with ${marketplaceDealsResponse.deals.length} deals.`);
          deals = marketplaceDealsResponse.deals;
          apiTotalDeals = marketplaceDealsResponse.total; // Use total from fallback
          usedFallbackSuccessfully = true;
        } else {
          console.log(`[fetchEbayData - Homepage Deals] Fallback to Marketplace Deals API also yielded 0 deals.`);
        }
        if (marketplaceDealsResponse.error && !combinedError) {
            combinedError = (combinedError ? combinedError + "; " : "") + `Marketplace Deals API Fallback: ${marketplaceDealsResponse.error}`;
        }
      }

      // Determine final displayQuery for deals
      if (isHomepageFetch) {
        if (usedFallbackSuccessfully || (deals.length > 0 && effectiveQuery === "")) { // If fallback used OR initial was general deals and successful
          displayQuery = "Today's Top Deals";
        } else if (deals.length > 0 && effectiveQuery) { // Themed query was successful (or no fallback needed and theme was present)
          displayQuery = `Deals for "${effectiveQuery.charAt(0).toUpperCase() + effectiveQuery.slice(1)}"`;
        } else { // No deals from theme, no deals from any fallback
          displayQuery = "Today's Top Deals"; // Default title if all else fails to get deals
        }
      } else { // User search
         displayQuery = userQuery; // For user search, title should reflect the search
      }

    } else if (fetchContext === 'auctionsOnly') {
      // Fallback logic for auctions (currently uses general search if themed auction search fails)
      const auctionData = await fetchAndProcessAuctions(effectiveQuery, auctionsOffset, AUCTIONS_INITIAL_FETCH_SIZE);
      auctions = auctionData.auctions;
      apiTotalAuctions = auctionData.total;
      if (auctionData.error) combinedError = (combinedError ? combinedError + "; " : "") + auctionData.error;

      let usedAuctionFallbackSuccessfully = false;
      if (isHomepageFetch && auctions.length === 0 && !auctionData.error && effectiveQuery !== "") {
        console.log(`[fetchEbayData - Homepage Auctions] Themed query "${effectiveQuery}" yielded 0 auctions. Attempting fallback to general auctions.`);
        const fallbackAuctionData = await fetchAndProcessAuctions("", auctionsOffset, AUCTIONS_INITIAL_FETCH_SIZE); // Empty query for general auctions
        if (fallbackAuctionData.auctions.length > 0) {
          console.log(`[fetchEbayData - Homepage Auctions] Fallback to general auctions succeeded with ${fallbackAuctionData.auctions.length} auctions.`);
          auctions = fallbackAuctionData.auctions;
          apiTotalAuctions = fallbackAuctionData.total;
          usedAuctionFallbackSuccessfully = true;
        } else {
          console.log(`[fetchEbayData - Homepage Auctions] Fallback to general auctions also yielded 0 auctions.`);
        }
        if (fallbackAuctionData.error && !combinedError) combinedError = (combinedError ? combinedError + "; " : "") + fallbackAuctionData.error;
      }


      // Determine final displayQuery for auctions
      if (isHomepageFetch) {
        if (usedAuctionFallbackSuccessfully || (auctions.length > 0 && effectiveQuery === "")) {
           displayQuery = "Trending Auctions";
        } else if (auctions.length > 0 && effectiveQuery) { // Themed query was successful
          displayQuery = `Auctions for "${effectiveQuery.charAt(0).toUpperCase() + effectiveQuery.slice(1)}"`;
        } else { // No auctions from theme or initial effectiveQuery was empty, or fallback failed
          displayQuery = "Trending Auctions";
        }
      } else { // User search
        displayQuery = userQuery;
      }
    }

    const finalHasMoreDealsOnServer = fetchContext === 'dealsOnly' && (dealsOffset + deals.length < apiTotalDeals);
    const finalHasMoreAuctionsOnServer = fetchContext === 'auctionsOnly' && (auctionsOffset + auctions.length < apiTotalAuctions);

    return {
      deals,
      auctions,
      error: combinedError,
      isHomepageContext: homepageContextFlag,
      searchQueryUsed: displayQuery, // This is the title to be displayed
      hasMoreDealsOnServer: finalHasMoreDealsOnServer,
      hasMoreAuctionsOnServer: finalHasMoreAuctionsOnServer,
      apiTotalDeals,
      apiTotalAuctions,
    };

  } catch (errorCatch) {
    console.error(`[fetchEbayData] CRITICAL ERROR (Query: "${userQuery}", Context: ${fetchContext}):`, errorCatch);
    if (errorCatch instanceof Error) {
      console.error(`[fetchEbayData] Error Name: ${errorCatch.name}`);
      console.error(`[fetchEbayData] Error Message: ${errorCatch.message}`);
      console.error(`[fetchEbayData] Error Stack: ${errorCatch.stack}`);
    }
    const userFriendlyMessage = "An unexpected error occurred while fetching data. Please try refreshing.";
    return {
      deals: [],
      auctions: [],
      error: userFriendlyMessage,
      isHomepageContext: homepageContextFlag,
      searchQueryUsed: isHomepageFetch ? (fetchContext === 'dealsOnly' ? "Today's Top Deals" : "Trending Auctions") : userQuery,
      hasMoreDealsOnServer: false,
      hasMoreAuctionsOnServer: false,
      apiTotalDeals: 0,
      apiTotalAuctions: 0,
    };
  }
}
