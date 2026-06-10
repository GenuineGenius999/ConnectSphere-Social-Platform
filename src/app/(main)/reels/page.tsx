import Image from "next/image";
import { Heart, MessageCircle, Share2, Music, Play } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getReels } from "@/lib/queries/social";
import { formatNumber } from "@/lib/utils";

export default async function ReelsPage() {
  const reels = await getReels();

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Reels</h1>
        <p className="text-muted-foreground text-sm">Short videos from creators in your network</p>
      </div>

      {reels.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No reels yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {reels.map((reel) => (
            <div key={reel.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer bg-muted">
              {reel.thumbnail && (
                <Image src={reel.thumbnail} alt={reel.caption} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Play className="h-6 w-6 text-white fill-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <UserAvatar src={reel.author.avatar} alt={reel.author.name} size="xs" />
                  <span className="text-white text-xs font-semibold truncate">{reel.author.name}</span>
                </div>
                <p className="text-white text-xs line-clamp-2">{reel.caption}</p>
              </div>
              <div className="absolute right-2 bottom-20 flex flex-col items-center gap-3 text-white">
                <div className="flex flex-col items-center">
                  <Heart className="h-5 w-5" />
                  <span className="text-[10px] mt-0.5">{formatNumber(reel.likes)}</span>
                </div>
                <MessageCircle className="h-5 w-5" />
                <Share2 className="h-5 w-5" />
              </div>
              <div className="absolute top-3 right-3"><Music className="h-4 w-4 text-white" /></div>
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                <span className="text-white text-[10px]">{formatNumber(reel.views)} views</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
