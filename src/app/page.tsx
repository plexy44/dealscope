
"use client";
import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DealCard from '@/components/deals/DealCard';
import AuctionCard from '@/components/auctions/AuctionCard';
import type { Deal, Auction } from '@/types';
import { ShoppingCart, Tag, Bot, PackageSearch } from 'lucide-react';
import { fetchEbayData } from '@/app/actions/productActions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const INITIAL_DISPLAY_COUNT = 16;
const LOAD_MORE_INCREMENT = 16;

function parseSellerRating(ratingStr?: string): number {
  if (!ratingStr) return -1;
  const match = ratingStr.match(/^(\d+(\.\d+)?)\%/);
  return match ? parseFloat(match[1]) : -1;
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q');
  const viewFromUrl = searchParams.get('view') || 'deals';

  // Data for current display
  const [allFetchedDeals, setAllFetchedDeals] = useState<Deal[]>([]);
  const [allFetchedAuctions, setAllFetchedAuctions] = useState<Auction[]>([]);
  const [dealsToDisplay, setDealsToDisplay] = useState<Deal[]>([]);
  const [auctionsToDisplay, setAuctionsToDisplay] = useState<Auction[]>([]);

  // Pagination and loading states
  const [numDealsToShow, setNumDealsToShow] = useState(INITIAL_DISPLAY_COUNT);
  const [numAuctionsToShow, setNumAuctionsToShow] = useState(INITIAL_DISPLAY_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string | null>(queryFromUrl); // Tracks the active query
  const [isHomepageContext, setIsHomepageContext] = useState<boolean>(!queryFromUrl);
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination flags
  const [hasMoreDealsOnServer, setHasMoreDealsOnServer] = useState(false);
  const [hasMoreAuctionsOnServer, setHasMoreAuctionsOnServer] = useState(false);

  // Fallback data states
  const [fallbackDeals, setFallbackDeals] = useState<Deal[]>([]);
  const [isLoadingFallbackDeals, setIsLoadingFallbackDeals] = useState(false);
  const [fallbackAuctions, setFallbackAuctions] = useState<Auction[]>([]);
  const [isLoadingFallbackAuctions, setIsLoadingFallbackAuctions] = useState(false);

  // Client-side cache for homepage data
  const [cachedHomepageDeals, setCachedHomepageDeals] = useState<Deal[]>([]);
  const [hasFetchedHomepageDeals, setHasFetchedHomepageDeals] = useState(false);
  const [apiTotalDealsForHomepageCache, setApiTotalDealsForHomepageCache] = useState(0);
  const [cachedHomepageHasMoreDeals, setCachedHomepageHasMoreDeals] = useState(false);


  const [cachedHomepageAuctions, setCachedHomepageAuctions] = useState<Auction[]>([]);
  const [hasFetchedHomepageAuctions, setHasFetchedHomepageAuctions] = useState(false);
  const [apiTotalAuctionsForHomepageCache, setApiTotalAuctionsForHomepageCache] = useState(0);
  const [cachedHomepageHasMoreAuctions, setCachedHomepageHasMoreAuctions] = useState(false);


  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const contextForFetch: 'dealsOnly' | 'auctionsOnly' = viewFromUrl === 'auctions' ? 'auctionsOnly' : 'dealsOnly';
    let newSearchOrViewSwitch = false;

    // --- CACHE LOGIC for HOMEPAGE ---
    if (!queryFromUrl) { // Homepage context (no search query)
      if (currentSearchQuery !== null) newSearchOrViewSwitch = true; // Transitioning from search to homepage
      setCurrentSearchQuery(null);
      setIsHomepageContext(true);

      if (contextForFetch === 'dealsOnly') {
        if (hasFetchedHomepageDeals) {
          console.log(`[Cache] Using cached homepage deals. Cached count: ${cachedHomepageDeals.length}. Displaying up to: ${newSearchOrViewSwitch ? INITIAL_DISPLAY_COUNT : numDealsToShow}`);
          setAllFetchedDeals(cachedHomepageDeals);
          setDealsToDisplay(cachedHomepageDeals.slice(0, newSearchOrViewSwitch ? INITIAL_DISPLAY_COUNT : numDealsToShow));
          if(newSearchOrViewSwitch) setNumDealsToShow(INITIAL_DISPLAY_COUNT);
          setHasMoreDealsOnServer(cachedHomepageHasMoreDeals);
          setCurrentSearchQuery("Today's Top Deals"); // Updated here for better title sync
          setAllFetchedAuctions([]); setAuctionsToDisplay([]); setHasMoreAuctionsOnServer(false);
          setIsLoading(false); return;
        } else { // Cache miss for homepage deals
          newSearchOrViewSwitch = true; // Treat as new fetch
          console.log("[Homepage Deals Cache Miss] First time fetching or cache invalidated.");
        }
      } else if (contextForFetch === 'auctionsOnly') {
        if (hasFetchedHomepageAuctions) {
          console.log(`[Cache] Using cached homepage auctions. Cached count: ${cachedHomepageAuctions.length}. Displaying up to: ${newSearchOrViewSwitch ? INITIAL_DISPLAY_COUNT : numAuctionsToShow}`);
          setAllFetchedAuctions(cachedHomepageAuctions);
          setAuctionsToDisplay(cachedHomepageAuctions.slice(0, newSearchOrViewSwitch ? INITIAL_DISPLAY_COUNT : numAuctionsToShow));
          if(newSearchOrViewSwitch) setNumAuctionsToShow(INITIAL_DISPLAY_COUNT);
          setHasMoreAuctionsOnServer(cachedHomepageHasMoreAuctions);
          setCurrentSearchQuery("Trending Auctions"); // Updated here for better title sync
          setAllFetchedDeals([]); setDealsToDisplay([]); setHasMoreDealsOnServer(false);
          setIsLoading(false); return;
        } else { // Cache miss for homepage auctions
          newSearchOrViewSwitch = true; // Treat as new fetch
          console.log("[Homepage Auctions Cache Miss] First time fetching or cache invalidated.");
        }
      }
    } else { // User is searching (queryFromUrl is present)
      setIsHomepageContext(false);
      if (queryFromUrl !== currentSearchQuery || (currentSearchQuery === null && queryFromUrl)) {
        newSearchOrViewSwitch = true; // New search or transition from homepage to search
        console.log(`New search initiated: from '${currentSearchQuery || "homepage"}' to '${queryFromUrl}'.`);
      }
      setCurrentSearchQuery(queryFromUrl);
    }
    // --- END CACHE LOGIC ---

    // If it's a new search or view switch, reset display counts and clear displayed items
    if (newSearchOrViewSwitch) {
      console.log("[State Reset] New search or view switch detected. Resetting display counts and clearing items.");
      setNumDealsToShow(INITIAL_DISPLAY_COUNT);
      setNumAuctionsToShow(INITIAL_DISPLAY_COUNT);
      setDealsToDisplay([]);
      setAuctionsToDisplay([]);
      setAllFetchedDeals([]);
      setAllFetchedAuctions([]);
    } else {
      // If not a new search/switch (e.g. just loading more of existing view), still set isLoading
      // but don't clear items here, as `fetchEbayData` might be for "load more" (not implemented yet, but for future)
      // However, for initial load, if cache was not hit, items would be empty anyway.
      // Let's ensure items are cleared if not from cache.
       if (contextForFetch === 'dealsOnly' && !cachedHomepageDeals.length && !queryFromUrl) setDealsToDisplay([]);
       if (contextForFetch === 'auctionsOnly' && !cachedHomepageAuctions.length && !queryFromUrl) setAuctionsToDisplay([]);
    }


    setFallbackDeals([]); setIsLoadingFallbackDeals(false);
    setFallbackAuctions([]); setIsLoadingFallbackAuctions(false);

    try {
      // Explicitly clear items for the view being fetched if it's an initial load for that view type
      if (contextForFetch === 'dealsOnly' && newSearchOrViewSwitch) {
        setDealsToDisplay([]); setAllFetchedDeals([]);
      } else if (contextForFetch === 'auctionsOnly' && newSearchOrViewSwitch) {
        setAuctionsToDisplay([]); setAllFetchedAuctions([]);
      }


      const mainResponse = await fetchEbayData(
        queryFromUrl || "",
        0, // dealsOffset: current pagination logic is client-side after initial large fetch
        0, // auctionsOffset: current pagination logic is client-side
        contextForFetch
      );

      const {
        deals: fetchedDealsData,
        auctions: fetchedAuctionsData,
        error: apiError,
        searchQueryUsed, // This comes from fetchEbayData (can be theme name)
        hasMoreDealsOnServer: apiHasMoreDeals,
        hasMoreAuctionsOnServer: apiHasMoreAuctions,
        apiTotalDeals,
        apiTotalAuctions
      } = mainResponse;

      // Update currentSearchQuery with the title from API (e.g. "Deals for Laptop")
      // only if it's a homepage context and a specific query was used by API
      if (!queryFromUrl && searchQueryUsed && (searchQueryUsed.startsWith("Deals for") || searchQueryUsed.startsWith("Auctions for"))) {
        setCurrentSearchQuery(searchQueryUsed);
      } else if (queryFromUrl) {
        setCurrentSearchQuery(queryFromUrl); // Ensure user search query is set
      } else if (!queryFromUrl && contextForFetch === 'dealsOnly') {
        setCurrentSearchQuery("Today's Top Deals");
      } else if (!queryFromUrl && contextForFetch === 'auctionsOnly') {
        setCurrentSearchQuery("Trending Auctions");
      }


      if (apiError) setError(apiError);

      if (contextForFetch === 'dealsOnly') {
        setHasMoreDealsOnServer(apiHasMoreDeals || false);
        let sortedDeals = fetchedDealsData ? [...fetchedDealsData] : [];
        // Client-side sorting (AI ranker should ideally handle primary sorting)
        // This sort is a fallback/secondary refinement if AI doesn't fully sort by discount
        if (sortedDeals.length > 0) {
          sortedDeals.sort((a, b) => {
            const discountA = parseFloat(a.discountPercentage || "0");
            const discountB = parseFloat(b.discountPercentage || "0");
            if (discountB !== discountA) return discountB - discountA; // Primary: discount
             // Secondary: price (lower is better for deals)
            const priceA = parseFloat(a.price?.split(" ")[1] || "Infinity");
            const priceB = parseFloat(b.price?.split(" ")[1] || "Infinity");
            return priceA - priceB;
          });
        }
        setAllFetchedDeals(sortedDeals);
        setDealsToDisplay(sortedDeals.slice(0, newSearchOrViewSwitch ? INITIAL_DISPLAY_COUNT : numDealsToShow));
        setAllFetchedAuctions([]); setAuctionsToDisplay([]); setHasMoreAuctionsOnServer(false);

        if (!queryFromUrl) { // If it was a homepage fetch, store in cache
            console.log(`[Cache Store] Storing homepage deals. Fetched: ${sortedDeals.length}, API Total: ${apiTotalDeals}, HasMoreServer: ${apiHasMoreDeals}`);
            setCachedHomepageDeals(sortedDeals);
            setApiTotalDealsForHomepageCache(apiTotalDeals || 0);
            setCachedHomepageHasMoreDeals(apiHasMoreDeals || false);
            setHasFetchedHomepageDeals(true);
        }

        if (queryFromUrl && sortedDeals.length === 0 && !apiError) {
          setIsLoadingFallbackDeals(true);
          console.log("[loadInitialData] User search yielded no deals, fetching fallback recommendations.");
          try {
            const fallbackResponse = await fetchEbayData("", 0, 0, 'dealsOnly'); // Fetch general deals
            if (fallbackResponse.deals && fallbackResponse.deals.length > 0) {
              let sortedFallbackDeals = [...fallbackResponse.deals].sort((a,b) => parseFloat(b.discountPercentage || "0") - parseFloat(a.discountPercentage || "0"));
              setFallbackDeals(sortedFallbackDeals.slice(0, INITIAL_DISPLAY_COUNT));
            } else { setFallbackDeals([]); }
          } catch (fallbackErr) { console.error("Error fetching fallback deals:", fallbackErr); setFallbackDeals([]); }
          finally { setIsLoadingFallbackDeals(false); }
        }

      } else if (contextForFetch === 'auctionsOnly') {
        setHasMoreAuctionsOnServer(apiHasMoreAuctions || false);
        let sortedAuctions = fetchedAuctionsData ? [...fetchedAuctionsData] : [];
        // Client-side sorting for auctions
        if (sortedAuctions.length > 0) {
          sortedAuctions.sort((a, b) => {
            const endTimeA = a.endTime ? new Date(a.endTime).getTime() : Infinity;
            const endTimeB = b.endTime ? new Date(b.endTime).getTime() : Infinity;
            if (endTimeA !== endTimeB) return endTimeA - endTimeB; // Ending soonest first
            const ratingA = parseSellerRating(a.sellerRating);
            const ratingB = parseSellerRating(b.sellerRating);
            if (ratingA !== ratingB) return ratingB - ratingA; // Higher seller rating
            const watchCountA = a.watchCount || 0;
            const watchCountB = b.watchCount || 0;
            return watchCountB - watchCountA; // More watchers
          });
        }
        setAllFetchedAuctions(sortedAuctions);
        setAuctionsToDisplay(sortedAuctions.slice(0, newSearchOrViewSwitch ? INITIAL_DISPLAY_COUNT : numAuctionsToShow));
        setAllFetchedDeals([]); setDealsToDisplay([]); setHasMoreDealsOnServer(false);

        if (!queryFromUrl) { // If it was a homepage fetch, store in cache
            console.log(`[Cache Store] Storing homepage auctions. Fetched: ${sortedAuctions.length}, API Total: ${apiTotalAuctions}, HasMoreServer: ${apiHasMoreAuctions}`);
            setCachedHomepageAuctions(sortedAuctions);
            setApiTotalAuctionsForHomepageCache(apiTotalAuctions || 0);
            setCachedHomepageHasMoreAuctions(apiHasMoreAuctions || false);
            setHasFetchedHomepageAuctions(true);
        }

        if (queryFromUrl && sortedAuctions.length === 0 && !apiError) {
          setIsLoadingFallbackAuctions(true);
          console.log("[loadInitialData] User search yielded no auctions, fetching fallback recommendations.");
          try {
            const fallbackResponse = await fetchEbayData("", 0, 0, 'auctionsOnly'); // Fetch general auctions
            if (fallbackResponse.auctions && fallbackResponse.auctions.length > 0) {
               let sortedFallbackAuctions = [...fallbackResponse.auctions].sort((a, b) => (a.endTime ? new Date(a.endTime).getTime() : Infinity) - (b.endTime ? new Date(b.endTime).getTime() : Infinity));
              setFallbackAuctions(sortedFallbackAuctions.slice(0, INITIAL_DISPLAY_COUNT));
            } else { setFallbackAuctions([]); }
          } catch (fallbackErr) { console.error("Error fetching fallback auctions:", fallbackErr); setFallbackAuctions([]); }
          finally { setIsLoadingFallbackAuctions(false); }
        }
      }

    } catch (err) {
      console.error("Critical error in loadInitialData:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during data loading.';
      setError(errorMessage);
      setAllFetchedDeals([]); setAllFetchedAuctions([]);
      setDealsToDisplay([]); setAuctionsToDisplay([]);
    } finally {
      setIsLoading(false);
    }
  // Removed numDealsToShow and numAuctionsToShow from dependencies as they are managed internally or reset by newSearchOrViewSwitch
  // currentSearchQuery is also managed internally based on queryFromUrl.
  // Adding cached states and hasFetched states to dependency array to ensure re-evaluation if cache status changes (though direct mutation isn't typical for dep array).
  // Primary triggers should be queryFromUrl and viewFromUrl.
  }, [
      queryFromUrl, viewFromUrl,
      hasFetchedHomepageDeals, cachedHomepageDeals, cachedHomepageHasMoreDeals,
      hasFetchedHomepageAuctions, cachedHomepageAuctions, cachedHomepageHasMoreAuctions
     ]); 

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]); // loadInitialData is memoized with useCallback


  const handleLoadMoreDeals = () => {
    const newNumToShow = Math.min(numDealsToShow + LOAD_MORE_INCREMENT, allFetchedDeals.length);
    setNumDealsToShow(newNumToShow);
    setDealsToDisplay(allFetchedDeals.slice(0, newNumToShow));
  };

  const handleLoadMoreAuctions = () => {
    const newNumToShow = Math.min(numAuctionsToShow + LOAD_MORE_INCREMENT, allFetchedAuctions.length);
    setNumAuctionsToShow(newNumToShow);
    setAuctionsToDisplay(allFetchedAuctions.slice(0, newNumToShow));
  };

  const canLoadMoreLocalDeals = numDealsToShow < allFetchedDeals.length;
  const canLoadMoreLocalAuctions = numAuctionsToShow < allFetchedAuctions.length;

  const LoadingSkeleton = ({ count = 8 } : { count?: number}) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );

  const CardSkeleton = () => (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow bg-card">
      <Skeleton className="h-48 w-full rounded-md bg-muted" />
      <Skeleton className="h-6 w-3/4 rounded-md bg-muted" />
      <Skeleton className="h-4 w-1/2 rounded-md bg-muted" />
      <Skeleton className="h-4 w-1/3 rounded-md bg-muted" />
      <Skeleton className="h-10 w-full rounded-md bg-muted" />
    </div>
  );

  // Dynamically generate titles based on currentSearchQuery and view.
  // currentSearchQuery can be the user's q, or a generated title like "Today's Top Deals" or "Deals for [Theme]"
  const dealsTitle = viewFromUrl === 'deals'
    ? (currentSearchQuery && !currentSearchQuery.toLowerCase().includes("today's top deals") && !currentSearchQuery.toLowerCase().startsWith("deals for ") && queryFromUrl
        ? `Deals for "${currentSearchQuery}"`
        : currentSearchQuery || "Today's Top Deals")
    : "Deals";

  const auctionsTitle = viewFromUrl === 'auctions'
    ? (currentSearchQuery && !currentSearchQuery.toLowerCase().includes("trending auctions") && !currentSearchQuery.toLowerCase().startsWith("auctions for ") && queryFromUrl
        ? `Auctions for "${currentSearchQuery}"`
        : currentSearchQuery || "Trending Auctions")
    : "Auctions";


  if (isLoading && ((viewFromUrl === 'deals' && dealsToDisplay.length === 0) || (viewFromUrl === 'auctions' && auctionsToDisplay.length === 0)) ) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
           <LoadingSkeleton count={viewFromUrl === 'deals' ? Math.min(INITIAL_DISPLAY_COUNT, 8) : Math.min(INITIAL_DISPLAY_COUNT, 4)} />
        </main>
        <Footer />
      </div>
    );
  }

  const shouldShowErrorBlock = error &&
                               ( (viewFromUrl === 'deals' && dealsToDisplay.length === 0 && fallbackDeals.length === 0) ||
                                 (viewFromUrl === 'auctions' && auctionsToDisplay.length === 0 && fallbackAuctions.length === 0) );
  
  let displayErrorMessage = error;
  if (error) {
      if (error.includes("Could not load some themed product suggestions") || 
          error.includes("Could not load general marketplace deals") ||
          error.includes("eBay returned an error")) {
          displayErrorMessage = "We had trouble loading some content. Please try refreshing or check back.";
      }
  }


  if (shouldShowErrorBlock) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col justify-center items-center">
                <div className="text-center p-8 border border-primary/30 bg-card/50 rounded-lg shadow-lg max-w-md">
                    <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-headline text-foreground mb-2">Oops! We hit a snag.</h2>
                    {displayErrorMessage && <p className="text-muted-foreground mb-4">{displayErrorMessage}</p>}
                </div>
            </main>
            <Footer />
        </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">

        {viewFromUrl === 'deals' && (
          <section>
            <div className="flex items-center mb-8">
              <Tag className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-headline font-semibold">
                {dealsTitle}
              </h2>
            </div>

            {isLoading && dealsToDisplay.length === 0 && <LoadingSkeleton count={8} />}

            {!isLoading && dealsToDisplay.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dealsToDisplay.map((deal) => (
                  <DealCard key={`${deal.id}-${deal.title}-${deal.price}`} deal={deal} />
                ))}
              </div>
            )}

            {!isLoading && dealsToDisplay.length === 0 && !error && (
              <div className="text-center py-8">
                <PackageSearch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">
                  {isHomepageContext
                    ? "No special deals available at the moment."
                    : `No deals found for "${queryFromUrl || 'your search'}".`}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  {isHomepageContext
                    ? "Try searching for something specific!"
                    : queryFromUrl ? "Try a different term, or check out these popular deals below." : "Try searching for something!"}
                </p>

                {isLoadingFallbackDeals && (
                  <>
                    <p className="text-primary font-semibold my-4">Loading popular deals...</p>
                    <LoadingSkeleton count={4} />
                  </>
                )}

                {!isLoadingFallbackDeals && fallbackDeals.length > 0 && (
                  <section className="mt-12">
                    <div className="flex items-center justify-center mb-6">
                      <h3 className="text-2xl font-headline font-semibold text-primary">
                        You Might Be Interested In These Deals
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {fallbackDeals.map((deal) => (
                        <DealCard key={`${deal.id}-fallback-${deal.title}`} deal={deal} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {dealsToDisplay.length > 0 && (
              <div className="mt-12 text-center">
                {canLoadMoreLocalDeals && (
                  <Button onClick={handleLoadMoreDeals} size="lg" variant="outline" className="mb-2">
                    Load More Deals ({allFetchedDeals.length - numDealsToShow} remaining from this batch)
                  </Button>
                )}
                {!canLoadMoreLocalDeals && hasMoreDealsOnServer && allFetchedDeals.length > 0 && (
                  <p className="text-center text-muted-foreground mt-4 text-sm">
                    Showing all {allFetchedDeals.length} deals fetched for this view. More might be available with a new search or on eBay.
                  </p>
                )}
                {!canLoadMoreLocalDeals && !hasMoreDealsOnServer && allFetchedDeals.length > 0 && (
                  <p className="text-center text-muted-foreground mt-4 text-sm">
                    You've seen all available deals for this view. Try searching for something else to see more.
                  </p>
                )}
              </div>
            )}
            {error && dealsToDisplay.length === 0 && fallbackDeals.length === 0 && !isLoading && <p className="text-center text-destructive py-4">Error loading deals: {error}</p>}
          </section>
        )}

        {viewFromUrl === 'auctions' && (
          <section>
            <div className="flex items-center mb-8">
              <ShoppingCart className="h-8 w-8 text-accent mr-3" />
              <h2 className="text-3xl font-headline font-semibold">
                {auctionsTitle}
              </h2>
            </div>

            {isLoading && auctionsToDisplay.length === 0 && <LoadingSkeleton count={4} />}

            {!isLoading && auctionsToDisplay.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctionsToDisplay.map((auction) => (
                  <AuctionCard key={`${auction.id}-${auction.title}-${auction.currentBid}`} auction={auction} />
                ))}
              </div>
            )}

            {!isLoading && auctionsToDisplay.length === 0 && !error && (
              <div className="text-center py-8">
                <PackageSearch className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground mb-2">
                 {isHomepageContext ? "No trending auctions found right now." : `No active auctions found for "${queryFromUrl || 'your search'}".`}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  {isHomepageContext
                    ? "Try searching for something specific or browse our categories!"
                    : queryFromUrl ? "Try a different term, or check out these popular auctions below." : "Try searching for something!"}
                </p>

                {isLoadingFallbackAuctions && (
                  <>
                    <p className="text-accent font-semibold my-4">Loading popular auctions...</p>
                    <LoadingSkeleton count={4} />
                  </>
                )}

                {!isLoadingFallbackAuctions && fallbackAuctions.length > 0 && (
                  <section className="mt-12">
                    <div className="flex items-center justify-center mb-6">
                      <h3 className="text-2xl font-headline font-semibold text-accent">
                        Popular Auctions You Might Like
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {fallbackAuctions.map((auction) => (
                        <AuctionCard key={`${auction.id}-fallback-${auction.title}`} auction={auction} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {auctionsToDisplay.length > 0 && (
                <div className="mt-12 text-center">
                    {canLoadMoreLocalAuctions && (
                        <Button onClick={handleLoadMoreAuctions} size="lg" variant="outline" className="mb-2">
                        Load More Auctions ({allFetchedAuctions.length - numAuctionsToShow} remaining from this batch)
                        </Button>
                    )}
                    {!canLoadMoreLocalAuctions && hasMoreAuctionsOnServer && allFetchedAuctions.length > 0 && (
                        <p className="text-center text-muted-foreground mt-4 text-sm">
                            Showing all {allFetchedAuctions.length} auctions fetched for this view. More might be available with a new search or on eBay.
                        </p>
                    )}
                    {!canLoadMoreLocalAuctions && !hasMoreAuctionsOnServer && allFetchedAuctions.length > 0 && (
                        <p className="text-center text-muted-foreground mt-4 text-sm">
                            You've seen all available auctions for this view. Try searching for something else to see more.
                        </p>
                    )}
                </div>
            )}
             {error && auctionsToDisplay.length === 0 && fallbackAuctions.length === 0 && !isLoading && <p className="text-center text-destructive py-4">Error loading auctions: {error}</p>}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-xl font-semibold">Loading dealscope...</div>}>
      <HomePageContent />
    </Suspense>
  );
}

