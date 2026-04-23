import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Type,
  Music2,
  StickyNote,
  Hash,
  UserPlus,
  Users,
  Wifi,
  Share2,
  Tag,
  X,
  Check,
  Undo2,
  Redo2,
} from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ConfirmDeleteDialog } from "@/components/compoze/ConfirmDeleteDialog";

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
  pos: number;
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
  const insertBlock = useCompoze((s) => s.insertBlock);
  const removeBlock = useCompoze((s) => s.removeBlock);
  const inviteCollaborator = useCompoze((s) => s.inviteCollaborator);
  const setContribution = useCompoze((s) => s.setContribution);
  const deleteSong = useCompoze((s) => s.deleteSong);

  const otherCollaborators = useMemo(
    () => song?.collaborators.filter((c) => c.userId !== me.id).map((c) => c.userId) ?? [],
    [song?.collaborators, me.id],
  );
  const [cursors, setCursors] = useState<FakeCursor[]>([]);
  const [savingPulse, setSavingPulse] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const blocksAreaRef = useRef<HTMLDivElement>(null);
  const blocksEndRef = useRef<HTMLDivElement>(null);

  // ---------- Undo / Redo history ----------
  // We snapshot the editable parts of the song (blocks + title + metadata fields)
  // with a small debounce so each "edit burst" becomes a single history entry.
  type Snapshot = {
    title: string;
    blocks: SongBlock[];
    key?: string;
    bpm?: number;
    timeSignature?: string;
    tags?: string[];
  };
  const historyRef = useRef<Snapshot[]>([]);
  const futureRef = useRef<Snapshot[]>([]);
  const isApplyingHistoryRef = useRef(false);
  const lastSnapshotRef = useRef<string>("");
  const [, forceHistoryRender] = useState(0);
  const bumpHistoryUI = () => forceHistoryRender((n) => n + 1);

  useEffect(() => {
    if (!song) return;
    if (isApplyingHistoryRef.current) {
      isApplyingHistoryRef.current = false;
      return;
    }
    const snap: Snapshot = {
      title: song.title,
      blocks: song.blocks,
      key: song.key,
      bpm: song.bpm,
      timeSignature: song.timeSignature,
      tags: song.tags,
    };
    const serialized = JSON.stringify(snap);
    if (serialized === lastSnapshotRef.current) return;
    // debounce: collapse rapid changes into one entry
    const t = setTimeout(() => {
      historyRef.current.push(JSON.parse(lastSnapshotRef.current || serialized));
      // Cap history size
      if (historyRef.current.length > 100) historyRef.current.shift();
      lastSnapshotRef.current = serialized;
      futureRef.current = [];
      bumpHistoryUI();
    }, 400);
    return () => clearTimeout(t);
  }, [song?.title, song?.blocks, song?.key, song?.bpm, song?.timeSignature, song?.tags]);

  const applySnapshot = (snap: Snapshot) => {
    if (!song) return;
    isApplyingHistoryRef.current = true;
    updateSong(song.id, {
      title: snap.title,
      blocks: snap.blocks,
      key: snap.key,
      bpm: snap.bpm,
      timeSignature: snap.timeSignature,
      tags: snap.tags,
    });
    lastSnapshotRef.current = JSON.stringify(snap);
  };

  const handleUndo = () => {
    if (!song || historyRef.current.length === 0) return;
    const current: Snapshot = {
      title: song.title,
      blocks: song.blocks,
      key: song.key,
      bpm: song.bpm,
      timeSignature: song.timeSignature,
      tags: song.tags,
    };
    const prev = historyRef.current.pop()!;
    futureRef.current.push(current);
    applySnapshot(prev);
    bumpHistoryUI();
  };
  const handleRedo = () => {
    if (!song || futureRef.current.length === 0) return;
    const current: Snapshot = {
      title: song.title,
      blocks: song.blocks,
      key: song.key,
      bpm: song.bpm,
      timeSignature: song.timeSignature,
      tags: song.tags,
    };
    const next = futureRef.current.pop()!;
    historyRef.current.push(current);
    applySnapshot(next);
    bumpHistoryUI();
  };

  // Keyboard shortcuts: Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const canUndo = historyRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  // Show floating toolbar while user is scrolling within the writing area.
  // On mobile/tablet (<md) we keep it visible whenever the writing area is
  // on screen — even if the on-screen keyboard opens (which would otherwise
  // make the end-sentinel "appear" visible and hide the bar). On desktop
  // we still hide it once the end of the writing area is reached so the
  // inline toolbar takes over and the rest of the page is reachable.
  useEffect(() => {
    const area = blocksAreaRef.current;
    const end = blocksEndRef.current;
    if (!area || !end) return;

    let areaVisible = false;
    let endVisible = false;
    const isDesktop = () =>
      typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
    const update = () =>
      setShowFloatingToolbar(areaVisible && (!isDesktop() || !endVisible));

    const areaObs = new IntersectionObserver(
      ([entry]) => {
        areaVisible = entry.isIntersecting;
        update();
      },
      { threshold: 0 },
    );
    const endObs = new IntersectionObserver(
      ([entry]) => {
        endVisible = entry.isIntersecting;
        update();
      },
      { threshold: 0 },
    );
    areaObs.observe(area);
    endObs.observe(end);
    const onResize = () => update();
    window.addEventListener("resize", onResize);
    return () => {
      areaObs.disconnect();
      endObs.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [song?.id]);

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

  // Pulse "saving" indicator briefly whenever song updates
  useEffect(() => {
    if (!song) return;
    setSavingPulse(true);
    const t = setTimeout(() => setSavingPulse(false), 900);
    return () => clearTimeout(t);
  }, [song?.updatedAt]);

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
  const tags = song.tags ?? [];

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    updateSong(song.id, { tags: [...tags, t] });
    setTagInput("");
  };
  const removeTag = (t: string) => updateSong(song.id, { tags: tags.filter((x) => x !== t) });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/songs/${song.id}/edit`);
    }
    toast.success("Link da canção copiado ✨");
  };
  const handleDelete = () => {
    if (!song) return;
    deleteSong(song.id);
    toast.success("Canção movida para a Lixeira");
    navigate("/songs");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar — desktop only decorative bits */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 border-b border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl md:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/songs")}>
          <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Canções</span>
        </Button>

        <Input
          value={song.title}
          onChange={(e) => updateSong(song.id, { title: e.target.value })}
          className="h-9 max-w-[12rem] flex-1 border-0 bg-transparent px-2 font-display text-base font-semibold focus-visible:ring-1 md:max-w-xs md:text-lg"
        />

        {/* Saving indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-muted/40 px-2.5 py-1 text-[10px] text-muted-foreground">
          <span className={cn("relative flex h-1.5 w-1.5", savingPulse && "animate-pulse")}>
            <span className="absolute inline-flex h-full w-full rounded-full bg-status-finalizada/60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-finalizada" />
          </span>
          <span className="hidden sm:inline">{savingPulse ? "Salvando…" : "Salvo"}</span>
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex">
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

          {/* Live indicator */}
          <div className="flex items-center gap-2 rounded-full bg-author-3/10 px-3 py-1 text-xs text-author-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-author-3" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-author-3" />
            </span>
            Ao vivo · {song.collaborators.length}
          </div>

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

          <CollaboratorsDialog
            songId={song.id}
            collaborators={song.collaborators}
            allUsers={allUsers}
            onInvite={inviteCollaborator}
            onSetPercentage={setContribution}
            totalPercent={totalPercent}
          />

          <Button size="sm" variant="outline" onClick={handleShare} className="rounded-full border-border/60">
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>

          <ConfirmDeleteDialog onConfirm={handleDelete} title={song.title}>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Excluir
            </Button>
          </ConfirmDeleteDialog>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1">
        <div className="mx-auto max-w-3xl p-4 md:p-10">
          {/* Metadata header */}
          <Card className="mb-6 border-border/60 bg-gradient-card p-4 md:p-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Autor</div>
                <div className="flex items-center gap-2 truncate text-sm font-medium">
                  <UserAvatar user={getUser(song.creatorId)} size="sm" />
                  <span className="truncate">{getUser(song.creatorId)?.name}</span>
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Tom</div>
                <Input
                  value={song.key ?? ""}
                  onChange={(e) => updateSong(song.id, { key: e.target.value })}
                  placeholder="Ex: Am"
                  className="h-9 rounded-lg bg-background/40 font-mono text-sm"
                />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Andamento</div>
                <Input
                  value={song.timeSignature ?? "4/4"}
                  onChange={(e) => updateSong(song.id, { timeSignature: e.target.value })}
                  placeholder="4/4"
                  className="h-9 rounded-lg bg-background/40 font-mono text-sm"
                />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">BPM</div>
                <Input
                  type="number"
                  value={song.bpm ?? ""}
                  onChange={(e) => updateSong(song.id, { bpm: Number(e.target.value) || undefined })}
                  placeholder="120"
                  className="h-9 rounded-lg bg-background/40 font-mono text-sm"
                />
              </div>
            </div>

            {/* Mobile status select */}
            <div className="mt-3 flex items-center gap-2 md:hidden">
              <StatusBadge status={song.status} />
              <Select
                value={song.status}
                onValueChange={(v) => updateSong(song.id, { status: v as SongStatus })}
              >
                <SelectTrigger className="h-8 flex-1 rounded-full border-border/60 bg-background/40 text-xs">
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
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
                >
                  #{t}
                  <button onClick={() => removeTag(t)} aria-label={`Remover tag ${t}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addTag(); }
                  }}
                  placeholder="Adicionar tag"
                  className="h-7 w-32 rounded-full bg-background/40 px-3 text-xs"
                />
                {tagInput && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={addTag}>
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <div ref={blocksAreaRef} className="space-y-2">
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
                onFocus={() => setFocusedBlockId(b.id)}
                shouldFocus={pendingFocusId === b.id}
                onFocusHandled={() => setPendingFocusId(null)}
                onEnter={() => {
                  const newId = insertBlock(
                    song.id,
                    { type: "lyric-line", text: "", authorId: me.id },
                    { afterId: b.id },
                  );
                  setPendingFocusId(newId);
                  setFocusedBlockId(newId);
                }}
              />
            ))}
            <div ref={blocksEndRef} aria-hidden className="h-px w-full" />
          </div>

          {/* Inline add-block toolbar (hidden while floating bar is shown) */}
          <div
            className={cn(
              "mt-6 flex flex-wrap gap-2 transition-opacity",
              showFloatingToolbar && "pointer-events-none opacity-0",
            )}
          >
            <BlockInsertButtons
              onInsert={(type) => {
                const newBlock = {
                  type,
                  label: type === "section" ? "Nova seção" : undefined,
                  text: "",
                  authorId: me.id,
                };
                const focused = focusedBlockId
                  ? song.blocks.find((b) => b.id === focusedBlockId)
                  : undefined;
                let options: { afterId?: string; beforeId?: string } | undefined;
                if (focused) {
                  if (type === "chord-line" && focused.type === "lyric-line") {
                    options = { beforeId: focused.id };
                  } else {
                    options = { afterId: focused.id };
                  }
                }
                const newId = insertBlock(song.id, newBlock, options);
                setPendingFocusId(newId);
                setFocusedBlockId(newId);
              }}
            />
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

          {/* Mobile-only invite */}
          <div className="mt-6 md:hidden">
            <CollaboratorsDialog
              songId={song.id}
              collaborators={song.collaborators}
              allUsers={allUsers}
              onInvite={inviteCollaborator}
              onSetPercentage={setContribution}
              totalPercent={totalPercent}
              fullWidth
            />
          </div>

          {/* Mobile share + delete (large) — share above delete */}
          <div className="mt-8 space-y-3 md:hidden">
            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="h-12 w-full rounded-2xl border-border/60 bg-background/40 text-base"
            >
              <Share2 className="h-5 w-5" /> Compartilhar
            </Button>
            <ConfirmDeleteDialog onConfirm={handleDelete} title={song.title}>
              <Button
                variant="destructive"
                size="lg"
                className="h-12 w-full rounded-2xl text-base"
              >
                <Trash2 className="h-5 w-5" /> Excluir canção
              </Button>
            </ConfirmDeleteDialog>
          </div>
        </div>
      </div>

      {/* Floating bottom toolbar — visible only while user is scrolling within the writing area */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-xl transition-all duration-200",
          showFloatingToolbar
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0",
        )}
        aria-hidden={!showFloatingToolbar}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          <BlockInsertButtons
            onInsert={(type) => {
              const newBlock = {
                type,
                label: type === "section" ? "Nova seção" : undefined,
                text: "",
                authorId: me.id,
              };
              const focused = focusedBlockId
                ? song.blocks.find((b) => b.id === focusedBlockId)
                : undefined;
              let options: { afterId?: string; beforeId?: string } | undefined;
              if (focused) {
                if (type === "chord-line" && focused.type === "lyric-line") {
                  options = { beforeId: focused.id };
                } else {
                  options = { afterId: focused.id };
                }
              }
              const newId = insertBlock(song.id, newBlock, options);
              setPendingFocusId(newId);
              setFocusedBlockId(newId);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BlockInsertButtons({
  onInsert,
}: {
  onInsert: (type: "section" | "chord-line" | "lyric-line" | "note") => void;
}) {
  const items = [
    { type: "section" as const, label: "Seção", icon: Hash },
    { type: "chord-line" as const, label: "Acordes", icon: Music2 },
    { type: "lyric-line" as const, label: "Letra", icon: Type },
    { type: "note" as const, label: "Nota", icon: StickyNote },
  ];
  return (
    <>
      {items.map((t) => (
        <Button
          key={t.type}
          size="sm"
          variant="outline"
          className="rounded-full border-border/60 bg-background/40"
          onClick={() => onInsert(t.type)}
        >
          <t.icon className="h-3.5 w-3.5" /> {t.label}
        </Button>
      ))}
    </>
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
  onFocus,
  shouldFocus,
  onFocusHandled,
  onEnter,
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
  onFocus?: () => void;
  shouldFocus?: boolean;
  onFocusHandled?: () => void;
  onEnter?: () => void;
}) {
  const Icon = blockTypeIcon[block.type];
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (shouldFocus) {
      const el = textareaRef.current ?? inputRef.current;
      if (el) {
        el.focus();
        onFocusHandled?.();
      }
    }
  }, [shouldFocus, onFocusHandled]);

  // Auto-resize textarea to fit content (handles wrapping for long lines)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [block.text]);

  if (block.type === "section") {
    return (
      <div className="group relative mt-6 flex items-center gap-3 first:mt-2">
        <Hash className="h-3 w-3 text-primary" />
        <Input
          ref={inputRef}
          value={block.label ?? ""}
          onChange={(e) => onLabel(e.target.value)}
          onFocus={onFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter?.();
            }
          }}
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

  // For chord lines, render chords in primary color above
  return (
    <div ref={ref} className="group relative">
      <div className="flex items-start gap-2">
        {/* Decorative type icon — hidden on mobile */}
        <div className={cn(
          "mt-2 hidden h-6 w-6 place-items-center rounded-md md:grid",
          `bg-author-${authorColor}/15 text-author-${authorColor}`,
        )}>
          <Icon className="h-3 w-3" />
        </div>
        <div className="relative flex-1">
          <Textarea
            ref={textareaRef}
            value={block.text}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onKeyDown={(e) => {
              // Enter inserts a new lyric line below for lyric/note (no Shift)
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                (block.type === "lyric-line" || block.type === "note")
              ) {
                e.preventDefault();
                onEnter?.();
              }
            }}
            rows={1}
            placeholder={
              block.type === "chord-line"
                ? "Am   F   C   G"
                : block.type === "note"
                ? "Anotação ou ideia"
                : "Letra…"
            }
            className={cn(
              "min-h-[2.5rem] resize-none overflow-hidden whitespace-pre-wrap break-words border-0 bg-transparent px-2 py-2 text-base leading-relaxed focus-visible:ring-1 focus-visible:ring-offset-0",
              block.type === "chord-line" && "chord text-primary font-semibold",
              block.type === "note" && "italic text-muted-foreground",
              block.type === "lyric-line" && "pl-8",
              `author-${authorColor}`,
              "rounded-md",
            )}
          />
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
        <div className="ml-2 -mt-1 text-[10px] text-muted-foreground md:ml-8">
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
  fullWidth,
}: {
  songId: string;
  collaborators: { userId: string; percentage: number }[];
  allUsers: any[];
  onInvite: (songId: string, userId: string, percentage?: number) => void;
  onSetPercentage: (songId: string, userId: string, percentage: number) => void;
  totalPercent: number;
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const candidates = allUsers.filter((u) => !collaborators.some((c) => c.userId === u.id));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={fullWidth ? "lg" : "sm"}
          variant="outline"
          className={cn(
            "rounded-full border-border/60",
            fullWidth && "h-12 w-full rounded-2xl",
          )}
        >
          <UserPlus className="h-4 w-4" /> Convidar colaborador
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/60 bg-card/95 backdrop-blur-xl">
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
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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
