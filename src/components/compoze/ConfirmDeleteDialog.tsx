import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  onConfirm: () => void;
  title: string;
  description?: string;
}

export function ConfirmDeleteDialog({ children, onConfirm, title, description }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="border-border/60 bg-card/95 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Excluir “{title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              "A canção será movida para a Lixeira e poderá ser restaurada por 30 dias."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}