import Link from "next/link";
import Image from "next/image";
import { Heart, Users, MessageCircle, Shield, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { covers } from "@/lib/images";

const features = [
  {
    icon: Users,
    title: "Connect Globally",
    description: "Build meaningful connections with friends, family, and communities worldwide.",
  },
  {
    icon: MessageCircle,
    title: "Real-time Messaging",
    description: "Chat instantly with rich media, reactions, and group conversations.",
  },
  {
    icon: Sparkles,
    title: "Share Your Story",
    description: "Post photos, videos, reels, and stories that capture your best moments.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Advanced privacy controls to share on your terms, always.",
  },
];

const stats = [
  { value: "50M+", label: "Active Users" },
  { value: "2B+", label: "Posts Shared" },
  { value: "180+", label: "Countries" },
  { value: "4.9★", label: "App Rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ConnectSphere
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                The future of social connection
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Where the world{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  connects
                </span>{" "}
                and shares
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Join millions of people on ConnectSphere. Share moments, discover stories,
                build communities, and stay connected with the people who matter most.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild className="shadow-xl shadow-primary/25">
                  <Link href="/register">
                    Create Free Account
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/feed">Explore Feed</Link>
                </Button>
              </div>
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 aspect-[4/5] max-w-md mx-auto">
                <Image
                  src={covers.landing}
                  alt="ConnectSphere social experience"
                  fill
                  sizes="(max-width: 1024px) 100vw, 448px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-2xl overflow-hidden shadow-xl hidden lg:block">
                <Image
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop"
                  alt="Friends"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-2xl overflow-hidden shadow-xl hidden lg:block">
                <Image
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=200&fit=crop"
                  alt="Events"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 bg-card/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to connect</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete social experience with all the features you love, beautifully designed.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border/60 bg-card p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
              "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop",
            ].map((img, i) => (
              <div key={i} className="relative aspect-[3/2] rounded-2xl overflow-hidden group">
                <Image
                  src={img}
                  alt={`Community ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-primary to-accent text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to join the community?</h2>
          <p className="text-white/80 text-lg mb-8">
            Create your free account today and start connecting with millions of people worldwide.
          </p>
          <Button size="lg" variant="secondary" asChild className="shadow-xl">
            <Link href="/register">
              Sign Up — It&apos;s Free
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-semibold">ConnectSphere</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/help" className="hover:text-foreground">Help</Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 ConnectSphere. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
