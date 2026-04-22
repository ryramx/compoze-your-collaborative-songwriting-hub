import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useCompoze } from "@/store/compozeStore";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function MapPage() {
  const users = useCompoze((s) => s.users);
  const [active, setActive] = useState(users[0]);

  const markers = useMemo(
    () =>
      users.map((u) => {
        const icon = L.divIcon({
          html: `<div class="composer-pin" style="border-color: hsl(var(--author-${u.authorColor}))">
                   <img src="${u.avatar}" alt="${u.name}" />
                 </div>`,
          className: "",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -22],
        });
        return { user: u, icon };
      }),
    [users],
  );

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
          <div className="h-[60vh] w-full md:h-[70vh]">
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
              {markers.map(({ user: u, icon }) => (
                <Marker
                  key={u.id}
                  position={[u.location.lat, u.location.lng]}
                  icon={icon}
                  eventHandlers={{ click: () => setActive(u) }}
                >
                  <Popup>
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.location.city}, {u.location.country}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
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
