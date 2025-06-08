
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Auction } from "@/types";
import { Eye, Clock, Flame, Star, Zap } from "lucide-react";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { formatPriceDisplay } from "@/lib/utils";


interface AuctionCardProps {
  auction: Auction;
}

const WATCH_COUNT_TRENDING_THRESHOLD = 20; // Items with more watchers than this are considered trending

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0 relative">
        <Link href={auction.ebayLink} target="_blank" rel="noopener noreferrer" className="block group">
          <Image
            src={auction.imageUrl || "https://placehold.co/400x300.png"}
            alt={auction.title}
            width={400}
            height={300}
            className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={auction.dataAiHint || "auction item image"}
            onError={(e) => (e.currentTarget.src = "https://placehold.co/400x300.png")}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={auction.ebayLink} target="_blank" rel="noopener noreferrer">
          <CardTitle className="text-lg font-headline leading-tight mb-2 hover:text-primary transition-colors h-12 line-clamp-2">
            {auction.title}
          </CardTitle>
        </Link>
        <div className="flex items-baseline gap-2 mb-2">
          <p className="text-sm text-muted-foreground">Price:</p>
          <p className="text-2xl font-bold text-primary">{formatPriceDisplay(auction.currentBid)}</p>
        </div>
        {auction.endTime && (
          <div className="mb-3 text-sm">
            <CountdownTimer endTime={auction.endTime} />
          </div>
        )}
         <div className="space-y-1 text-xs text-muted-foreground mb-3">
          {auction.itemCondition && <div className="flex items-center"><Star className="w-3 h-3 mr-1.5 text-amber-500" />Condition: {auction.itemCondition}</div>}
          {auction.sellerRating && <div className="flex items-center"><Zap className="w-3 h-3 mr-1.5 text-purple-500" />Seller: {auction.sellerRating}</div>}
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {auction.watchCount && auction.watchCount > 0 && (
            <Badge variant="secondary" className="flex items-center">
              <Eye className="w-3 h-3 mr-1 text-blue-500" /> {auction.watchCount} watching
            </Badge>
          )}
          {auction.watchCount && auction.watchCount > WATCH_COUNT_TRENDING_THRESHOLD && (
            <Badge variant="outline" className="text-orange-500 border-orange-500 flex items-center">
              <Flame className="w-3 h-3 mr-1" /> Most Watched
            </Badge>
          )}
           {auction.fomoBadges?.map((badgeText, index) => (
             <Badge key={index} variant="secondary">{badgeText}</Badge>
           ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full font-semibold" size="lg">
          <Link href={auction.ebayLink} target="_blank" rel="noopener noreferrer">
            View Auction
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuctionCard;
