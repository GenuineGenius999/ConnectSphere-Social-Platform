import Link from "next/link";
import { Heart, Search, MessageCircle, Shield, Users, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const topics = [
  { icon: Users, title: "Getting Started", desc: "Create an account and set up your profile" },
  { icon: MessageCircle, title: "Messaging", desc: "Send messages and manage conversations" },
  { icon: Shield, title: "Privacy & Security", desc: "Control who sees your content" },
  { icon: Settings, title: "Account Settings", desc: "Manage your account preferences" },
];

const faqs = [
  { q: "How do I create an account?", a: "Click 'Get Started' on the homepage and fill in your details." },
  { q: "How do I change my privacy settings?", a: "Go to Settings > Privacy to control your visibility." },
  { q: "How do I report inappropriate content?", a: "Click the three dots on any post and select 'Report'." },
  { q: "How do I delete my account?", a: "Go to Settings > Security > Delete Account." },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-bold">ConnectSphere</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/feed">Back to App</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 space-y-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground mb-6">How can we help you today?</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search help articles..." className="pl-10" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <Card key={topic.title} className="border-border/40 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <topic.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{topic.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.q} className="border-border/40">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
