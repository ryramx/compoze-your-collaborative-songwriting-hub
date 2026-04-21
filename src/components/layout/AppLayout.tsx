import { Outlet, useLocation } from "react-router-dom";
import { Bell, Search, Sparkles } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/songs": "Canções",
  "/folders": "Pastas",
  "/projects": "Projetos",
  "/feed": "Feed",
  "/messages": "Mensagens",
  "/map": "Mapa de compositores",
  "/profile": "Perfil",
};

export default function AppLayout() {
  const location = useLocation();
  const baseKey = "/" + (location.pathname.split("/")[1] || "");
  const title =
    titles[location.pathname] || titles[baseKey] || "Compoze";

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Compoze
              </span>
              <h1 className="font-display text-lg font-semibold leading-tight">{title}</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar canções, projetos, compositores…"
                  className="h-9 w-72 rounded-full bg-muted/50 pl-9"
                />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="sm" className="rounded-full bg-gradient-hero text-primary-foreground shadow-glow hover:opacity-90">
                <Sparkles className="h-4 w-4" />
                Nova canção
              </Button>
            </div>
          </header>
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 overflow-x-hidden"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
}
