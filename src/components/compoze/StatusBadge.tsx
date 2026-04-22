import { Badge } from "@/components/ui/badge";
import type { SongStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const statusMap: Record<SongStatus, { label: string; className: string }> = {
  ideia: { label: "Ideia", className: "bg-status-ideia/15 text-status-ideia border-status-ideia/30" },
  escrita: { label: "Escrita", className: "bg-status-escrita/15 text-status-escrita border-status-escrita/30" },
  revisao: { label: "Revisão", className: "bg-status-revisao/15 text-status-revisao border-status-revisao/40" },
  finalizada: { label: "Finalizada", className: "bg-status-finalizada/15 text-status-finalizada border-status-finalizada/30" },
  registrada: { label: "Registrada", className: "bg-status-registrada/15 text-status-registrada border-status-registrada/30" },
  gravada: { label: "Gravada", className: "bg-status-gravada/15 text-status-gravada border-status-gravada/30" },
};

export function StatusBadge({ status, className }: { status: SongStatus; className?: string }) {
  const s = statusMap[status];
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", s.className, className)}>
      {s.label}
    </Badge>
  );
}
