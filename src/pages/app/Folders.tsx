import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Disc3, Folder as FolderIcon, FolderPlus, Music4 } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SongPreviewModal } from "@/components/compoze/SongPreviewModal";
import { StatusBadge } from "@/components/compoze/StatusBadge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Folders() {
  const folders = useCompoze((s) => s.folders);
  const songs = useCompoze((s) => s.songs);
  const projects = useCompoze((s) => s.projects);
  const createFolder = useCompoze((s) => s.createFolder);

  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [openSong, setOpenSong] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const isRoot = currentId === undefined;

  const breadcrumb = useMemo(() => {
    const path: { id?: string; name: string }[] = [{ id: undefined, name: "Início" }];
    let id = currentId;
    const acc: { id: string; name: string }[] = [];
    while (id) {
      const f = folders.find((x) => x.id === id);
      if (!f) break;
      acc.unshift({ id: f.id, name: f.name });
      id = f.parentId;
    }
    return [...path, ...acc];
  }, [currentId, folders]);

  // Root: only folders. Inside: only songs + projects related to that folder.
  const visibleFolders = isRoot ? folders.filter((f) => !f.parentId) : [];
  const visibleSongs = isRoot ? [] : songs.filter((s) => s.folderId === currentId);
  const folderSongIds = visibleSongs.map((s) => s.id);
  const visibleProjects = isRoot
    ? []
    : projects.filter((p) => p.songIds.some((sid) => folderSongIds.includes(sid)));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Pastas</h1>
          <p className="text-sm text-muted-foreground">
            {isRoot
              ? "Selecione uma pasta para ver suas canções e projetos."
              : "Canções e projetos desta pasta."}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90">
              <FolderPlus className="h-4 w-4" /> Nova pasta
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/60 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="font-display">Criar nova pasta</DialogTitle>
            </DialogHeader>
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Letras 2026"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!newName.trim()) return;
                  createFolder(newName.trim(), currentId);
                  setNewName("");
                  setDialogOpen(false);
                }}
              >
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {breadcrumb.map((b, i) => (
          <div key={i} className="flex items-center gap-1">
            <button
              className={cn(
                "rounded-md px-2 py-1 transition-colors hover:bg-muted/50",
                i === breadcrumb.length - 1 && "font-semibold text-foreground",
              )}
              onClick={() => setCurrentId(b.id)}
            >
              {b.name}
            </button>
            {i < breadcrumb.length - 1 && <ChevronRight className="h-3 w-3" />}
          </div>
        ))}
      </div>

      {isRoot && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleFolders.map((f) => {
            const total = songs.filter((s) => s.folderId === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setCurrentId(f.id)}
                className="group rounded-2xl border border-border/60 bg-gradient-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FolderIcon className="h-6 w-6" />
                </div>
                <div className="mt-3 font-display font-semibold">{f.name}</div>
                <div className="text-xs text-muted-foreground">
                  {total} {total === 1 ? "canção" : "canções"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!isRoot && (
        <>
          <div>
            <h2 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Canções</h2>
            {visibleSongs.length === 0 ? (
              <Card className="grid place-items-center border-dashed border-border/60 bg-transparent p-10 text-sm text-muted-foreground">
                Nenhuma canção nesta pasta.
              </Card>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
                {visibleSongs.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setOpenSong(s.id)}
                    className={cn(
                      "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                      i > 0 && "border-t border-border/60",
                    )}
                  >
                    <Music4 className="h-4 w-4 text-primary" />
                    <div className="flex-1 truncate font-medium">{s.title}</div>
                    <StatusBadge status={s.status} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {visibleProjects.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Projetos relacionados</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProjects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-gradient-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    <img src={p.cover} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-primary inline-flex items-center gap-1">
                        <Disc3 className="h-3 w-3" /> {p.type}
                      </div>
                      <div className="truncate font-display font-semibold">{p.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <SongPreviewModal songId={openSong} onClose={() => setOpenSong(null)} />
    </div>
  );
}
