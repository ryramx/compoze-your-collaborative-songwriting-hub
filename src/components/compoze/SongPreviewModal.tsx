import { Link } from "react-router-dom";
import { Pencil, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCompoze } from "@/store/compozeStore";
import { SongLine } from "./SongLine";
import { StatusBadge } from "./StatusBadge";
import { UserAvatar } from "./UserAvatar";
import { Progress } from "@/components/ui/progress";

interface Props {
  songId: string | null;
  onClose: () => void;
}

export function SongPreviewModal({ songId, onClose }: Props) {
  const song = useCompoze((s) => (songId ? s.getSong(songId) : undefined));
  const getUser = useCompoze((s) => s.getUser);

  return (
    <Dialog open={!!songId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl gap-0 border-border/60 bg-card/95 p-0 backdrop-blur-xl">
        {song && (
          <>
            <DialogHeader className="border-b border-border/60 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <StatusBadge status={song.status} />
                    {song.key && (
                      <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-xs">
                        {song.key} · {song.bpm} BPM
                      </span>
                    )}
                  </div>
                  <DialogTitle className="font-display text-2xl">{song.title}</DialogTitle>
                </div>
                <Button asChild size="sm" className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow">
                  <Link to={`/songs/${song.id}/edit`} onClick={onClose}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              </div>
            </DialogHeader>
            <div className="max-h-[55vh] overflow-y-auto p-6">
              <div className="space-y-1 font-mono text-[13px]">
                {song.blocks.map((b) => (
                  <SongLine key={b.id} block={b} />
                ))}
              </div>
            </div>
            <div className="border-t border-border/60 bg-muted/20 p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Coautoria
              </div>
              <div className="space-y-2">
                {song.collaborators.map((c) => {
                  const u = getUser(c.userId);
                  if (!u) return null;
                  return (
                    <div key={c.userId} className="flex items-center gap-3">
                      <UserAvatar user={u} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{u.name}</span>
                          <span className="font-mono text-muted-foreground">{c.percentage}%</span>
                        </div>
                        <Progress value={c.percentage} className="mt-1 h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
