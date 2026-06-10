import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Story = {
  id: string;
  user: { name: string; username: string; avatar: string; isVerified?: boolean };
  image: string;
  hasNew: boolean;
};

type StoryBarProps = {
  stories: Story[];
  currentUser?: { name: string; username: string; avatar: string };
};

export function StoryBar({ stories, currentUser }: StoryBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {currentUser && (
        <Link href={`/profile/${currentUser.username}`} className="flex flex-col items-center gap-1.5 shrink-0 group">
          <div className="relative">
            <div className="h-[72px] w-[72px] rounded-2xl overflow-hidden ring-2 ring-border">
              <Image
                src={currentUser.avatar}
                alt="Your story"
                width={72}
                height={72}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-2 ring-background">
              <Plus className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground w-[72px] truncate text-center">
            Your Story
          </span>
        </Link>
      )}

      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/profile/${story.user.username}`}
          className="flex flex-col items-center gap-1.5 shrink-0 group"
        >
          <div
            className={cn(
              "p-[2.5px] rounded-2xl",
              story.hasNew
                ? "bg-gradient-to-br from-primary via-accent to-primary"
                : "bg-border"
            )}
          >
            <div className="h-[68px] w-[68px] rounded-[14px] overflow-hidden ring-2 ring-background">
              <Image
                src={story.image}
                alt={story.user.name}
                width={68}
                height={68}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <span className="text-xs font-medium w-[72px] truncate text-center">
            {story.user.name.split(" ")[0]}
          </span>
        </Link>
      ))}
    </div>
  );
}
