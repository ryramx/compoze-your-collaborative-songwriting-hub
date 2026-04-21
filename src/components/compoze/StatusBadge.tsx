import { Badge } from "@/components/ui/badge";
import type { SongStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const statusMap: Record<SongStatus, { label: string; className: string }> = {
  ideia: { label: "Ideia", className: "bg-author-2/15 text-author-2 border-author-2/30" },
  escrita: { label: "Escrita", className: "bg-author-1/15 text-author-1 border-author-1/30" },
  revisao: { label: "Revisão", className: "bg-author-4/15 text-author-4 border-author-4/30" },
  finalizada: { label: "Finalizada", className: "bg-author-3/15 text-author-3 border-author-3/30" },
  registrada: { label: "Registrada", className: "bg-primary/15 text-primary border-primary/30" },
  gravada: { label: "Gravada", className: "bg-author-5/15 text-author-5 border-author-5/30" },
};

export function StatusBadge({ status, className }: { status: SongStatus; className?: string }) {
  const s = statusMap[status];
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", s.className, className)}>
      {s.label}
    </Badge>
  );
}
