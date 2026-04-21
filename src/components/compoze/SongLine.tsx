import { cn } from "@/lib/utils";
import { useCompoze } from "@/store/compozeStore";
import type { SongBlock } from "@/data/types";

interface Props {
  block: SongBlock;
  showAuthor?: boolean;
}

export function SongLine({ block, showAuthor = true }: Props) {
  const author = useCompoze((s) => s.getUser(block.authorId));
  const colorClass = author ? `author-${author.authorColor}` : "";

  if (block.type === "section") {
    return (
      <div className="mt-6 flex items-center gap-3 first:mt-0">
        <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-semibold">
          {block.label}
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
    );
  }

  if (block.type === "note") {
    return (
      <div className={cn("rounded-xl border border-dashed border-border/60 bg-muted/30 p-3 text-sm italic text-muted-foreground", showAuthor && colorClass && "border-l-2")}>
        {block.text}
      </div>
    );
  }

  if (block.type === "chord-line") {
    return (
      <div
        className={cn(
          "chord whitespace-pre rounded-md px-1 leading-relaxed",
          showAuthor && colorClass,
        )}
      >
        {block.text}
      </div>
    );
  }

  return (
    <div className={cn("rounded-md px-1 leading-relaxed", showAuthor && colorClass)}>
      {block.text}
    </div>
  );
}
