import { useState } from "react";
import { Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { CollaboratorStack } from "@/components/compoze/CollaboratorStack";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function Feed() {
  const feed = useCompoze((s) => s.feed);
  const me = useCompoze((s) => s.users.find((u) => u.id === s.currentUserId)!);
  const getUser = useCompoze((s) => s.getUser);
  const getSong = useCompoze((s) => s.getSong);
  const getProject = useCompoze((s) => s.getProject);
  const postFeed = useCompoze((s) => s.postFeed);
  const [draft, setDraft] = useState("");

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Feed</h1>
        <p className="text-sm text-muted-foreground">Atualizações, lançamentos e ideias da comunidade.</p>
      </div>

      <Card className="border-border/60 bg-gradient-card p-4">
        <div className="flex gap-3">
          <UserAvatar user={me} size="md" />
          <div className="flex-1 space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="O que você está compondo agora?"
              className="resize-none border-border/60 bg-background/40"
            />
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                disabled={!draft.trim()}
                onClick={() => {
                  postFeed(draft.trim());
                  setDraft("");
                  toast.success("Postagem publicada!");
                }}
                className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow"
              >
                <Send className="h-4 w-4" /> Publicar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {feed.map((f) => {
          const u = getUser(f.userId);
          const song = f.songId ? getSong(f.songId) : undefined;
          const project = f.projectId ? getProject(f.projectId) : undefined;
          return (
            <Card key={f.id} className="overflow-hidden border-border/60 bg-gradient-card">
              <div className="flex items-start gap-3 p-4">
                <UserAvatar user={u} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{u?.name}</span>
                    <span className="text-xs text-muted-foreground">@{u?.username}</span>
                    <span className="text-xs text-muted-foreground">
                      · {formatDistanceToNow(new Date(f.timestamp), { locale: ptBR, addSuffix: true })}
                    </span>
                  </div>
                  {f.content && <p className="mt-1 text-sm leading-relaxed">{f.content}</p>}
                </div>
              </div>

              {song && (
                <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-hero text-primary-foreground">
                    🎵
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-primary">Nova canção</div>
                    <div className="font-display font-semibold">{song.title}</div>
                  </div>
                  <CollaboratorStack userIds={song.collaborators.map((c) => c.userId)} />
                </div>
              )}

              {project && (
                <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl border border-border/60 p-3">
                  <img src={project.cover} alt={project.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Projeto · {project.type}
                    </div>
                    <div className="font-display font-semibold">{project.name}</div>
                  </div>
                </div>
              )}

              {f.image && (
                <img src={f.image} alt="" className="max-h-96 w-full object-cover" />
              )}

              <div className="flex items-center gap-1 border-t border-border/60 px-2 py-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-author-5">
                  <Heart className="h-4 w-4" /> {f.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MessageCircle className="h-4 w-4" /> {f.comments}
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
