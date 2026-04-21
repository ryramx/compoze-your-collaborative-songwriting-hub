import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Messages() {
  const conversations = useCompoze((s) => s.conversations);
  const me = useCompoze((s) => s.currentUserId);
  const getUser = useCompoze((s) => s.getUser);
  const sendMessage = useCompoze((s) => s.sendMessage);
  const [activeId, setActiveId] = useState(conversations[0]?.withUserId);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.withUserId === activeId);
  const activeUser = activeConv ? getUser(activeConv.withUserId) : undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConv?.messages.length]);

  return (
    <div className="mx-auto h-[calc(100vh-4rem)] max-w-6xl p-4 md:p-6">
      <Card className="grid h-full grid-cols-[280px_1fr] overflow-hidden border-border/60 bg-gradient-card">
        {/* List */}
        <div className="flex h-full min-h-0 flex-col border-r border-border/60">
          <div className="border-b border-border/60 p-4">
            <h2 className="font-display text-lg font-semibold">Mensagens</h2>
            <p className="text-xs text-muted-foreground">{conversations.length} conversas</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => {
              const u = getUser(c.withUserId);
              const last = c.messages[c.messages.length - 1];
              const active = c.withUserId === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.withUserId)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border/40 p-3 text-left transition-colors hover:bg-muted/40",
                    active && "bg-muted/60",
                  )}
                >
                  <UserAvatar user={u} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-semibold">{u?.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(last.timestamp), "HH:mm")}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{last.content}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat */}
        <div className="flex h-full min-h-0 flex-col">
          {activeUser && activeConv ? (
            <>
              <div className="flex items-center gap-3 border-b border-border/60 p-4">
                <UserAvatar user={activeUser} size="md" />
                <div>
                  <div className="font-semibold">{activeUser.name}</div>
                  <div className="text-xs text-muted-foreground">@{activeUser.username}</div>
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeConv.messages.map((m) => {
                  const mine = m.fromId === me;
                  return (
                    <div key={m.id} className={cn("flex gap-2", mine && "justify-end")}>
                      {!mine && <UserAvatar user={activeUser} size="xs" />}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                          mine
                            ? "rounded-br-sm bg-gradient-hero text-primary-foreground"
                            : "rounded-bl-sm bg-muted/60",
                        )}
                      >
                        <div>{m.content}</div>
                        <div className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {format(new Date(m.timestamp), "HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  sendMessage(activeUser.id, draft.trim());
                  setDraft("");
                }}
                className="flex items-center gap-2 border-t border-border/60 p-3"
              >
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Escreva uma mensagem…"
                  className="rounded-full bg-background/40"
                />
                <Button type="submit" size="icon" className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-muted-foreground">
              Selecione uma conversa
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
