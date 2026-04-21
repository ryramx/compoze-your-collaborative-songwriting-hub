import { useCompoze } from "@/store/compozeStore";
import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

export function CollaboratorStack({
  userIds,
  max = 4,
  size = "sm",
  className,
}: {
  userIds: string[];
  max?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const getUser = useCompoze((s) => s.getUser);
  const visible = userIds.slice(0, max);
  const overflow = userIds.length - visible.length;
  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((id) => {
        const u = getUser(id);
        if (!u) return null;
        return (
          <div key={id} className="rounded-full ring-2 ring-background">
            <UserAvatar user={u} size={size} />
          </div>
        );
      })}
      {overflow > 0 && (
        <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-semibold ring-2 ring-background">
          +{overflow}
        </div>
      )}
    </div>
  );
}
