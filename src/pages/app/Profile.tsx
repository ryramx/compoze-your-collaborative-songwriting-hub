import { Instagram, MapPin, UserPlus, UserCheck, MessageCircle, Music4, Lock, Eye, EyeOff } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { StatusBadge } from "@/components/compoze/StatusBadge";
import { useState } from "react";
import { SongPreviewModal } from "@/components/compoze/SongPreviewModal";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { CollaboratorStack } from "@/components/compoze/CollaboratorStack";
import { cn } from "@/lib/utils";

export default function Profile() {
  const me = useCompoze((s) => s.users.find((u) => u.id === s.currentUserId)!);
  const allSongs = useCompoze((s) => s.songs);
  const projects = useCompoze((s) => s.projects.filter((p) => p.collaboratorIds.includes(me.id)));
  const followingIds = useCompoze((s) => s.followingIds);
  const toggleFollow = useCompoze((s) => s.toggleFollow);
  const toggleHidden = useCompoze((s) => s.toggleSongHidden);
  const [openSong, setOpenSong] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isFollowing = followingIds.includes(me.id);
  const isOwner = true; // viewing own profile

  const mySongs = allSongs.filter(
    (x) => x.creatorId === me.id || x.collaborators.some((c) => c.userId === me.id),
  );
  // Public list hides 🔒 songs. Owner sees all with badge.
  const publicSongs = mySongs.filter((s) => !s.hidden);
  const drawerSongs = isOwner ? mySongs : publicSongs;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-card p-6 md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-end">
          <UserAvatar user={me} size="xl" ring />
          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-4xl font-bold">{me.name}</h1>
            <div className="text-sm text-muted-foreground">@{me.username}</div>
            <p className="mt-3 max-w-xl text-sm">{me.bio}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {me.location.city}, {me.location.country}
              </span>
              {me.instagram && (
                <a
                  href={`https://instagram.com/${me.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Instagram className="h-3 w-3" /> @{me.instagram}
                </a>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-5 text-sm">
              <div>
                <span className="font-display text-xl font-bold">{me.followers.toLocaleString("pt-BR")}</span>{" "}
                <span className="text-muted-foreground">seguidores</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold">{me.following.toLocaleString("pt-BR")}</span>{" "}
                <span className="text-muted-foreground">seguindo</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold">{publicSongs.length}</span>{" "}
                <span className="text-muted-foreground">canções</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button className="rounded-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90">
                  <Music4 className="h-4 w-4" /> Ver canções
                </Button>
              </DrawerTrigger>
              <DrawerContent className="border-border/60 bg-card/95 backdrop-blur-xl">
                <DrawerHeader>
                  <DrawerTitle className="font-display text-xl">
                    Canções de {me.name.split(" ")[0]}
                  </DrawerTitle>
                  <p className="text-xs text-muted-foreground">
                    {drawerSongs.length} canções{isOwner && " (incluindo invisíveis para outros)"}
                  </p>
                </DrawerHeader>
                <div className="max-h-[60vh] space-y-1 overflow-y-auto px-4 pb-6">
                  {drawerSongs.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2 transition-colors hover:bg-muted/40"
                    >
                      <button
                        onClick={() => {
                          setOpenSong(s.id);
                          setDrawerOpen(false);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <Music4 className="h-4 w-4 text-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 truncate font-medium">
                            {s.title}
                            {s.hidden && isOwner && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                <Lock className="h-2.5 w-2.5" /> Invisível
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {s.key && <span className="font-mono">{s.key}</span>}
                            {s.key && s.bpm && " · "}
                            {s.bpm && <span className="font-mono">{s.bpm} BPM</span>}
                          </div>
                        </div>
                      </button>
                      <CollaboratorStack userIds={s.collaborators.map((c) => c.userId)} max={3} />
                      <StatusBadge status={s.status} />
                      {isOwner && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full text-muted-foreground"
                          onClick={() => toggleHidden(s.id)}
                          title={s.hidden ? "Tornar pública" : "Ocultar para outros"}
                        >
                          {s.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/60 p-3">
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full rounded-full border-border/60">Fechar</Button>
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
            <Button
              onClick={() => toggleFollow(me.id)}
              className={cn("rounded-full", !isFollowing && "bg-gradient-hero text-primary-foreground shadow-glow")}
              variant={isFollowing ? "outline" : "default"}
            >
              {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isFollowing ? "Seguindo" : "Seguir"}
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/messages">
                <MessageCircle className="h-4 w-4" /> Mensagem
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold">Projetos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <img src={p.cover} alt={p.name} className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="text-[10px] uppercase tracking-widest text-primary">{p.type}</div>
                <div className="font-display text-lg font-semibold">{p.name}</div>
                <Progress value={p.fundingProgress} className="mt-3 h-1.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Card className="border-border/60 bg-gradient-card p-5">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Localização</div>
        <div className="mt-1 font-display text-lg">{me.location.city}, {me.location.country}</div>
        <Button asChild variant="link" className="mt-1 px-0 text-primary">
          <Link to="/map">Ver no mapa →</Link>
        </Button>
      </Card>

      <SongPreviewModal songId={openSong} onClose={() => setOpenSong(null)} />
    </div>
  );
}
