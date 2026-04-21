import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ collapsed, size = "md", className }: LogoProps) {
  const sizes = {
    sm: { box: "h-8 w-8", icon: "h-4 w-4", text: "text-lg" },
    md: { box: "h-9 w-9", icon: "h-5 w-5", text: "text-xl" },
    lg: { box: "h-12 w-12", icon: "h-6 w-6", text: "text-3xl" },
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative grid place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-glow",
          sizes.box,
        )}
      >
        <Music2 className={sizes.icon} />
        <div className="absolute inset-0 rounded-xl bg-primary/30 blur-xl -z-10" />
      </div>
      {!collapsed && (
        <span className={cn("font-display font-bold tracking-tight", sizes.text)}>
          Compoze
        </span>
      )}
    </div>
  );
}
