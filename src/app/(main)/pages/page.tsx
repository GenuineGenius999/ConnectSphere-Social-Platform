import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPages } from "@/lib/queries/social";
import { formatNumber } from "@/lib/utils";

export default async function PagesDirectoryPage() {
  const pages = await getPages();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pages</h1>
          <p className="text-muted-foreground">Discover brands, creators, and businesses</p>
        </div>
        <Button>Create Page</Button>
      </div>

      <Input placeholder="Search pages..." className="max-w-md" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <Card key={page.id} className="border-border/40 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-muted">
                {page.avatar && <Image src={page.avatar} alt={page.name} fill sizes="64px" className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold truncate">{page.name}</h3>
                  {page.verified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{page.category}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatNumber(page.followers)} followers</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">Follow</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
