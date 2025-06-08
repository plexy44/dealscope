
// @ts-nocheck
// TODO: Resolve troubling TypeScript errors
'use server';

import type { Deal, Auction } from '@/types';

interface EbayToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// A more generic type to encompass fields from both ItemSummary (Browse API) and DealItem (Deal API)
interface EbayApiItem {
  itemId: string;
  title: string;
  itemHref?: string;
  itemWebUrl?: string; // Preferred link
  dealAffiliateWebUrl?: string; // From Deal API for affiliate links
  itemAffiliateWebUrl?: string; // From Browse API for affiliate links
  dealWebUrl?: string; // From Deal API non-affiliate
  image?: { imageUrl?: string };
  price?: { value: string; currency: string };
  itemEndDate?: string; // For auctions from Browse API
  condition?: string;
  seller?: { username?: string; feedbackPercentage?: string; feedbackScore?: number };
  buyingOptions?: string[]; // From Browse API
  categories?: Array<{ categoryId: string; categoryName?: string }>;
  marketingPrice?: {
    originalPrice?: { value: string; currency: string };
    discountPercentage?: string;
    discountAmount?: { value: string; currency: string }; // Sometimes available
  };
  shippingOptions?: Array<{
    shippingCostType?: string;
    shippingCost?: { value: string; currency: string };
    estimatedDeliveryDateRange?: { earliestDate?: string; latestDate?: string };
  }>;
  itemCreationDate?: string; // Can be used for postedDate from Browse API
  dealStartDate?: string; // From Deal API
  dealEndDate?: string; // From Deal API
  shortDescription?: string;
  watchCount?: number; // Added to capture watch count from Browse API
  errors?: any[]; // To catch item-level errors if any
}


interface EbayBrowseSearchResponse {
  itemSummaries?: EbayApiItem[];
  total?: number;
  warnings?: any[];
  errors?: any[];
}

interface EbayDealApiResponse {
  dealItems?: EbayApiItem[];
  total?: number;
  next?: string; // For pagination
  warnings?: any[];
  errors?: any[];
}

// Structure for RapidAPI items (adjust based on actual RapidAPI response)
interface RapidApiItem {
  itemId: string;
  title: string;
  price: {
    value: number; // Assuming number from RapidAPI
    currency: string;
  };
  image: string; // Assuming direct image URL string
  itemWebUrl: string;
  condition?: string;
  seller?: {
    username?: string;
    feedbackPercentage?: string;
    feedbackScore?: string; // Assuming string, might need parsing
  };
}

interface RapidApiResponse {
  results?: RapidApiItem[]; 
  total?: number; 
}


const KNOWN_EBAY_ERROR_URL = "https://www.ebay.com/n/error";
const PLACEHOLDER_URL = "#";

let tokenCache: { token: string; expiryTime: number } | null = null;

// Determine if Sandbox mode is enabled
const USE_SANDBOX = process.env.EBAY_USE_SANDBOX === 'true';

const EBAY_AUTH_URL = USE_SANDBOX 
  ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token' 
  : 'https://api.ebay.com/identity/v1/oauth2/token';

const EBAY_API_BASE_URL = USE_SANDBOX 
  ? 'https://api.sandbox.ebay.com' 
  : 'https://api.ebay.com';

async function getEbayAuthToken(): Promise<string> {
  if (tokenCache && tokenCache.expiryTime > Date.now()) {
    return tokenCache.token;
  }

  const clientId = USE_SANDBOX ? process.env.EBAY_SDXCLIENT_ID : process.env.EBAY_CLIENT_ID;
  const clientSecret = USE_SANDBOX ? process.env.EBAY_SDXCLIENT_SECRET : process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const mode = USE_SANDBOX ? 'Sandbox' : 'Production';
    throw new Error(`eBay API credentials for ${mode} mode (ID and Secret) are not set in .env`);
  }
  
  console.log(`[getEbayAuthToken] Using ${USE_SANDBOX ? 'Sandbox' : 'Production'} eBay credentials.`);

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const scopes = 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/buy.deal';


  try {
    const response = await fetch(EBAY_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: `grant_type=client_credentials&scope=${encodeURIComponent(scopes)}`,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`eBay Auth Error Response (${USE_SANDBOX ? 'Sandbox' : 'Production'}):`, errorBody);
      throw new Error(`eBay API authentication failed (${USE_SANDBOX ? 'Sandbox' : 'Production'}): ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const data: EbayToken = await response.json();
    tokenCache = {
      token: data.access_token,
      expiryTime: Date.now() + (data.expires_in - 300) * 1000, // 5 min buffer
    };
    return data.access_token;
  } catch (error) {
    console.error(`Error fetching eBay auth token (${USE_SANDBOX ? 'Sandbox' : 'Production'}):`, error);
    throw error;
  }
}

function getHighResImageUrl(url?: string): string | undefined {
  if (url && url.includes('i.ebayimg.com')) {
    return url.replace(/\/s-l\d+(\.\w+)/, '/s-l1600$1');
  }
  return url;
}

function formatSellerRating(seller?: { feedbackPercentage?: string; feedbackScore?: number | string }): string | undefined {
  if (!seller || !seller.feedbackPercentage) {
    return undefined;
  }
  let ratingString = `${seller.feedbackPercentage}%`;
  if (seller.feedbackScore !== undefined) {
    const score = typeof seller.feedbackScore === 'string' ? parseInt(seller.feedbackScore, 10) : seller.feedbackScore;
    if (!isNaN(score)) {
      ratingString += ` (${score.toLocaleString('en-US')})`;
    }
  }
  return ratingString;
}

function logRateLimitHeaders(response: Response, context: string) {
  const headersToLog = [
    'X-EBAY-API-CALL-LIMIT', 'X-EBAY-API-CALL-REMAINING',
    'X-EBAY-API-POOLNAME', 'X-EBAY-API-RESOURCE-NAME',
    'X-EBAY-API-APP-DAILY-LIMIT', 'X-EBAY-API-APP-DAILY-REMAINING',
    'X-EBAY-API-USER-DAILY-LIMIT', 'X-EBAY-API-USER-DAILY-REMAINING',
    'RateCalculation', 
    'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After', 
    'x-ratelimit-requests-limit', 'x-ratelimit-requests-remaining', 
    'x-ratelimit-results-limit', 'x-ratelimit-results-remaining', 
  ];
  let rateLimitInfo = "";
  let foundHeaders = false;
  headersToLog.forEach(headerName => {
    const headerValue = response.headers.get(headerName);
    if (headerValue) {
      rateLimitInfo += `${headerName}: ${headerValue}; `;
      foundHeaders = true;
    }
  });
  if (foundHeaders) {
    console.log(`[eBay Service - ${context} (${USE_SANDBOX ? 'Sandbox' : 'Production'})] Rate Limit Info: ${rateLimitInfo}`);
  }
}

function mapRapidApiItemToDeal(item: RapidApiItem): Deal | null {
  if (!item.itemId || item.itemId.trim() === "") {
    console.warn(`[mapRapidApiItemToDeal] Item missing or empty itemId. Filtering out.`);
    return null;
  }
  if (!item.title || item.title.trim() === "") {
    console.warn(`[mapRapidApiItemToDeal] Item ID ${item.itemId} missing or empty title. Filtering out.`);
    return null;
  }
  if (!item.price?.value || !item.price?.currency) {
    console.warn(`[mapRapidApiItemToDeal] Item ID ${item.itemId} ('${item.title.substring(0,30)}...') missing price information. Filtering out.`);
    return null;
  }
  if (!item.image || item.image.trim() === "") {
     console.warn(`[mapRapidApiItemToDeal] Item ID ${item.itemId} ('${item.title.substring(0,30)}...') missing image URL. Filtering out.`);
    return null;
  }
  if (!item.itemWebUrl || item.itemWebUrl.trim() === "" || !(item.itemWebUrl.startsWith('http://') || item.itemWebUrl.startsWith('https://'))) {
    console.warn(`[mapRapidApiItemToDeal] Item ID ${item.itemId} ('${item.title.substring(0,30)}...') has no valid eBay link. Filtering out.`);
    return null;
  }

  return {
    id: item.itemId,
    title: item.title,
    price: `${item.price.currency} ${item.price.value.toFixed(2)}`,
    imageUrl: getHighResImageUrl(item.image) as string,
    dataAiHint: item.title.split(' ').slice(0, 2).join(' ').toLowerCase(),
    ebayLink: item.itemWebUrl,
    itemCondition: item.condition,
    sellerRating: formatSellerRating(item.seller),
    buyingOption: "Buy It Now", 
    shortDescription: item.title, 
  };
}


function mapApiItemToDeal(item: EbayApiItem): Deal | null {
  if (!item.itemId || item.itemId.trim() === "") {
    console.warn(`[mapApiItemToDeal] Item missing or empty itemId. Filtering out.`);
    return null;
  }
  if (!item.title || item.title.trim() === "") {
    console.warn(`[mapApiItemToDeal] Item ID ${item.itemId} missing or empty title. Filtering out.`);
    return null;
  }
  if (!item.price?.value || item.price.value.trim() === "" || !item.price?.currency || item.price.currency.trim() === "") {
    console.warn(`[mapApiItemToDeal] Item ID ${item.itemId} ('${item.title.substring(0,30)}...') missing price information. Filtering out.`);
    return null;
  }
  if (!item.image?.imageUrl || item.image.imageUrl.trim() === "") {
    console.warn(`[mapApiItemToDeal] Item ID ${item.itemId} ('${item.title.substring(0,30)}...') missing API-provided image.imageUrl or it's empty. Filtering out.`);
    return null;
  }

  let validEbayLink: string | undefined;
  const potentialLinkFields = [
    item.dealAffiliateWebUrl,
    item.itemAffiliateWebUrl,
    item.itemWebUrl,
    item.dealWebUrl,
    item.itemHref
  ].filter(Boolean); 

  for (const link of potentialLinkFields) {
    if (typeof link === 'string' && link.trim() !== '' && (link.startsWith('http://') || link.startsWith('https://'))) {
      if (link !== KNOWN_EBAY_ERROR_URL && link !== PLACEHOLDER_URL) {
        validEbayLink = link;
        break;
      }
    }
  }

  if (!validEbayLink) {
    const allApiLinks = potentialLinkFields.join('; ') || 'None';
    console.warn(`[mapApiItemToDeal] Item ID ${item.itemId} ('${item.title.substring(0,30)}...') has NO valid eBay link after checking all sources. API links: [${allApiLinks}]. Filtering out.`);
    return null;
  }

  let discountPercentageStr: string | undefined;
  let originalPriceStr: string | undefined = item.marketingPrice?.originalPrice?.value && item.marketingPrice?.originalPrice?.currency
    ? `${item.marketingPrice.originalPrice.currency} ${item.marketingPrice.originalPrice.value}`
    : undefined;

  const currentPriceNum = parseFloat(item.price.value);
  const originalPriceNum = item.marketingPrice?.originalPrice?.value ? parseFloat(item.marketingPrice.originalPrice.value) : NaN;

  let calculatedDiscount = 0;
  if (!isNaN(currentPriceNum) && !isNaN(originalPriceNum) && originalPriceNum > 0 && originalPriceNum > currentPriceNum) {
    calculatedDiscount = Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100);
  }

  let apiDiscountNum = 0;
  if (item.marketingPrice?.discountPercentage) {
    const apiDiscountRaw = item.marketingPrice.discountPercentage.replace('%', '');
    const parsedApiDiscount = parseFloat(apiDiscountRaw);
    if (!isNaN(parsedApiDiscount) && parsedApiDiscount > 0) {
      apiDiscountNum = Math.round(parsedApiDiscount);
    }
  }

  if (calculatedDiscount > 0) {
    discountPercentageStr = calculatedDiscount.toString();
    if (!originalPriceStr && !isNaN(originalPriceNum)) {
        originalPriceStr = `${item.price.currency} ${originalPriceNum.toFixed(2)}`;
    }
  } else if (apiDiscountNum > 0) {
    discountPercentageStr = apiDiscountNum.toString();
    if (!originalPriceStr && !isNaN(currentPriceNum) && apiDiscountNum > 0 && apiDiscountNum < 100) {
        const inferredOriginal = currentPriceNum / (1 - (apiDiscountNum / 100));
        originalPriceStr = `${item.price.currency} ${inferredOriginal.toFixed(2)}`;
    }
  }
  

  const postedDate = item.itemCreationDate ? new Date(item.itemCreationDate).toLocaleDateString() :
                     item.dealStartDate ? new Date(item.dealStartDate).toLocaleDateString() : undefined;
  
  const deliveryTime = item.shippingOptions?.[0]?.estimatedDeliveryDateRange && item.shippingOptions[0].estimatedDeliveryDateRange.earliestDate && item.shippingOptions[0].estimatedDeliveryDateRange.latestDate
    ? `${new Date(item.shippingOptions[0].estimatedDeliveryDateRange.earliestDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${new Date(item.shippingOptions[0].estimatedDeliveryDateRange.latestDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
    : undefined;
    
  return {
    id: item.itemId,
    title: item.title,
    price: `${item.price.currency} ${item.price.value}`,
    originalPrice: originalPriceStr,
    discountPercentage: discountPercentageStr, 
    imageUrl: getHighResImageUrl(item.image.imageUrl) as string,
    dataAiHint: item.title.split(' ').slice(0, 2).join(' ').toLowerCase(),
    ebayLink: validEbayLink,
    postedDate: postedDate,
    deliveryTime: deliveryTime,
    category: item.categories?.[0]?.categoryName || 'General',
    itemCondition: item.condition,
    sellerRating: formatSellerRating(item.seller),
    buyingOption: item.buyingOptions?.includes('AUCTION') ? 'Auction' : 'Buy It Now',
    shortDescription: item.shortDescription,
    watchCount: typeof item.watchCount === 'number' ? item.watchCount : undefined,
  };
}

function mapApiItemToAuction(item: EbayApiItem): Auction | null {
  const shortTitle = item.title ? `'${item.title.substring(0,30)}...'` : 'Untitled Item';

  if (!item.itemId || item.itemId.trim() === "") {
    console.warn(`[mapApiItemToAuction] Item ${shortTitle} missing or empty itemId. Filtering out.`);
    return null;
  }
  if (!item.title || item.title.trim() === "") {
    console.warn(`[mapApiItemToAuction] Item ID ${item.itemId} missing or empty title. Filtering out.`);
    return null;
  }
  if (!item.price?.value || item.price.value.trim() === "" || !item.price?.currency || item.price.currency.trim() === "") {
    console.warn(`[mapApiItemToAuction] Item ID ${item.itemId} (${shortTitle}) missing current bid information. Filtering out.`);
    return null;
  }
   if (!item.image?.imageUrl || item.image.imageUrl.trim() === "") {
    console.warn(`[mapApiItemToAuction] Item ID ${item.itemId} (${shortTitle}) missing API-provided image.imageUrl or it's empty. Filtering out.`);
    return null;
  }
  
  const endTime = item.itemEndDate || item.dealEndDate;
  if (!endTime || endTime.trim() === "") {
    console.warn(`[mapApiItemToAuction] Item ID ${item.itemId} (${shortTitle}) missing end time. Filtering out.`);
    return null;
  }

  let validEbayLink: string | undefined;
  const potentialLinkFields = [
    item.itemAffiliateWebUrl, 
    item.itemWebUrl,
    item.itemHref
  ].filter(Boolean);

  for (const link of potentialLinkFields) {
    if (typeof link === 'string' && link.trim() !== '' && (link.startsWith('http://') || link.startsWith('https://'))) {
      if (link !== KNOWN_EBAY_ERROR_URL && link !== PLACEHOLDER_URL) {
        validEbayLink = link;
        break;
      }
    }
  }

  if (!validEbayLink) {
    const allApiLinks = potentialLinkFields.join('; ') || 'None';
    console.warn(`[mapApiItemToAuction] Item ID ${item.itemId} (${shortTitle}) has NO valid eBay link after checking all sources. API links: [${allApiLinks}]. Filtering out.`);
    return null;
  }
  
  const deliveryTime = item.shippingOptions?.[0]?.estimatedDeliveryDateRange && item.shippingOptions[0].estimatedDeliveryDateRange.earliestDate && item.shippingOptions[0].estimatedDeliveryDateRange.latestDate
    ? `${new Date(item.shippingOptions[0].estimatedDeliveryDateRange.earliestDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${new Date(item.shippingOptions[0].estimatedDeliveryDateRange.latestDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
    : undefined;

  return {
    id: item.itemId,
    title: item.title,
    currentBid: `${item.price.currency} ${item.price.value}`,
    endTime: endTime,
    imageUrl: getHighResImageUrl(item.image.imageUrl) as string,
    dataAiHint: item.title.split(' ').slice(0, 2).join(' ').toLowerCase(),
    ebayLink: validEbayLink,
    deliveryTime: deliveryTime,
    itemCondition: item.condition,
    sellerRating: formatSellerRating(item.seller),
    shortDescription: item.shortDescription,
    watchCount: typeof item.watchCount === 'number' ? item.watchCount : undefined,
  };
}


export async function searchEbayItems(
  query: string,
  limit: number = 20,
  offset: number = 0,
  options?: { searchMode?: 'deals' | 'auctions' | 'all' }
): Promise<{ deals: Deal[]; auctions: Auction[]; total: number; error?: string }> {
  let token;
  try {
    token = await getEbayAuthToken();
  } catch (authError) {
    const userFriendlyError = `Authentication with eBay (${USE_SANDBOX ? 'Sandbox' : 'Production'}) failed. Please try again later.`;
    console.error(`Authentication error in searchEbayItems: ${authError instanceof Error ? authError.message : authError}`);
    return {
      deals: [],
      auctions: [],
      total: 0,
      error: userFriendlyError,
    };
  }

  const browseApiUrl = new URL(`${EBAY_API_BASE_URL}/buy/browse/v1/item_summary/search`); 
  browseApiUrl.searchParams.append('q', query);
  browseApiUrl.searchParams.append('limit', limit.toString());
  browseApiUrl.searchParams.append('offset', offset.toString());
  browseApiUrl.searchParams.append('fieldgroups', 'PRODUCT,COMPACT,SELLER_DETAILS,SHIPPING_DETAILS,TAXONOMY_DETAILS,WATCH_COUNT_DETAILS');

  const searchMode = options?.searchMode || 'all';
  if (searchMode === 'auctions') {
    browseApiUrl.searchParams.append('filter', 'buyingOptions:{AUCTION}');
  } else if (searchMode === 'deals') {
    // No specific filter, broader set for AI ranking
  }
  
  const apiUrlString = browseApiUrl.toString();
  console.log(`[searchEbayItems (${USE_SANDBOX ? 'Sandbox' : 'Production'})] Calling eBay API. Query: "${query}", Mode: ${searchMode}, URL: ${apiUrlString}`);
  
  try {
    const response = await fetch(apiUrlString, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB', // Sandbox usually uses production marketplace IDs for testing structure
      },
      cache: 'no-store',
    });

    logRateLimitHeaders(response, `Search - Query: ${query.substring(0, 30)}...`);

    if (!response.ok) {
      const errorBody = await response.text();
      const userFriendlyError = `eBay (${USE_SANDBOX ? 'Sandbox' : 'Production'}) returned an error while searching for items. (Status: ${response.status})`;
      console.error(`eBay Browse API search Error: ${response.status} ${response.statusText}. ${errorBody}`);
      return { deals: [], auctions: [], total: 0, error: userFriendlyError };
    }

    const data: EbayBrowseSearchResponse = await response.json();
    console.log(`[searchEbayItems Raw API Response (${USE_SANDBOX ? 'Sandbox' : 'Production'})] Query: "${query}", Mode: ${searchMode}. Fetched raw itemSummaries: ${data.itemSummaries?.length || 0}, API total for this filtered query: ${data.total || 0}`);


    if (data.errors && data.errors.length > 0) {
      const errorDetail = `eBay Browse API search returned errors: ${JSON.stringify(data.errors)}`;
      console.warn(errorDetail); 
    }

    const deals: Deal[] = [];
    const auctions: Auction[] = [];
    let rawAuctionCount = 0;
    let rawDealCount = 0;

    if (data.itemSummaries && data.itemSummaries.length > 0) {
      data.itemSummaries.forEach(item => {
        if (item.errors && item.errors.length > 0) {
          console.warn(`[searchEbayItems] Item ID ${item.itemId || 'Unknown'} has API-level errors: ${JSON.stringify(item.errors)}. Skipping.`);
          return;
        }

        const isAuctionItem = item.buyingOptions && Array.isArray(item.buyingOptions) && item.buyingOptions.includes('AUCTION');

        if (searchMode === 'auctions') {
          rawAuctionCount++;
          const auctionItem = mapApiItemToAuction(item);
          if (auctionItem) {
            auctions.push(auctionItem);
          }
        } else if (searchMode === 'deals' || searchMode === 'all') {
          if (isAuctionItem) {
            rawAuctionCount++;
            const auctionItem = mapApiItemToAuction(item);
            if (auctionItem) auctions.push(auctionItem); 
          } else {
            rawDealCount++;
            const dealItem = mapApiItemToDeal(item);
            if (dealItem) { 
              deals.push(dealItem);
            }
          }
        }
      });
    }
    
    console.log(`[searchEbayItems Mapped Counts (${USE_SANDBOX ? 'Sandbox' : 'Production'})] For query "${query}", Mode: ${searchMode}. Raw API Items: ${data.itemSummaries?.length || 0} (Deals-like: ${rawDealCount}, Auctions-like: ${rawAuctionCount}). Mapped Deals: ${deals.length}, Mapped Auctions: ${auctions.length}. API Reported Total: ${data.total || 0}`);
    
    return {
      deals,
      auctions,
      total: data.total || 0, 
      error: (data.errors && data.errors.length > 0 && deals.length === 0 && auctions.length === 0) ? `eBay API reported issues with some data.` : undefined,
    };

  } catch (fetchError) {
    const userFriendlyError = `A network error occurred while searching eBay items (${USE_SANDBOX ? 'Sandbox' : 'Production'}). Please check your connection.`;
    console.error(`Network or other error searching eBay items (query: "${query}", mode: ${searchMode}):`, fetchError);
    return { deals: [], auctions: [], total: 0, error: userFriendlyError };
  }
}


export async function searchEbayRapidAPI(
  query: string,
  limit: number = 20 
): Promise<{ deals: Deal[]; total: number; error?: string }> {
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST;

  if (!apiKey || !apiHost) {
    console.error('RapidAPI key or host is not configured in environment variables.');
    return { deals: [], total: 0, error: 'RapidAPI configuration missing.' };
  }

  const rapidApiUrl = `https://${apiHost}/search/${encodeURIComponent(query)}`;
  
  console.log(`[searchEbayRapidAPI] Calling RapidAPI. Query: "${query}", URL: ${rapidApiUrl}`);

  try {
    const response = await fetch(rapidApiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
      },
      cache: 'no-store',
    });

    logRateLimitHeaders(response, `RapidAPI Search - Query: ${query.substring(0,30)}...`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`RapidAPI Error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
      return { deals: [], total: 0, error: `RapidAPI request failed with status ${response.status}` };
    }

    const data: RapidApiResponse = await response.json();
    
    const items = data.results || [];
    console.log(`[searchEbayRapidAPI Raw API Response] Query: "${query}". Fetched raw items: ${items.length}, API total (if available): ${data.total || 'N/A'}`);


    const deals: Deal[] = items.map(mapRapidApiItemToDeal).filter((deal): deal is Deal => deal !== null);
    
    console.log(`[searchEbayRapidAPI Mapped Counts] For query "${query}". Mapped Deals: ${deals.length}. RapidAPI Reported Total (if available): ${data.total || 'N/A'}`);

    return { deals, total: data.total || deals.length, error: undefined };

  } catch (fetchError) {
    console.error(`Network or other error searching with RapidAPI (query: "${query}"):`, fetchError);
    return { deals: [], total: 0, error: 'A network error occurred while using RapidAPI.' };
  }
}


export async function fetchEbayItemDetails(itemId: string): Promise<Deal | null> {
  if (!itemId || itemId.trim() === "") {
     console.warn("[fetchEbayItemDetails] Attempted to fetch details for an empty itemId.");
     return null;
  }
  let token;
  try {
    token = await getEbayAuthToken();
  } catch (authError) {
    console.error(`Authentication error in fetchEbayItemDetails for itemId ${itemId} (${USE_SANDBOX ? 'Sandbox' : 'Production'}): ${authError instanceof Error ? authError.message : authError}`);
    return null; 
  }

  const itemDetailUrl = `${EBAY_API_BASE_URL}/buy/browse/v1/item/${encodeURIComponent(itemId)}?fieldgroups=PRODUCT,COMPACT,SELLER_DETAILS,SHIPPING_DETAILS,TAXONOMY_DETAILS,WATCH_COUNT_DETAILS`; 

  try {
    const response = await fetch(itemDetailUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB',
      },
      cache: 'no-store',
    });

    logRateLimitHeaders(response, `Item Details - ID: ${itemId}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error fetching details for item ${itemId} (${USE_SANDBOX ? 'Sandbox' : 'Production'}): ${response.status} ${response.statusText} - ${errorBody}`);
      return null;
    }

    const itemData: EbayApiItem = await response.json(); 
     if (itemData.errors && itemData.errors.length > 0) {
        console.warn(`[fetchEbayItemDetails] Item ID ${itemId} returned API errors: ${JSON.stringify(itemData.errors)}. Cannot map to deal.`);
        return null;
    }
    
    const deal = mapApiItemToDeal(itemData); 
    if (!deal) {
        console.warn(`[fetchEbayItemDetails] Item ID ${itemId} could not be mapped to a Deal object after fetching details.`);
        return null;
    }
    return deal;

  } catch (error) {
    console.error(`Network or other error fetching details for item ${itemId} (${USE_SANDBOX ? 'Sandbox' : 'Production'}):`, error);
    return null;
  }
}

export async function fetchEbayMarketplaceDeals(
  categoryIds?: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ deals: Deal[]; total: number; error?: string }> {
  let token;
  try {
    token = await getEbayAuthToken();
  } catch (authError) {
    const userFriendlyError = `Authentication with eBay (${USE_SANDBOX ? 'Sandbox' : 'Production'}) failed. Please try again later.`;
    console.error(`Authentication error in fetchEbayMarketplaceDeals: ${authError instanceof Error ? authError.message : authError}`);
    return { deals: [], total: 0, error: userFriendlyError };
  }
  
  let dealApiUrl = `${EBAY_API_BASE_URL}/buy/deal/v1/deal_item?limit=${limit}&offset=${offset}`; 
  if (categoryIds) {
    dealApiUrl += `&category_ids=${encodeURIComponent(categoryIds)}`;
  }
  // Note: The Deal API might not be fully supported or might behave differently in Sandbox.
  // Production Deal API: https://api.ebay.com/buy/deal/v1/deal_item
  // Sandbox Deal API might be: https://api.sandbox.ebay.com/buy/deal/v1/deal_item (confirm from eBay docs)

  try {
    const response = await fetch(dealApiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB', // Using GB for consistency, Sandbox may require specific settings or may not fully support all marketplaces for Deal API.
      },
      cache: 'no-store',
    });

    logRateLimitHeaders(response, `Marketplace Deals - Category: ${categoryIds || 'All'}`);

    if (!response.ok) {
      const errorBody = await response.text();
      const errorType = response.status === 403 ? "Forbidden (check API scopes or permissions)" : `${response.status} ${response.statusText}`;
      const userFriendlyError = `eBay (${USE_SANDBOX ? 'Sandbox' : 'Production'}) returned an error while fetching marketplace deals. (Type: ${errorType})`;
      console.error(`eBay Deal API Error: ${errorType}. ${errorBody}`);
      return { deals: [], total: 0, error: userFriendlyError };
    }

    const data: EbayDealApiResponse = await response.json();

    if (data.errors && data.errors.length > 0) {
      const userFriendlyError = `eBay's Deal API (${USE_SANDBOX ? 'Sandbox' : 'Production'}) reported an issue while fetching deals.`;
      console.error(`eBay Deal API returned errors: ${JSON.stringify(data.errors)}`);
      return { deals: [], total: 0, error: userFriendlyError };
    }

    const deals = data.dealItems
        ? data.dealItems.map(mapApiItemToDeal).filter((deal): deal is Deal => deal !== null)
        : [];
    return { deals, total: data.total || 0, error: undefined };

  } catch (fetchError) {
    const userFriendlyError = `A network error occurred while fetching marketplace deals (${USE_SANDBOX ? 'Sandbox' : 'Production'}). Please check your connection.`;
    console.error('Network or other error fetching eBay marketplace deals:', fetchError);
    return { deals: [], total: 0, error: userFriendlyError };
  }
}
