import Image from "next/image";
import { MapPin, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getMarketplaceItems } from "@/lib/queries/social";

const categories = ["All", "Electronics", "Fashion", "Home", "Vehicles", "Sports"];

export default async function MarketplacePage() {
  const items = await getMarketplaceItems();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Marketplace</h1>
          <p className="text-muted-foreground">Buy and sell in your community</p>
        </div>
        <Button>Sell Item</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Search marketplace..." className="max-w-md" />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Badge key={cat} variant={cat === "All" ? "default" : "secondary"} className="cursor-pointer shrink-0 py-1.5 px-3">
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden border-border/40 hover:shadow-lg transition-shadow group cursor-pointer">
            <div className="relative aspect-square bg-muted">
              {item.image && (
                <Image src={item.image} alt={item.title} fill sizes="300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
            </div>
            <CardContent className="p-4">
              <p className="text-xl font-bold text-primary">${item.price}</p>
              <h3 className="font-semibold mt-1">{item.title}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.location}</span>}
                <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{item.condition}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
