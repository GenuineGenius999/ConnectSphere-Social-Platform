import Image from "next/image";
import { Users, Lock, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getGroups } from "@/lib/queries/social";

export default async function GroupsPage() {
  const groups = await getGroups();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Groups</h1>
          <p className="text-muted-foreground">Find communities you love</p>
        </div>
        <Button>Create Group</Button>
      </div>

      <Input placeholder="Search groups..." className="max-w-md" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="overflow-hidden border-border/40 hover:shadow-lg transition-shadow group">
            <div className="relative h-36 bg-muted">
              {group.image && (
                <Image src={group.image} alt={group.name} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <Badge variant="secondary" className="absolute top-3 right-3 bg-black/50 text-white border-0 text-xs">
                {group.privacy === "public" ? <><Globe className="h-3 w-3 mr-1" /> Public</> : <><Lock className="h-3 w-3 mr-1" /> Private</>}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{group.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {group.members.toLocaleString()} members
                </span>
                <Button size="sm">Join</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
