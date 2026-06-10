import Image from "next/image";
import Link from "next/link";
import { Search as SearchIcon, Users, Hash, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { searchAll } from "@/lib/queries/extra";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";
  const { users, posts, groups } = query ? await searchAll(query) : { users: [], posts: [], groups: [] };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Search</h1>
        <p className="text-muted-foreground">Find people, posts, and groups in your database</p>
      </div>

      <form action="/search" method="GET">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" placeholder="Search ConnectSphere..." className="pl-10" defaultValue={query} />
        </div>
      </form>

      {query && (
        <div className="space-y-6">
          {users.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" /> People
              </h2>
              <div className="space-y-2">
                {users.map((user) => (
                  <Link key={user.id} href={`/profile/${user.username}`}>
                    <Card className="p-4 flex items-center gap-3 border-border/40 hover:bg-muted/50 transition-colors">
                      <UserAvatar src={user.avatar} alt={user.name} size="md" isVerified={user.isVerified} />
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Posts
              </h2>
              <div className="space-y-2">
                {posts.map((post) => (
                  <Card key={post.id} className="p-4 border-border/40">
                    <p className="text-sm font-semibold">{post.author.name}</p>
                    <p className="text-sm line-clamp-2 mt-1">{post.content}</p>
                    {post.image && (
                      <div className="relative h-32 mt-2 rounded-lg overflow-hidden bg-muted">
                        <Image src={post.image} alt="" fill sizes="400px" className="object-cover" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {groups.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" /> Groups
              </h2>
              <div className="space-y-2">
                {groups.map((group) => (
                  <Card key={group.id} className="p-4 flex items-center gap-3 border-border/40">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      {group.image && <Image src={group.image} alt={group.name} fill sizes="40px" className="object-cover" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.members} members</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {users.length === 0 && posts.length === 0 && groups.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No results for &quot;{query}&quot;</p>
          )}
        </div>
      )}
    </div>
  );
}
