import { StoryBar } from "@/components/feed/story-bar";
import { CreatePost } from "@/components/feed/create-post";
import { PostCard } from "@/components/feed/post-card";
import { auth } from "@/lib/auth";
import { getFeedPosts, getPostLikeStatus, getPostSavedStatus } from "@/lib/queries/posts";
import { getStories } from "@/lib/queries/social";
import { formatUserAvatar } from "@/lib/queries/users";

export default async function FeedPage() {
  const session = await auth();
  const [posts, stories] = await Promise.all([getFeedPosts(), getStories()]);

  const postIds = posts.map((p) => p.id);
  const [likedSet, savedSet] = await Promise.all([
    getPostLikeStatus(postIds, session?.user?.id),
    getPostSavedStatus(postIds, session?.user?.id),
  ]);

  const currentUser = session?.user
    ? {
        name: session.user.name ?? "User",
        username: session.user.username,
        avatar: session.user.image ?? formatUserAvatar(null, session.user.username),
      }
    : undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <StoryBar stories={stories} currentUser={currentUser} />
      <CreatePost />
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No posts yet. Be the first to share something!
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={{ ...post, liked: likedSet.has(post.id), saved: savedSet.has(post.id) }}
            />
          ))
        )}
      </div>
    </div>
  );
}
