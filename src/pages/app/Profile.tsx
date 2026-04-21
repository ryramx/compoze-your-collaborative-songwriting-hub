import { Instagram, MapPin, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { SongCard } from "@/components/compoze/SongCard";
import { useState } from "react";
import { SongPreviewModal } from "@/components/compoze/SongPreviewModal";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const me = useCompoze((s) => s.users.find((u) => u.id === s.currentUserId)!);
  const songs = useCompoze((s) => s.songs.filter((x) => x.creatorId === me.id || x.collaborators.some((c) => c.userId === me.id)));
  const projects = useCompoze((s) => s.projects.filter((p) => p.collaboratorIds.includes(me.id)));
  const followingIds = useCompoze((s) => s.followingIds);
  const toggleFollow = useCompoze((s) => s.toggleFollow);
  const [openSong, setOpenSong] = useState<string | null>(null);
  const isFollowing = followingIds.includes(me.id);

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
            <div className="mt-4 flex items-center gap-5 text-sm">
              <div>
                <span className="font-display text-xl font-bold">{me.followers.toLocaleString("pt-BR")}</span>{" "}
                <span className="text-muted-foreground">seguidores</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold">{me.following.toLocaleString("pt-BR")}</span>{" "}
                <span className="text-muted-foreground">seguindo</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold">{songs.length}</span>{" "}
                <span className="text-muted-foreground">canções</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => toggleFollow(me.id)}
              className={`rounded-full ${isFollowing ? "" : "bg-gradient-hero text-primary-foreground shadow-glow"}`}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold">Canções</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {songs.map((s) => (
            <SongCard key={s.id} song={s} onOpen={setOpenSong} />
          ))}
        </div>
      </section>

      <Card className="border-border/60 bg-gradient-card p-5">
        <Card className="border-0 bg-transparent p-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Localização</div>
          <div className="mt-1 font-display text-lg">{me.location.city}, {me.location.country}</div>
          <Button asChild variant="link" className="mt-1 px-0 text-primary">
            <Link to="/map">Ver no mapa →</Link>
          </Button>
        </Card>
      </Card>

      <SongPreviewModal songId={openSong} onClose={() => setOpenSong(null)} />
    </div>
  );
}
