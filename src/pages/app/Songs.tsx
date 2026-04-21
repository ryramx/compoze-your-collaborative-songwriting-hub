import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SongCard } from "@/components/compoze/SongCard";
import { SongPreviewModal } from "@/components/compoze/SongPreviewModal";
import type { SongStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const filters: { value: "all" | SongStatus; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "ideia", label: "Ideias" },
  { value: "escrita", label: "Escrita" },
  { value: "revisao", label: "Revisão" },
  { value: "finalizada", label: "Finalizadas" },
  { value: "registrada", label: "Registradas" },
  { value: "gravada", label: "Gravadas" },
];

export default function Songs() {
  const songs = useCompoze((s) => s.songs);
  const createSong = useCompoze((s) => s.createSong);
  const [openSong, setOpenSong] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | SongStatus>("all");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return songs
      .filter((s) => (filter === "all" ? true : s.status === filter))
      .filter((s) => s.title.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [songs, filter, query]);

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
          className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" /> Nova canção
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar canções"
            className="rounded-full bg-muted/40 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.value
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/60 text-muted-foreground hover:bg-muted/50",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <div className="text-muted-foreground">Nada por aqui ainda. Que tal começar uma nova ideia?</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <SongCard key={s.id} song={s} onOpen={setOpenSong} />
          ))}
        </div>
      )}

      <SongPreviewModal songId={openSong} onClose={() => setOpenSong(null)} />
    </div>
  );
}
