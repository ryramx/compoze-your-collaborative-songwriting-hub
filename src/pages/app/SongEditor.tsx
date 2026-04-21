import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Type,
  Music2,
  StickyNote,
  Hash,
  UserPlus,
  Users,
  Wifi,
  Save,
} from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { StatusBadge } from "@/components/compoze/StatusBadge";
import type { SongBlock, SongStatus } from "@/data/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusOptions: { value: SongStatus; label: string }[] = [
  { value: "ideia", label: "Ideia" },
  { value: "escrita", label: "Escrita" },
  { value: "revisao", label: "Revisão" },
  { value: "finalizada", label: "Finalizada" },
  { value: "registrada", label: "Registrada" },
  { value: "gravada", label: "Gravada" },
];

const blockTypeIcon = {
  section: Hash,
  "chord-line": Music2,
  "lyric-line": Type,
  note: StickyNote,
} as const;

interface FakeCursor {
  userId: string;
  blockId: string;
  pos: number; // 0..1 of block width
}

export default function SongEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const song = useCompoze((s) => (id ? s.getSong(id) : undefined));
  const me = useCompoze((s) => s.users.find((u) => u.id === s.currentUserId)!);
  const allUsers = useCompoze((s) => s.users);
  const getUser = useCompoze((s) => s.getUser);
  const updateSong = useCompoze((s) => s.updateSong);
  const updateBlock = useCompoze((s) => s.updateBlock);
  const addBlock = useCompoze((s) => s.addBlock);
  const removeBlock = useCompoze((s) => s.removeBlock);
  const inviteCollaborator = useCompoze((s) => s.inviteCollaborator);
  const setContribution = useCompoze((s) => s.setContribution);

  // Simulated live cursors of other collaborators
  const otherCollaborators = useMemo(
    () => song?.collaborators.filter((c) => c.userId !== me.id).map((c) => c.userId) ?? [],
    [song?.collaborators, me.id],
  );
  const [cursors, setCursors] = useState<FakeCursor[]>([]);

  useEffect(() => {
    if (!song || otherCollaborators.length === 0) {
      setCursors([]);
      return;
    }
    const move = () => {
      setCursors(
        otherCollaborators.map((uid) => {
          const block = song.blocks[Math.floor(Math.random() * song.blocks.length)];
          return { userId: uid, blockId: block.id, pos: Math.random() };
        }),
      );
    };
    move();
    const t = setInterval(move, 2200);
    return () => clearInterval(t);
  }, [song?.id, otherCollaborators]);

  if (!song) {
    return (
      <div className="mx-auto max-w-3xl p-8 text-center">
        <p className="text-muted-foreground">Canção não encontrada.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/songs">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    );
  }

  const totalPercent = song.collaborators.reduce((acc, c) => acc + c.percentage, 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl md:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/songs")}>
          <ArrowLeft className="h-4 w-4" /> Canções
        </Button>
        <Input
          value={song.title}
          onChange={(e) => updateSong(song.id, { title: e.target.value })}
          className="h-9 max-w-xs border-0 bg-transparent px-2 font-display text-lg font-semibold focus-visible:ring-1"
        />
        <StatusBadge status={song.status} />
        <Select
          value={song.status}
          onValueChange={(v) => updateSong(song.id, { status: v as SongStatus })}
        >
          <SelectTrigger className="h-8 w-32 rounded-full border-border/60 bg-muted/40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={song.key ?? ""}
          onChange={(e) => updateSong(song.id, { key: e.target.value })}
          placeholder="Tom"
          className="h-8 w-16 rounded-full bg-muted/40 text-center font-mono text-xs"
        />
        <Input
          value={song.bpm ?? ""}
          onChange={(e) => updateSong(song.id, { bpm: Number(e.target.value) || undefined })}
          placeholder="BPM"
          className="h-8 w-20 rounded-full bg-muted/40 text-center font-mono text-xs"
        />

        <div className="ml-auto flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-2 rounded-full bg-author-3/10 px-3 py-1 text-xs text-author-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-author-3" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-author-3" />
            </span>
            Ao vivo · {song.collaborators.length}
          </div>

          {/* Active collaborators */}
          <div className="flex -space-x-2">
            {song.collaborators.map((c) => {
              const u = getUser(c.userId);
              if (!u) return null;
              return (
                <div key={c.userId} className="rounded-full ring-2 ring-background">
                  <UserAvatar user={u} size="sm" ring />
                </div>
              );
            })}
          </div>

          {/* Invite */}
          <CollaboratorsDialog
            songId={song.id}
            collaborators={song.collaborators}
            allUsers={allUsers}
            onInvite={inviteCollaborator}
            onSetPercentage={setContribution}
            totalPercent={totalPercent}
          />

          <Button
            size="sm"
            onClick={() => toast.success("Tudo salvo automaticamente ✨")}
            className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow"
          >
            <Save className="h-4 w-4" /> Salvar
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-6 md:p-10">
          <div className="space-y-2">
            {song.blocks.map((b) => (
              <EditorBlock
                key={b.id}
                block={b}
                authorColor={getUser(b.authorId)?.authorColor ?? 1}
                authorName={getUser(b.authorId)?.name ?? ""}
                isMine={b.authorId === me.id}
                onChange={(text) => updateBlock(song.id, b.id, { text })}
                onLabel={(label) => updateBlock(song.id, b.id, { label })}
                onRemove={() => removeBlock(song.id, b.id)}
                cursors={cursors.filter((c) => c.blockId === b.id)}
                getUser={getUser}
              />
            ))}
          </div>

          {/* Add block toolbar */}
          <div className="mt-6 flex flex-wrap gap-2">
            {(
              [
                { type: "section", label: "Seção", icon: Hash },
                { type: "chord-line", label: "Acordes", icon: Music2 },
                { type: "lyric-line", label: "Letra", icon: Type },
                { type: "note", label: "Nota", icon: StickyNote },
              ] as const
            ).map((t) => (
              <Button
                key={t.type}
                size="sm"
                variant="outline"
                className="rounded-full border-border/60 bg-background/40"
                onClick={() =>
                  addBlock(song.id, {
                    type: t.type,
                    label: t.type === "section" ? "Nova seção" : undefined,
                    text: "",
                    authorId: me.id,
                  })
                }
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </Button>
            ))}
          </div>

          {/* Authorship summary */}
          <Card className="mt-10 border-border/60 bg-gradient-card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Users className="h-3 w-3" /> Coautoria — soma {totalPercent}%
            </div>
            <div className="space-y-3">
              {song.collaborators.map((c) => {
                const u = getUser(c.userId);
                if (!u) return null;
                return (
                  <div key={c.userId} className="flex items-center gap-3">
                    <UserAvatar user={u} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{u.name}</span>
                        <span className={cn("font-mono text-xs", `text-author-${u.authorColor}`)}>
                          {c.percentage}%
                        </span>
                      </div>
                      <Slider
                        value={[c.percentage]}
                        max={100}
                        step={5}
                        onValueChange={(v) => setContribution(song.id, c.userId, v[0])}
                        className="mt-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EditorBlock({
  block,
  authorColor,
  authorName,
  isMine,
  onChange,
  onLabel,
  onRemove,
  cursors,
  getUser,
}: {
  block: SongBlock;
  authorColor: number;
  authorName: string;
  isMine: boolean;
  onChange: (text: string) => void;
  onLabel: (label: string) => void;
  onRemove: () => void;
  cursors: FakeCursor[];
  getUser: (id: string) => any;
}) {
  const Icon = blockTypeIcon[block.type];
  const ref = useRef<HTMLDivElement>(null);

  if (block.type === "section") {
    return (
      <div className="group relative mt-6 flex items-center gap-3 first:mt-2">
        <Hash className="h-3 w-3 text-primary" />
        <Input
          value={block.label ?? ""}
          onChange={(e) => onLabel(e.target.value)}
          placeholder="Nome da seção"
          className="h-7 max-w-xs border-0 bg-transparent px-1 text-xs uppercase tracking-[0.25em] text-primary focus-visible:ring-1"
        />
        <span className="h-px flex-1 bg-border/60" />
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={onRemove}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div ref={ref} className="group relative">
      <div className="flex items-start gap-2">
        <div className={cn("mt-2 grid h-6 w-6 place-items-center rounded-md", `bg-author-${authorColor}/15 text-author-${authorColor}`)}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="relative flex-1">
          <Input
            value={block.text}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              block.type === "chord-line"
                ? "Am   F   C   G"
                : block.type === "note"
                ? "Anotação ou ideia"
                : "Letra…"
            }
            className={cn(
              "h-10 border-0 bg-transparent px-2 text-base focus-visible:ring-1",
              block.type === "chord-line" && "chord text-primary",
              block.type === "note" && "italic text-muted-foreground",
              `author-${authorColor}`,
              "rounded-md",
            )}
          />
          {/* fake live cursors from other collaborators */}
          {cursors.map((c, i) => {
            const u = getUser(c.userId);
            if (!u) return null;
            return (
              <div
                key={i}
                className="live-cursor"
                data-name={u.name.split(" ")[0]}
                style={{
                  left: `${c.pos * 80}%`,
                  top: 0,
                  height: "100%",
                  width: 2,
                  background: `hsl(var(--author-${u.authorColor}))`,
                  ["--cursor-color" as any]: `hsl(var(--author-${u.authorColor}))`,
                }}
              />
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="mt-2 h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={onRemove}
          title="Remover"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {!isMine && (
        <div className="ml-8 -mt-1 text-[10px] text-muted-foreground">
          contribuição de <span className={cn(`text-author-${authorColor}`, "font-semibold")}>{authorName}</span>
        </div>
      )}
    </div>
  );
}

function CollaboratorsDialog({
  songId,
  collaborators,
  allUsers,
  onInvite,
  totalPercent,
}: {
  songId: string;
  collaborators: { userId: string; percentage: number }[];
  allUsers: any[];
  onInvite: (songId: string, userId: string, percentage?: number) => void;
  onSetPercentage: (songId: string, userId: string, percentage: number) => void;
  totalPercent: number;
}) {
  const [open, setOpen] = useState(false);
  const candidates = allUsers.filter((u) => !collaborators.some((c) => c.userId === u.id));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-full border-border/60">
          <UserPlus className="h-4 w-4" /> Convidar
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/60 bg-card">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Wifi className="h-4 w-4 text-author-3" />
            Convidar colaboradores
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Convide compositores para co-autoria. Eles entram automaticamente como coautores e suas contribuições ficam destacadas em cor.
        </p>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {candidates.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
              Todos os seus contatos já estão na canção.
            </div>
          )}
          {candidates.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-2">
              <UserAvatar user={u} size="sm" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{u.name}</div>
                <div className="text-xs text-muted-foreground">@{u.username}</div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  onInvite(songId, u.id, 0);
                  toast.success(`${u.name} entrou na sessão`);
                }}
                className="rounded-full bg-gradient-hero text-primary-foreground"
              >
                Convidar
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
          Soma atual de coautoria: <span className="font-mono text-foreground">{totalPercent}%</span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
