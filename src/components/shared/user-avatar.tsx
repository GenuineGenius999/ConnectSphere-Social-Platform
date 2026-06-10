import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isVerified?: boolean;
  isOnline?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "h-8 w-8",
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const imageSizes = { xs: 32, sm: 40, md: 48, lg: 64, xl: 96 };

const FALLBACK_AVATAR = "https://i.pravatar.cc/150?u=connectsphere";

export function UserAvatar({
  src,
  alt,
  size = "sm",
  isVerified,
  isOnline,
  className,
}: UserAvatarProps) {
  const imageSrc = src?.trim() ? src : FALLBACK_AVATAR;

  return (
    <div className={cn("relative inline-block", className)}>
      <div className={cn("relative overflow-hidden rounded-full ring-2 ring-background", sizeMap[size])}>
        <Image
          src={imageSrc}
          alt={alt}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="h-full w-full object-cover"
        />
      </div>
      {isVerified && (
        <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 fill-primary text-white" />
      )}
      {isOnline && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
      )}
    </div>
  );
}
