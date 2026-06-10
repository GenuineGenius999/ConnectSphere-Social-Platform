import Image from "next/image";
import { Radio, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getLiveStreams } from "@/lib/queries/extra";
import { formatNumber } from "@/lib/utils";

export default async function LivePage() {
  const liveStreams = await getLiveStreams();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Live</h1>
        <p className="text-muted-foreground">Live streams happening now</p>
      </div>

      {liveStreams.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No live streams right now.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveStreams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden border-border/40 hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="relative aspect-video bg-muted">
                {stream.thumbnail && (
                  <Image src={stream.thumbnail} alt={stream.title} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <Badge className="absolute top-3 left-3 bg-red-500 border-0 animate-pulse">
                  <Radio className="h-3 w-3 mr-1" /> LIVE
                </Badge>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Eye className="h-3 w-3 text-white" />
                  <span className="text-white text-xs">{formatNumber(stream.viewers)}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold">{stream.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <UserAvatar src={stream.streamer.avatar} alt={stream.streamer.name} size="xs" isVerified={stream.streamer.isVerified} />
                  <span className="text-sm text-muted-foreground">{stream.streamer.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
