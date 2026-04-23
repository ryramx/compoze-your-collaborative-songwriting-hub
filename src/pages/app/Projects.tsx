import { Link } from "react-router-dom";
import { Calendar, Disc3, Music4, Plus } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CollaboratorStack } from "@/components/compoze/CollaboratorStack";
import { NewProjectDialog } from "@/components/compoze/NewProjectDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Projects() {
  const projects = useCompoze((s) => s.projects);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Projetos</h1>
          <p className="text-sm text-muted-foreground">EPs, álbuns e singles que você está produzindo.</p>
        </div>
        <NewProjectDialog>
          <Button className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" /> Novo projeto
          </Button>
        </NewProjectDialog>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={p.cover}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
                <Disc3 className="h-3 w-3" /> {p.type}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-1">
                  <Music4 className="h-3 w-3" /> {p.songIds.length} faixas
                </div>
                <div className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(p.releaseDate), "MMM yyyy", { locale: ptBR })}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Financiamento</span>
                  <span className="font-mono">{p.fundingProgress}%</span>
                </div>
                <Progress value={p.fundingProgress} className="h-1.5" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <CollaboratorStack userIds={p.collaboratorIds} />
                <span className="text-[10px] uppercase tracking-widest text-primary">{p.status}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
