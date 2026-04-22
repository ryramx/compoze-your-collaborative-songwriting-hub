import { Link } from "react-router-dom";
import { Music4, Clock, Mic2, Trash2 } from "lucide-react";
import type { Song } from "@/data/types";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { CollaboratorStack } from "./CollaboratorStack";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";

export function SongCard({ song, onOpen }: { song: Song; onOpen?: (id: string) => void }) {
  const project = useCompoze((s) => (song.projectId ? s.getProject(song.projectId) : undefined));
  const deleteSong = useCompoze((s) => s.deleteSong);

  return (
    <Card
      onClick={() => onOpen?.(song.id)}
      className="group cursor-pointer overflow-hidden border-border/60 bg-gradient-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15">
          <Music4 className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge status={song.status} />
          <div onClick={(e) => e.stopPropagation()}>
            <ConfirmDeleteDialog
              title={song.title}
              onConfirm={() => {
                deleteSong(song.id);
                toast.success("Canção movida para a Lixeira");
              }}
            >
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                aria-label="Excluir canção"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </ConfirmDeleteDialog>
          </div>
        </div>
      </div>
      <h3 className="mt-3 truncate font-display text-lg font-semibold">{song.title}</h3>
      {project && (
        <Link
          to={`/projects/${project.id}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <Mic2 className="h-3 w-3" />
          {project.name}
        </Link>
      )}
      <div className="mt-4 flex items-center justify-between">
        <CollaboratorStack userIds={song.collaborators.map((c) => c.userId)} />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(song.updatedAt), { locale: ptBR, addSuffix: true })}
        </div>
      </div>
      {(song.key || song.bpm) && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          {song.key && <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono">Tom {song.key}</span>}
          {song.bpm && <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono">{song.bpm} BPM</span>}
        </div>
      )}
    </Card>
  );
}
