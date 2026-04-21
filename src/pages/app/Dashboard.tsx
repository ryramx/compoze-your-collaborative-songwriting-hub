import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Disc3, Music4, Sparkles, TrendingUp } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SongCard } from "@/components/compoze/SongCard";
import { SongPreviewModal } from "@/components/compoze/SongPreviewModal";
import { CollaboratorStack } from "@/components/compoze/CollaboratorStack";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const me = useCompoze((s) => s.users.find((u) => u.id === s.currentUserId)!);
  const songs = useCompoze((s) => s.songs);
  const projects = useCompoze((s) => s.projects);
  const feed = useCompoze((s) => s.feed);
  const getUser = useCompoze((s) => s.getUser);
  const [openSong, setOpenSong] = useState<string | null>(null);

  const recentSongs = [...songs]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 4);
  const myProjects = projects.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      {/* Hero */}
      <div className="glow-panel relative overflow-hidden p-6 md:p-10">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Bem-vinda de volta, {me.name.split(" ")[0]}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">
            Sua próxima canção <span className="gradient-text">começa aqui.</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Você tem {songs.filter((s) => s.status === "escrita" || s.status === "revisao").length} canções em
            andamento e {projects.length} projetos vivos. Vamos compor?
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow">
              <Link to="/songs">
                <Music4 className="h-4 w-4" /> Abrir canções
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-border/60">
              <Link to="/projects">
                <Disc3 className="h-4 w-4" /> Ver projetos
              </Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute right-20 bottom-0 h-40 w-40 rounded-full bg-author-2/30 blur-3xl" />
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
            <h2 className="font-display text-2xl font-semibold">Canções recentes</h2>
            <p className="text-sm text-muted-foreground">Continue de onde parou.</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/songs">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recentSongs.map((s) => (
            <SongCard key={s.id} song={s} onOpen={setOpenSong} />
          ))}
        </div>
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
