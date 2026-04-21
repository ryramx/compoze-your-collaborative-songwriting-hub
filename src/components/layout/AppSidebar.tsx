import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Music4,
  FolderTree,
  Disc3,
  Newspaper,
  MessageCircle,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/compoze/Logo";
import { useCompoze } from "@/store/compozeStore";
import { UserAvatar } from "@/components/compoze/UserAvatar";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Canções", url: "/songs", icon: Music4 },
  { title: "Pastas", url: "/folders", icon: FolderTree },
  { title: "Projetos", url: "/projects", icon: Disc3 },
];

const socialItems = [
  { title: "Feed", url: "/feed", icon: Newspaper },
  { title: "Mensagens", url: "/messages", icon: MessageCircle },
  { title: "Mapa", url: "/map", icon: MapPin },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (url: string) =>
    url === "/" ? location.pathname === "/" : location.pathname.startsWith(url);
  const me = useCompoze((s) => s.users.find((u) => u.id === s.currentUserId));

  const renderItem = (item: { title: string; url: string; icon: any }) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild tooltip={item.title}>
        <NavLink
          to={item.url}
          end={item.url === "/"}
          className={({ isActive: a }) =>
            cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
              a
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-medium">{item.title}</span>}
          {isActive(item.url) && (
            <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-glow" />
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Logo collapsed={collapsed} />
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{mainItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-4">
          {!collapsed && (
            <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              Comunidade
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{socialItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavLink
          to="/profile"
          className={({ isActive: a }) =>
            cn(
              "flex items-center gap-3 rounded-xl p-2 transition-colors",
              a ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
            )
          }
        >
          <UserAvatar user={me} size="sm" />
          {!collapsed && me && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-sidebar-accent-foreground">
                {me.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">@{me.username}</div>
            </div>
          )}
          {!collapsed && <UserIcon className="h-4 w-4 text-muted-foreground" />}
        </NavLink>
      </SidebarFooter>
    </Sidebar>
  );
}
