import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Disc3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompoze } from "@/store/compozeStore";
import { toast } from "sonner";
import type { ProjectStyle, ProjectType } from "@/data/types";

interface Props {
  children: ReactNode;
}

export function NewProjectDialog({ children }: Props) {
  const createProject = useCompoze((s) => s.createProject);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("ep");
  const [style, setStyle] = useState<ProjectStyle>("banda");
  const [description, setDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState<string>("");
  const [estimatedCost, setEstimatedCost] = useState<string>("");
  const [releaseDate, setReleaseDate] = useState<string>("");

  const reset = () => {
    setName("");
    setType("ep");
    setStyle("banda");
    setDescription("");
    setFundingGoal("");
    setEstimatedCost("");
    setReleaseDate("");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Dê um nome para o projeto");
      return;
    }
    const id = createProject({
      name: name.trim(),
      type,
      style,
      description: description.trim(),
      fundingGoal: fundingGoal ? Number(fundingGoal) : undefined,
      estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
      releaseDate: releaseDate ? new Date(releaseDate).toISOString() : undefined,
    });
    toast.success("Projeto criado ✨");
    setOpen(false);
    reset();
    navigate(`/projects/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg border-border/60 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Disc3 className="h-5 w-5 text-primary" /> Novo projeto
          </DialogTitle>
          <DialogDescription>Crie um single, EP ou álbum para organizar suas canções.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="np-name">Nome</Label>
            <Input
              id="np-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Travessia"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="ep">EP</SelectItem>
                  <SelectItem value="album">Álbum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estilo</Label>
              <Select value={style} onValueChange={(v) => setStyle(v as ProjectStyle)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="acustico">Acústico</SelectItem>
                  <SelectItem value="banda">Banda completa</SelectItem>
                  <SelectItem value="ao-vivo">Ao vivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-desc">Descrição</Label>
            <Textarea
              id="np-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conceito, referências, intenção…"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="np-cost">Custo (R$)</Label>
              <Input
                id="np-cost"
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-goal">Meta (R$)</Label>
              <Input
                id="np-goal"
                type="number"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-date">Lançamento</Label>
              <Input
                id="np-date"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            className="rounded-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
          >
            Criar projeto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}