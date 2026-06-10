import Image from "next/image";
import { Gamepad2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGames } from "@/lib/queries/extra";
import { formatNumber } from "@/lib/utils";

export default async function GamingPage() {
  const games = await getGames();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Gaming</h1>
        <p className="text-muted-foreground">Play games with friends on ConnectSphere</p>
      </div>

      {games.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No games available yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <Card key={game.id} className="overflow-hidden border-border/40 hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="relative aspect-[4/3] bg-muted">
                {game.image && (
                  <Image src={game.image} alt={game.name} fill sizes="300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Gamepad2 className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold">{game.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="secondary" className="text-[10px]">{game.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {formatNumber(game.players)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
