import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Disc3, LayoutGrid, List, Music4, Plus, Sparkles, TrendingUp } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SongCard } from "@/components/compoze/SongCard";
import { SongPreviewModal } from "@/components/compoze/SongPreviewModal";
import { CollaboratorStack } from "@/components/compoze/CollaboratorStack";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { StatusBadge } from "@/components/compoze/StatusBadge";
import { NewProjectDialog } from "@/components/compoze/NewProjectDialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import heroStudio from "@/assets/hero-studio.jpg";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const me = useCompoze((s) => s.users.find((u) => u.id === s.currentUserId)!);
  const songs = useCompoze((s) => s.songs);
  const projects = useCompoze((s) => s.projects);
  const feed = useCompoze((s) => s.feed);
  const getUser = useCompoze((s) => s.getUser);
  const createSong = useCompoze((s) => s.createSong);
  const navigate = useNavigate();
  const [openSong, setOpenSong] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const recentSongs = [...songs]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 4);
  const myProjects = projects.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card">
        <img
          src={heroStudio}
          alt="Estúdio musical abstrato"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30 dark:from-background dark:via-background/80 dark:to-transparent" />
        <div className="relative z-10 grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10 lg:p-14">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Olá, {me.name.split(" ")[0]}
            </div>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.05]">
              O que vamos <span className="gradient-text">escrever hoje?</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm md:text-base text-muted-foreground">
              {songs.filter((s) => s.status === "escrita" || s.status === "revisao").length} canções em andamento ·{" "}
              {projects.length} projetos vivos. Pegue sua próxima ideia onde parou.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const id = createSong({ title: "Nova canção" });
                  navigate(`/songs/${id}/edit`);
                }}
                className="rounded-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Nova canção
              </Button>
              <NewProjectDialog>
                <Button
                  variant="outline"
                  className="rounded-full border-border/60 bg-background/40 backdrop-blur-md"
                >
                  <Disc3 className="h-4 w-4" /> Novo projeto
                </Button>
              </NewProjectDialog>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Canções", value: songs.length, icon: Music4, color: "text-author-1" },
          { label: "Projetos", value: projects.length, icon: Disc3, color: "text-author-2" },
          { label: "Seguidores", value: me.followers, icon: TrendingUp, color: "text-author-3" },
          { label: "Coautorias", value: songs.filter((s) => s.collaborators.length > 1).length, icon: Sparkles, color: "text-author-4" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60 bg-gradient-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="mt-2 font-display text-3xl font-bold">{s.value}</div>
              </div>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Recent songs */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Recentes</h2>
            <p className="text-sm text-muted-foreground">Continue de onde parou.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-border/60 bg-muted/30 p-0.5">
              <button
                aria-label="Visualização em grade"
                onClick={() => setView("grid")}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full transition-colors",
                  view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                aria-label="Visualização em lista"
                onClick={() => setView("list")}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full transition-colors",
                  view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/songs">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
        {view === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recentSongs.map((s) => (
              <SongCard key={s.id} song={s} onOpen={setOpenSong} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
            {recentSongs.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setOpenSong(s.id)}
                className={cn(
                  "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                  i > 0 && "border-t border-border/60",
                )}
              >
                <Music4 className="h-4 w-4 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(s.updatedAt), { locale: ptBR, addSuffix: true })}
                  </div>
                </div>
                <CollaboratorStack userIds={s.collaborators.map((c) => c.userId)} max={3} />
                <StatusBadge status={s.status} />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Projects + activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 font-display text-2xl font-semibold">Projetos em andamento</h2>
          <div className="space-y-3">
            {myProjects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="block overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-4 transition-all hover:border-primary/40 hover:shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.cover}
                    alt={p.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-primary">
                        {p.type}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        · {p.style.replace("-", " ")}
                      </span>
                    </div>
                    <div className="font-display text-lg font-semibold">{p.name}</div>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={p.fundingProgress} className="h-1.5 flex-1" />
                      <span className="text-xs font-mono text-muted-foreground">
                        {p.fundingProgress}%
                      </span>
                    </div>
                  </div>
                  <CollaboratorStack userIds={p.collaboratorIds} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-2xl font-semibold">Atividade</h2>
          <Card className="border-border/60 bg-gradient-card p-4">
            <ul className="space-y-4">
              {feed.slice(0, 4).map((f) => {
                const u = getUser(f.userId);
                return (
                  <li key={f.id} className="flex gap-3">
                    <UserAvatar user={u} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        <span className="font-semibold">{u?.name}</span>{" "}
                        <span className="text-muted-foreground">
                          {f.type === "song-released" && "lançou uma canção"}
                          {f.type === "project-update" && "atualizou um projeto"}
                          {f.type === "post" && "publicou"}
                          {f.type === "follow" && "começou a seguir alguém"}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{f.content}</p>
                      <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {formatDistanceToNow(new Date(f.timestamp), { locale: ptBR, addSuffix: true })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      </div>

      <SongPreviewModal songId={openSong} onClose={() => setOpenSong(null)} />
    </div>
  );
}
