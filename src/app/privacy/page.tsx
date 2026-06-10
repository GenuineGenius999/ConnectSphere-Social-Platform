import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: June 9, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2>Information We Collect</h2>
            <p>
              We collect information you provide directly, such as when you create an account, post content,
              or communicate with other users. This includes your name, email, profile information, and content you share.
            </p>
          </section>
          <section>
            <h2>How We Use Your Information</h2>
            <p>
              We use your information to provide and improve our services, personalize your experience,
              communicate with you, and ensure the safety and security of our platform.
            </p>
          </section>
          <section>
            <h2>Data Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with service providers who assist
              in operating our platform, and when required by law.
            </p>
          </section>
          <section>
            <h2>Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. You can manage most
              privacy settings directly in your account settings.
            </p>
          </section>
          <section>
            <h2>Contact Us</h2>
            <p>
              For privacy-related questions, contact us at privacy@connectsphere.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
