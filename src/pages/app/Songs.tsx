import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, List, Plus, Search, Trash2 } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SongCard } from "@/components/compoze/SongCard";
import { SongPreviewModal } from "@/components/compoze/SongPreviewModal";
import { StatusBadge } from "@/components/compoze/StatusBadge";
import { CollaboratorStack } from "@/components/compoze/CollaboratorStack";
import { ConfirmDeleteDialog } from "@/components/compoze/ConfirmDeleteDialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SongStatus } from "@/data/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const filters: { value: "all" | SongStatus; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "ideia", label: "Ideias" },
  { value: "escrita", label: "Escrita" },
  { value: "revisao", label: "Revisão" },
  { value: "finalizada", label: "Finalizadas" },
  { value: "registrada", label: "Registradas" },
  { value: "gravada", label: "Gravadas" },
];

type SortOpt = "recent" | "old" | "status";

export default function Songs() {
  const songs = useCompoze((s) => s.songs);
  const createSong = useCompoze((s) => s.createSong);
  const deleteSong = useCompoze((s) => s.deleteSong);
  const [openSong, setOpenSong] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | SongStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOpt>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const order: Record<SongStatus, number> = {
      ideia: 0, escrita: 1, revisao: 2, finalizada: 3, registrada: 4, gravada: 5,
    };
    const list = songs
      .filter((s) => (filter === "all" ? true : s.status === filter))
      .filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));
    if (sort === "recent") return [...list].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    if (sort === "old") return [...list].sort((a, b) => +new Date(a.updatedAt) - +new Date(b.updatedAt));
    return [...list].sort((a, b) => order[a.status] - order[b.status]);
  }, [songs, filter, query, sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Canções</h1>
          <p className="text-sm text-muted-foreground">
            Todas as suas ideias, rascunhos e gravações em um só lugar.
          </p>
        </div>
        <Button
          onClick={() => {
            const id = createSong({ title: "Nova canção" });
            navigate(`/songs/${id}/edit`);
          }}
          className="rounded-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nova canção
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:max-w-xs md:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar canções"
            className="rounded-full bg-muted/40 pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortOpt)}>
            <SelectTrigger className="h-9 w-44 rounded-full border-border/60 bg-muted/40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="old">Mais antigas</SelectItem>
              <SelectItem value="status">Por status</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-full border border-border/60 bg-muted/30 p-0.5">
            <button
              aria-label="Grade"
              onClick={() => setView("grid")}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors",
                view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              aria-label="Lista"
              onClick={() => setView("list")}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full transition-colors",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border/60 text-muted-foreground hover:bg-muted/50",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <div className="text-muted-foreground">Nada por aqui ainda. Que tal começar uma nova ideia?</div>
        </div>
      ) : view === "list" ? (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
          {filtered.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "group flex w-full items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40",
                i > 0 && "border-t border-border/60",
              )}
            >
              <button
                onClick={() => setOpenSong(s.id)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(s.updatedAt), { locale: ptBR, addSuffix: true })}
                    {s.key && <span className="ml-2 font-mono">· {s.key}</span>}
                    {s.bpm && <span className="ml-1 font-mono">· {s.bpm} BPM</span>}
                  </div>
                </div>
                <CollaboratorStack userIds={s.collaborators.map((c) => c.userId)} max={3} />
              </button>
              <StatusBadge status={s.status} />
              <ConfirmDeleteDialog
                title={s.title}
                onConfirm={() => {
                  deleteSong(s.id);
                  toast.success("Canção movida para a Lixeira");
                }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Excluir canção"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </ConfirmDeleteDialog>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <SongCard key={s.id} song={s} onOpen={setOpenSong} />
          ))}
        </div>
      )}

      <SongPreviewModal songId={openSong} onClose={() => setOpenSong(null)} />
    </div>
  );
}
