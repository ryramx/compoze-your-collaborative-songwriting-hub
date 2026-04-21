import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Disc3, Music4, Target, Users } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CollaboratorStack } from "@/components/compoze/CollaboratorStack";
import { StatusBadge } from "@/components/compoze/StatusBadge";
import { SongPreviewModal } from "@/components/compoze/SongPreviewModal";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProjectDetail() {
  const { id } = useParams();
  const project = useCompoze((s) => (id ? s.getProject(id) : undefined));
  const songs = useCompoze((s) => s.songs);
  const getUser = useCompoze((s) => s.getUser);
  const [openSong, setOpenSong] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/projects">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    );
  }

  const projectSongs = songs.filter((s) => project.songIds.includes(s.id));
  const funded = Math.round((project.fundingGoal * project.fundingProgress) / 100);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground">
        <Link to="/projects">
          <ArrowLeft className="h-4 w-4" /> Projetos
        </Link>
      </Button>

      <div className="relative overflow-hidden rounded-3xl border border-border/60">
        <img src={project.cover} alt={project.name} className="h-72 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
            <Disc3 className="h-3 w-3" /> {project.type} · {project.style.replace("-", " ")}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">{project.name}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-border/60 bg-gradient-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Faixas</h2>
              <span className="text-xs text-muted-foreground">{projectSongs.length} canções</span>
            </div>
            <div className="space-y-1">
              {projectSongs.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setOpenSong(s.id)}
                  className="flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="w-6 font-mono text-xs text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Music4 className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{s.title}</div>
                    {(s.key || s.bpm) && (
                      <div className="text-xs text-muted-foreground">
                        {s.key && <span className="font-mono">{s.key}</span>}
                        {s.key && s.bpm && " · "}
                        {s.bpm && <span className="font-mono">{s.bpm} BPM</span>}
                      </div>
                    )}
                  </div>
                  <CollaboratorStack userIds={s.collaborators.map((c) => c.userId)} max={3} />
                  <StatusBadge status={s.status} />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/60 bg-gradient-card p-5">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Target className="h-3 w-3" /> Financiamento
            </div>
            <div className="flex items-end justify-between">
              <div className="font-display text-3xl font-bold">{project.fundingProgress}%</div>
              <div className="text-right text-xs text-muted-foreground">
                R$ {funded.toLocaleString("pt-BR")} <br />
                <span className="opacity-60">de R$ {project.fundingGoal.toLocaleString("pt-BR")}</span>
              </div>
            </div>
            <Progress value={project.fundingProgress} className="mt-3 h-2" />
            <div className="mt-3 text-xs text-muted-foreground">
              Custo estimado · R$ {project.estimatedCost.toLocaleString("pt-BR")}
            </div>
          </Card>

          <Card className="border-border/60 bg-gradient-card p-5">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Calendar className="h-3 w-3" /> Lançamento previsto
            </div>
            <div className="font-display text-xl font-semibold">
              {format(new Date(project.releaseDate), "d 'de' MMMM, yyyy", { locale: ptBR })}
            </div>
            <div className="mt-2 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs text-primary">
              {project.status}
            </div>
          </Card>

          <Card className="border-border/60 bg-gradient-card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Users className="h-3 w-3" /> Colaboradores
            </div>
            <div className="space-y-3">
              {project.collaboratorIds.map((uid) => {
                const u = getUser(uid);
                return (
                  u && (
                    <div key={uid} className="flex items-center gap-3">
                      <UserAvatar user={u} size="sm" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">@{u.username}</div>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <SongPreviewModal songId={openSong} onClose={() => setOpenSong(null)} />
    </div>
  );
}
