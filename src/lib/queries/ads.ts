import { prisma } from "@/lib/prisma";

export async function getUserAdsStats(userId: string) {
  const [posts, totalLikes, totalComments, followers] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.like.count({ where: { post: { authorId: userId } } }),
    prisma.comment.count({ where: { post: { authorId: userId } } }),
    prisma.follow.count({ where: { followingId: userId } }),
  ]);

  const reach = followers * 12 + totalLikes * 3 + totalComments * 5 + posts * 50;
  const impressions = reach * 7;
  const activeCampaigns = posts > 0 ? Math.min(3, Math.max(1, Math.ceil(posts / 5))) : 0;

  return {
    reach,
    impressions,
    activeCampaigns,
    engagement: totalLikes + totalComments,
    followers,
    posts,
  };
}
