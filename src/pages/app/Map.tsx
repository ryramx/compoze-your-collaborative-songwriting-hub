import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function MapPage() {
  const users = useCompoze((s) => s.users);
  const [active, setActive] = useState(users[0]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Mapa de compositores</h1>
          <p className="text-sm text-muted-foreground">Encontre quem está criando perto de você.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden border-border/60 bg-card p-0">
          <div className="h-[70vh] w-full">
            <MapContainer
              center={[-15, -47]}
              zoom={3}
              scrollWheelZoom
              className="h-full w-full"
              style={{ background: "hsl(var(--background))" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {users.map((u) => (
                <CircleMarker
                  key={u.id}
                  center={[u.location.lat, u.location.lng]}
                  radius={10}
                  pathOptions={{
                    color: `hsl(var(--author-${u.authorColor}))`,
                    fillColor: `hsl(var(--author-${u.authorColor}))`,
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                  eventHandlers={{ click: () => setActive(u) }}
                >
                  <Popup>
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-xs">{u.location.city}, {u.location.country}</div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </Card>

        <Card className="space-y-3 border-border/60 bg-gradient-card p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {users.length} compositores no mapa
          </div>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => setActive(u)}
              className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted/40 ${
                active.id === u.id ? "bg-muted/60" : ""
              }`}
            >
              <UserAvatar user={u} size="md" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{u.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {u.location.city}
                </div>
              </div>
            </button>
          ))}
          <Button asChild variant="outline" className="w-full rounded-full border-border/60">
            <Link to={`/profile`}>Ver perfil</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
