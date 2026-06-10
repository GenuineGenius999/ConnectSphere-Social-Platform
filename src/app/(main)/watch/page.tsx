import Image from "next/image";
import { Play, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getWatchVideos } from "@/lib/queries/extra";
import { formatNumber } from "@/lib/utils";

export default async function WatchPage() {
  const watchVideos = await getWatchVideos();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Watch</h1>
        <p className="text-muted-foreground">Videos from the platform database</p>
      </div>

      {watchVideos.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No videos yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden border-border/40 hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="relative aspect-video bg-muted">
                {video.thumbnail && (
                  <Image src={video.thumbnail} alt={video.title} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">{video.duration}</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <Play className="h-10 w-10 text-white fill-white" />
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Eye className="h-3 w-3" /> {formatNumber(video.views)} views
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
