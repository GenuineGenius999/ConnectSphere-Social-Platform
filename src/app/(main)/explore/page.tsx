import Image from "next/image";
import Link from "next/link";
import { Heart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getExplorePosts, getReels } from "@/lib/queries/social";
import { formatNumber } from "@/lib/utils";

export default async function ExplorePage() {
  const [exploreGrid, reels] = await Promise.all([getExplorePosts(), getReels()]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Explore</h1>
        <p className="text-muted-foreground">Discover trending content from your community</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Popular Reels</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {reels.map((reel) => (
            <Link key={reel.id} href="/reels" className="relative shrink-0 w-36 h-56 rounded-2xl overflow-hidden group bg-muted">
              {reel.thumbnail && (
                <Image src={reel.thumbnail} alt={reel.caption} fill sizes="144px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white text-xs font-medium truncate">{reel.caption}</p>
                <p className="text-white/70 text-[10px]">{formatNumber(reel.views)} views</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Discover Photos
        </h2>
        {exploreGrid.length === 0 ? (
          <p className="text-muted-foreground">No photos yet. Posts with images will appear here.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 rounded-2xl overflow-hidden">
            {exploreGrid.map((item) => (
              <div key={item.id} className="relative aspect-square group cursor-pointer">
                <Image src={item.image} alt={`Explore ${item.id}`} fill sizes="300px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-1 text-white font-semibold">
                    <Heart className="h-5 w-5 fill-white" />
                    {formatNumber(item.likes)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
