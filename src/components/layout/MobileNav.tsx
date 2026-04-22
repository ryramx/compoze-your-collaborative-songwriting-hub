import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Music4, FolderTree, Disc3, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Home", url: "/", icon: LayoutDashboard, end: true },
  { title: "Canções", url: "/songs", icon: Music4 },
  { title: "Pastas", url: "/folders", icon: FolderTree },
  { title: "Projetos", url: "/projects", icon: Disc3 },
  { title: "Feed", url: "/feed", icon: Newspaper },
];

export function MobileNav() {
  const { pathname } = useLocation();
  if (pathname.includes("/edit")) return null;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.url}>
            <NavLink
              to={item.url}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]")} />
                  <span>{item.title}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}