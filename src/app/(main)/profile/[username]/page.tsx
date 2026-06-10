import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Link as LinkIcon, Calendar, Grid3X3, Bookmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PostCard } from "@/components/feed/post-card";
import { auth } from "@/lib/auth";
import { getPostsByUsername, getPostLikeStatus, getPostSavedStatus } from "@/lib/queries/posts";
import { getUserByUsername } from "@/lib/queries/users";
import { FollowButton } from "@/components/profile/follow-button";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const profile = await getUserByUsername(username);

  if (!profile) notFound();

  const isOwnProfile = session?.user?.username === username;
  const posts = await getPostsByUsername(username);
  const postIds = posts.map((p) => p.id);
  const [likedSet, savedSet] = await Promise.all([
    getPostLikeStatus(postIds, session?.user?.id),
    getPostSavedStatus(postIds, session?.user?.id),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <Card className="overflow-hidden border-border/40">
        <div className="relative h-48 md:h-56 bg-muted">
          {profile.coverImage && (
            <Image src={profile.coverImage} alt="Cover" fill sizes="800px" className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <UserAvatar
              src={profile.avatar}
              alt={profile.name}
              size="xl"
              isVerified={profile.isVerified}
              className="ring-4 ring-card"
            />
            <div className="flex-1 sm:pb-1">
              <div className="flex flex-wrap items-center gap-3">
                {!isOwnProfile && (
                  <>
                    <FollowButton userId={profile.id} username={profile.username} />
                    <Button variant="outline" asChild>
                      <Link href="/messages">Message</Link>
                    </Button>
                  </>
                )}
                {isOwnProfile && (
                  <Button variant="outline" asChild>
                    <Link href="/settings">Edit Profile</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-2 text-sm leading-relaxed">{profile.bio}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <span className="flex items-center gap-1 text-primary">
                  <LinkIcon className="h-3.5 w-3.5" />
                  {profile.website}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {profile.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex gap-6 mt-4 text-sm">
              <span><strong>{profile.following}</strong> <span className="text-muted-foreground">Following</span></span>
              <span><strong>{profile.followers}</strong> <span className="text-muted-foreground">Followers</span></span>
              <span><strong>{profile.postCount}</strong> <span className="text-muted-foreground">Posts</span></span>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1 gap-2">
            <Grid3X3 className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="media" className="flex-1 gap-2">
            <Bookmark className="h-4 w-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="about" className="flex-1 gap-2">
            <Users className="h-4 w-4" />
            About
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4 mt-4">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, liked: likedSet.has(post.id), saved: savedSet.has(post.id) }}
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="media">
          <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden mt-4">
            {posts.filter((p) => p.image).map((post) => (
              <div key={post.id} className="relative aspect-square bg-muted">
                {post.image && (
                  <Image src={post.image} alt="" fill sizes="200px" className="object-cover" />
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="about">
          <Card className="p-6 mt-4 border-border/40">
            <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio ?? "No bio yet."}</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
