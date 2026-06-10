export const avatars = {
  user1: "https://i.pravatar.cc/300?u=sarah",
  user2: "https://i.pravatar.cc/300?u=mike",
  user3: "https://i.pravatar.cc/300?u=emma",
  user4: "https://i.pravatar.cc/300?u=james",
  user5: "https://i.pravatar.cc/300?u=lisa",
  user6: "https://i.pravatar.cc/300?u=david",
  user7: "https://i.pravatar.cc/300?u=anna",
  user8: "https://i.pravatar.cc/300?u=chris",
  user9: "https://i.pravatar.cc/300?u=olivia",
  user10: "https://i.pravatar.cc/300?u=alex",
  current: "https://i.pravatar.cc/300?u=you",
};

export const covers = {
  profile1: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
  profile2: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop",
  profile3: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop",
  group1: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop",
  group2: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop",
  event1: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop",
  event2: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
  landing: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=1000&fit=crop",
};

export const postImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4eae5f?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
];

export const reelThumbnails = [
  "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=700&fit=crop",
  "https://images.unsplash.com/photo-1611162617474-5b21e939e966?w=400&h=700&fit=crop",
  "https://images.unsplash.com/photo-1611162736945-1c45d12809a5?w=400&h=700&fit=crop",
  "https://images.unsplash.com/photo-1611605698335-8b6e4b0f4b0a?w=400&h=700&fit=crop",
  "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=700&fit=crop",
  "https://images.unsplash.com/photo-1611162617474-5b21e939e966?w=400&h=700&fit=crop",
];

export const marketplaceImages = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1572635196233-14f2507ead67?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop",
];

export const exploreImages = [
  "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1682687220199-d0124f1f5f11?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1682687220923-c58b9a4592ae?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1682687221117-9caeece5c0ef?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1682687220199-d0124f1f5f11?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1682687221038-404cb277090e?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=600&h=600&fit=crop",
];

export function picsum(seed: string, width = 400, height = 400) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
