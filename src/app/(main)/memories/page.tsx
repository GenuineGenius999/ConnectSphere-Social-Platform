import Image from "next/image";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getMemories } from "@/lib/queries/extra";

export default async function MemoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const memories = await getMemories(session.user.id);

  const grouped = memories.reduce(
    (acc, memory) => {
      if (!acc[memory.year]) acc[memory.year] = [];
      acc[memory.year].push(memory);
      return acc;
    },
    {} as Record<number, typeof memories>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Memories</h1>
        <p className="text-muted-foreground">Your posts with photos from the past</p>
      </div>

      {memories.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No memories yet. Post photos to build your timeline!</p>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, items]) => (
            <div key={year}>
              <h2 className="text-lg font-semibold mb-3">{year}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {items.map((memory) => (
                  <Card key={memory.id} className="overflow-hidden border-border/40 group cursor-pointer">
                    <div className="relative aspect-video bg-muted">
                      <Image src={memory.image} alt={memory.title} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {memory.date}
                        </p>
                        <p className="text-white/80 text-sm">{memory.title}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
