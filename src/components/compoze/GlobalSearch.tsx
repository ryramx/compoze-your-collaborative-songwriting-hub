import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Disc3, Music4, Search, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCompoze } from "@/store/compozeStore";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

export function GlobalSearch({ className }: { className?: string }) {
  const songs = useCompoze((s) => s.songs);
  const projects = useCompoze((s) => s.projects);
  const users = useCompoze((s) => s.users);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { songs: [], projects: [], users: [] };
    return {
      songs: songs.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 5),
      projects: projects.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5),
      users: users
        .filter(
          (u) =>
            u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
        )
        .slice(0, 5),
    };
  }, [query, songs, projects, users]);

  const total = results.songs.length + results.projects.length + results.users.length;

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query && setOpen(true)}
        placeholder="Buscar canções, projetos, compositores…"
        className="h-9 w-72 rounded-full bg-muted/50 pl-9"
      />
      {open && query.trim() && (
        <div className="absolute right-0 top-11 z-50 w-[22rem] overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-xl backdrop-blur-xl">
          {total === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhum resultado para “{query}”.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {results.songs.length > 0 && (
                <Section label="Canções">
                  {results.songs.map((s) => (
                    <Row key={s.id} onClick={() => go(`/songs/${s.id}/edit`)}>
                      <Music4 className="h-4 w-4 text-primary" />
                      <span className="truncate">{s.title}</span>
                    </Row>
                  ))}
                </Section>
              )}
              {results.projects.length > 0 && (
                <Section label="Projetos">
                  {results.projects.map((p) => (
                    <Row key={p.id} onClick={() => go(`/projects/${p.id}`)}>
                      <Disc3 className="h-4 w-4 text-primary" />
                      <span className="truncate">{p.name}</span>
                      <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">
                        {p.type}
                      </span>
                    </Row>
                  ))}
                </Section>
              )}
              {results.users.length > 0 && (
                <Section label="Compositores">
                  {results.users.map((u) => (
                    <Row key={u.id} onClick={() => go(`/profile`)}>
                      <UserAvatar user={u} size="xs" />
                      <span className="truncate">{u.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">@{u.username}</span>
                    </Row>
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-1 pb-1">
      <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
    >
      {children}
    </button>
  );
}