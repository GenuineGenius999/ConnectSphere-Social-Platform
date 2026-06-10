import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Postimages CDN (user uploads & seed images)
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "postimg.cc" },
      { protocol: "https", hostname: "*.postimg.cc" },
      { protocol: "https", hostname: "i.postimages.org" },
      { protocol: "https", hostname: "postimages.org" },
      { protocol: "https", hostname: "*.postimages.org" },
      // Avatar placeholders
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "pravatar.cc" },
      // Landing & marketing pages
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
    minimumCacheTTL: 60,
    unoptimized: false,
  },
};

export default nextConfig;
