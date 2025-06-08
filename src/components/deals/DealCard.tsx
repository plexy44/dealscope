
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Deal } from "@/types";
import { Star, Zap, AlertTriangle, TrendingDown, Eye /*, Sparkles, LoaderCircle */ } from "lucide-react";
import React /*, { useState } */ from "react";
// import { getDealAnalysis, type DealAnalysisInput, type DealAnalysisOutput } from "@/app/actions/analyzeDealActions";
/*
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
*/
// import { Skeleton } from "@/components/ui/skeleton";
import { formatPriceDisplay } from "@/lib/utils";

interface DealCardProps {
  deal: Deal;
}

/*
// Simple inline SVG for a "dead" robot icon with X eyes
const DeadRobotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-16 w-16 text-primary mx-auto mb-3"
    {...props}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 8h20" />
    <path d="M17.5 12.5a.5.5 0 0 1-.5-.5.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5z" />
    <path d="m9.5 12.5-1.5 1.5m0-1.5 1.5 1.5" />
    <path d="m14.5 12.5-1.5 1.5m0-1.5 1.5 1.5" />
  </svg>
);
*/

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  // const [isAnalyzing, setIsAnalyzing] = useState(false);
  // const [analysisResult, setAnalysisResult] = useState<DealAnalysisOutput | null>(null);
  // const [analysisError, setAnalysisError] = useState<string | null>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  /*
  const handleAnalyzeDeal = async () => {
    setIsModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    const input: DealAnalysisInput = {
      title: deal.title,
      description: deal.shortDescription || deal.title || "No description available.",
      sellerRating: deal.sellerRating || "Not available",
      itemCondition: deal.itemCondition || "Not specified",
    };

    const result = await getDealAnalysis(input);

    if ('error' in result) {
      setAnalysisError(result.error); // Store the actual error for potential logging
    } else {
      setAnalysisResult(result);
    }
    setIsAnalyzing(false);
  };
  */

  /*
  const getRiskScoreClasses = (score: number) => {
    if (score <= 3) return "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700";
    if (score <= 6) return "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700";
    return "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700";
  };

  const getRarityScoreClasses = (score: number) => {
    if (score <= 3) return "text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700";
    if (score <= 6) return "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700";
    return "text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700";
  };
  */

  /*
  const renderAnalysisContent = () => {
    if (isAnalyzing) {
      return (
        <div className="space-y-3 py-4 text-center">
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground text-sm">AI is analyzing the deal...</p>
          <div className="space-y-2 pt-2 opacity-60">
            <Skeleton className="h-4 w-28 mx-auto rounded bg-muted" />
            <Skeleton className="h-6 w-16 mx-auto rounded-full bg-muted" />
            <Skeleton className="h-4 w-24 mx-auto rounded bg-muted" />
            <Skeleton className="h-6 w-16 mx-auto rounded-full bg-muted" />
          </div>
        </div>
      );
    }
    if (analysisError) {
      return (
        <div className="text-center py-4 flex flex-col items-center">
          <DeadRobotIcon />
          <p className="text-foreground font-semibold text-lg mb-1">This robot has died</p>
          <p className="text-sm text-muted-foreground px-2 mb-2">
            Our AI encountered an issue and couldn't complete the analysis. Please try again later.
          </p>
        </div>
      );
    }
    if (analysisResult) {
      return (
        <div className="space-y-4 py-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-muted-foreground">Seller/Item Risk:</span>
              <Badge variant="outline" className={`text-base px-3 py-1 font-semibold ${getRiskScoreClasses(analysisResult.riskScore)}`}>
                {analysisResult.riskScore}/10
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Lower score indicates lower perceived risk.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-muted-foreground">Item Rarity:</span>
              <Badge variant="outline" className={`text-base px-3 py-1 font-semibold ${getRarityScoreClasses(analysisResult.rarityScore)}`}>
                {analysisResult.rarityScore}/10
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Higher score suggests greater rarity.</p>
          </div>
        </div>
      );
    }
    return null;
  };
  */

  return (
    <>
      <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
        <CardHeader className="p-0 relative">
          <Link href={deal.ebayLink} target="_blank" rel="noopener noreferrer" className="block group">
            <Image
              src={deal.imageUrl || "https://placehold.co/400x300.png"}
              alt={deal.title}
              width={400}
              height={300}
              className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={deal.dataAiHint || "product image"}
              onError={(e) => (e.currentTarget.src = "https://placehold.co/400x300.png")}
            />
          </Link>
          {deal.discountPercentage && parseFloat(deal.discountPercentage) > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2 text-sm flex items-center">
              <TrendingDown className="w-4 h-4 mr-1" /> {deal.discountPercentage}% OFF
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Link href={deal.ebayLink} target="_blank" rel="noopener noreferrer">
            <CardTitle className="text-lg font-headline leading-tight mb-2 hover:text-primary transition-colors h-12 line-clamp-2">
              {deal.title}
            </CardTitle>
          </Link>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-2xl font-bold text-primary">{formatPriceDisplay(deal.price)}</p>
            {deal.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">{formatPriceDisplay(deal.originalPrice)}</p>
            )}
          </div>
          <div className="space-y-1 text-xs text-muted-foreground mb-3">
            {deal.itemCondition && <div className="flex items-center"><Star className="w-3 h-3 mr-1.5 text-amber-500" />Condition: {deal.itemCondition}</div>}
            {deal.sellerRating && <div className="flex items-center"><Zap className="w-3 h-3 mr-1.5 text-purple-500" />Seller: {deal.sellerRating}</div>}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {deal.watchCount && deal.watchCount > 0 && (
              <Badge variant="secondary">
                <Eye className="w-3 h-3 mr-1 text-blue-500" /> {deal.watchCount} watching
              </Badge>
            )}
            {deal.fomoBadges?.map((badgeText, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {badgeText.includes("Low Stock") && <AlertTriangle className="w-3 h-3 mr-1 text-orange-500" />}
                {badgeText}
              </Badge>
            ))}
          </div>

        </CardContent>
        <CardFooter className="p-4 pt-0"> {/* Removed grid classes */}
          <Button asChild className="w-full font-semibold" size="lg">
            <Link href={deal.ebayLink} target="_blank" rel="noopener noreferrer">
              View on eBay
            </Link>
          </Button>
          {/*
          <Button
            variant="outline"
            className="w-full font-semibold"
            size="lg"
            onClick={handleAnalyzeDeal}
            disabled={isAnalyzing && isModalOpen}
          >
            {isAnalyzing && isModalOpen ? (
              <>
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> AI Analysis
              </>
            )}
          </Button>
          */}
        </CardFooter>
      </Card>

      {/*
      {isModalOpen && (
        <AlertDialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          // Optionally reset state if modal is closed by means other than the "Close" button
          // For now, analysis state persists until new analysis or explicit close action
        }}>
          <AlertDialogContent className="max-w-sm md:max-w-md p-4">
            <AlertDialogHeader className="pb-2">
              <AlertDialogTitle className="flex items-center text-lg">
                <Sparkles className="w-5 h-5 mr-2 text-primary" /> AI Deal Analysis
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs pt-1">
                Insights for: <span className="font-medium text-foreground/90 line-clamp-1">{deal.title}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="my-2 min-h-[120px] flex flex-col justify-center">
             {renderAnalysisContent()}
            </div>

            <AlertDialogFooter className="pt-2">
              <AlertDialogAction
                onClick={() => {
                  setIsModalOpen(false);
                  // Reset analysis state when explicitly closing
                  setIsAnalyzing(false);
                  setAnalysisResult(null);
                  setAnalysisError(null);
                }}
                className="w-full sm:w-auto"
              >
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      */}
    </>
  );
};

export default DealCard;
