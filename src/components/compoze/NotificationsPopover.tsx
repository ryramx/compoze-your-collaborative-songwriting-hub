import { useMemo, useState } from "react";
import { Bell, Check, Disc3, Music4, Sparkles, UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCompoze } from "@/store/compozeStore";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  icon: typeof Bell;
  title: string;
  description: string;
  timestamp: string;
  color: string;
};

export function NotificationsPopover() {
  const feed = useCompoze((s) => s.feed);
  const getUser = useCompoze((s) => s.getUser);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = useMemo<Notification[]>(() => {
    return feed.slice(0, 8).map((f) => {
      const u = getUser(f.userId);
      const name = u?.name ?? "Alguém";
      switch (f.type) {
        case "song-released":
          return {
            id: f.id,
            icon: Music4,
            title: `${name} lançou uma canção`,
            description: f.content ?? "Confira a nova faixa",
            timestamp: f.timestamp,
            color: "text-author-1",
          };
        case "project-update":
          return {
            id: f.id,
            icon: Disc3,
            title: `${name} atualizou um projeto`,
            description: f.content ?? "Há novidades no projeto",
            timestamp: f.timestamp,
            color: "text-author-2",
          };
        case "follow":
          return {
            id: f.id,
            icon: UserPlus,
            title: `${name} começou a seguir você`,
            description: "Que tal seguir de volta?",
            timestamp: f.timestamp,
            color: "text-author-3",
          };
        default:
          return {
            id: f.id,
            icon: Sparkles,
            title: `${name} publicou`,
            description: f.content ?? "Veja no feed",
            timestamp: f.timestamp,
            color: "text-author-4",
          };
      }
    });
  }, [feed, getUser]);

  const unread = notifications.filter((n) => !readIds.has(n.id)).length;
  const markAll = () => setReadIds(new Set(notifications.map((n) => n.id)));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notificações">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-glow">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[22rem] border-border/60 bg-card/95 p-0 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <div className="font-display text-sm font-semibold">Notificações</div>
            <div className="text-[11px] text-muted-foreground">
              {unread > 0 ? `${unread} não lidas` : "Você está em dia ✨"}
            </div>
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAll}>
              <Check className="h-3 w-3" /> Marcar lidas
            </Button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto py-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Sem notificações por enquanto.
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = readIds.has(n.id);
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => setReadIds((prev) => new Set(prev).add(n.id))}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    !isRead && "bg-primary/5",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted/60",
                      n.color,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1 truncate text-sm font-medium">{n.title}</div>
                      {!isRead && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="line-clamp-2 text-xs text-muted-foreground">
                      {n.description}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {formatDistanceToNow(new Date(n.timestamp), {
                        locale: ptBR,
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}