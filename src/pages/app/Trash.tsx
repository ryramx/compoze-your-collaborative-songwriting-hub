import { Trash2, Undo2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Trash() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Lixeira</h1>
        <p className="text-sm text-muted-foreground">
          Itens excluídos ficam aqui por 30 dias antes de serem removidos para sempre.
        </p>
      </div>

      <Card className="grid place-items-center border-dashed border-border/60 bg-transparent p-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted/40 text-muted-foreground">
          <Trash2 className="h-6 w-6" />
        </div>
        <div className="mt-4 font-display text-lg font-semibold">Sua lixeira está vazia</div>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Quando você excluir uma canção, projeto ou pasta, ela aparecerá aqui — e você poderá restaurar com um clique.
        </p>
        <Button variant="outline" className="mt-4 rounded-full border-border/60" disabled>
          <Undo2 className="h-4 w-4" /> Restaurar tudo
        </Button>
      </Card>
    </div>
  );
}