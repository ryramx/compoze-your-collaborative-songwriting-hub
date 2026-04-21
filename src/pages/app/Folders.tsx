import { useMemo, useState } from "react";
import { ChevronRight, Folder as FolderIcon, FolderPlus, Music4 } from "lucide-react";
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
  const createFolder = useCompoze((s) => s.createFolder);

  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [openSong, setOpenSong] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const visibleFolders = folders.filter((f) => f.parentId === currentId);
  const visibleSongs = songs.filter((s) => s.folderId === currentId);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Pastas</h1>
          <p className="text-sm text-muted-foreground">Organize suas ideias em pastas e subpastas.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow">
              <FolderPlus className="h-4 w-4" /> Nova pasta
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/60 bg-card">
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

      {visibleFolders.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Pastas</h2>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {visibleFolders.map((f) => (
              <button
                key={f.id}
                onClick={() => setCurrentId(f.id)}
                className="group rounded-2xl border border-border/60 bg-gradient-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FolderIcon className="h-5 w-5" />
                </div>
                <div className="mt-3 font-display font-semibold">{f.name}</div>
                <div className="text-xs text-muted-foreground">
                  {folders.filter((x) => x.parentId === f.id).length} subpastas ·{" "}
                  {songs.filter((s) => s.folderId === f.id).length} canções
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Canções</h2>
        {visibleSongs.length === 0 ? (
          <Card className="grid place-items-center border-dashed border-border/60 bg-transparent p-10 text-sm text-muted-foreground">
            Nenhuma canção nessa pasta.
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

      <SongPreviewModal songId={openSong} onClose={() => setOpenSong(null)} />
    </div>
  );
}
