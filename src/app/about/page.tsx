import Link from "next/link";
import Image from "next/image";
import { Heart, Users, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold">ConnectSphere</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 space-y-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">About ConnectSphere</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re on a mission to bring the world closer together through meaningful connections,
            authentic sharing, and vibrant communities.
          </p>
        </div>

        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=500&fit=crop"
            alt="Our team"
            fill
            className="object-cover"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: Users, value: "50M+", label: "Active Users" },
            { icon: Globe, value: "180+", label: "Countries" },
            { icon: Award, value: "4.9★", label: "App Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Our Story</h2>
          <p>
            Founded in 2024, ConnectSphere was born from a simple idea: social media should bring people
            together, not drive them apart. We built a platform that prioritizes authentic connections,
            privacy, and community over engagement metrics.
          </p>
          <h2>Our Values</h2>
          <ul>
            <li><strong>Connection</strong> — Building bridges between people across the globe</li>
            <li><strong>Privacy</strong> — Your data belongs to you, always</li>
            <li><strong>Community</strong> — Empowering groups to thrive together</li>
            <li><strong>Creativity</strong> — Giving everyone a voice and a canvas</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
