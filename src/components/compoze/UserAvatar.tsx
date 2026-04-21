import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/data/types";
import { cn } from "@/lib/utils";

interface Props {
  user?: User;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
};

export function UserAvatar({ user, size = "md", ring, className }: Props) {
  if (!user) return null;
  return (
    <Avatar
      className={cn(
        sizes[size],
        ring && `ring-2 ring-offset-2 ring-offset-background ring-author-${user.authorColor}`,
        className,
      )}
    >
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback className="bg-secondary text-foreground">
        {user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")}
      </AvatarFallback>
    </Avatar>
  );
}
