import * as React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  FileText,
  Image,
  Users,
  UserCheck,
  Church,
  LogOut,
  Shield,
  ChevronDown,
  MoreHorizontal,
  EyeOff,
  Eye,
  Minimize2,
  Maximize2,
  Layers,
  PlusCircle,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  UserPlus,
  UserCog,
  ShieldCheck,
} from "lucide-react";
import { getSession, logoutAndRedirect } from "@/lib/utils";
import { logout } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/modal";
import { canUserAccess } from "@/lib/permissions";

export interface NavigationItem {
  title: string;
  url: string;
  icon: React.ElementType;
  desc: string;
  permission?: string | string[];
  roles?: string[];
}

export interface NavigationSection {
  group: string;
  items: NavigationItem[];
}

const navigation: NavigationSection[] = [
  {
    group: "Ringkasan",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        desc: "Ringkasan metrik statistik & aktivitas gereja",
        permission: "dashboard.view",
      },
    ],
  },
  {
    group: "Pelayanan & Konten",
    items: [
      {
        title: "Jadwal Ibadah & Acara",
        url: "/jadwal",
        icon: CalendarDays,
        desc: "Jadwal ibadah minggu, doa & kegiatan jemaat",
        permission: "jadwal.view",
      },
      {
        title: "Renungan Harian",
        url: "/renungan",
        icon: BookOpen,
        desc: "Artikel santapan rohani harian & firman Tuhan",
        permission: "renungan.view",
      },
      {
        title: "Warta Jemaat",
        url: "/warta",
        icon: FileText,
        desc: "Publikasi warta mingguan & dokumen PDF",
        permission: "warta.view",
      },
      {
        title: "Galeri Dokumentasi",
        url: "/gallery",
        icon: Image,
        desc: "Dokumentasi foto kegiatan ibadah & fellowship",
        permission: "gallery.view",
      },
    ],
  },
  {
    group: "Struktur & Keamanan",
    items: [
      {
        title: "Struktur Organisasi",
        url: "/organization",
        icon: Users,
        desc: "Pengurus Harian Majelis Jemaat & Koordinator Sektor",
        permission: "organization.view",
      },
      {
        title: "Manajemen Pengguna",
        url: "/users",
        icon: UserCheck,
        desc: "Kelola akun pengguna, verifikasi pelayan & peran",
        permission: "users.view",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        title: "Hak Akses & Perizinan",
        url: "/roles",
        icon: ShieldCheck,
        desc: "Konfigurasi perizinan role & otorisasi multi-role",
        permission: "roles.view",
        roles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
];

export function AdminLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSessionState] = React.useState(getSession());

  // Listen to session changes from Profile updates
  React.useEffect(() => {
    const handleSessionUpdate = () => {
      setSessionState(getSession());
    };
    window.addEventListener("session-updated", handleSessionUpdate);
    window.addEventListener("storage", handleSessionUpdate);
    return () => {
      window.removeEventListener("session-updated", handleSessionUpdate);
      window.removeEventListener("storage", handleSessionUpdate);
    };
  }, []);

  // Filter navigation items based on current session's permissions and roles
  const filteredNavigation = React.useMemo(() => {
    return navigation
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          canUserAccess(session, {
            permission: item.permission,
            roles: item.roles,
          }),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [session]);

  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Active Navbar Dropdown state: "pelayanan" | "struktur" | "quickAdd" | "profile" | null
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);

  // Category Minimization State: stores whether a sidebar menu category is collapsed/minimized
  const [collapsedCategories, setCollapsedCategories] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("gpsi_admin_collapsed_categories");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Contextual dropdown menu state for individual categories in the sidebar
  const [activeCategoryMenu, setActiveCategoryMenu] = React.useState<string | null>(null);

  const toggleCategoryCollapse = (groupName: string) => {
    setCollapsedCategories((prev) => {
      const updated = {
        ...prev,
        [groupName]: !prev[groupName],
      };
      try {
        localStorage.setItem("gpsi_admin_collapsed_categories", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const collapseAllCategories = () => {
    const allCollapsed: Record<string, boolean> = {};
    filteredNavigation.forEach((sec) => {
      allCollapsed[sec.group] = true;
    });
    setCollapsedCategories(allCollapsed);
    try {
      localStorage.setItem("gpsi_admin_collapsed_categories", JSON.stringify(allCollapsed));
    } catch {
      // ignore
    }
    setActiveCategoryMenu(null);
  };

  const expandAllCategories = () => {
    const allExpanded: Record<string, boolean> = {};
    filteredNavigation.forEach((sec) => {
      allExpanded[sec.group] = false;
    });
    setCollapsedCategories(allExpanded);
    try {
      localStorage.setItem("gpsi_admin_collapsed_categories", JSON.stringify(allExpanded));
    } catch {
      // ignore
    }
    setActiveCategoryMenu(null);
  };

  // Close category dropdown on window click
  React.useEffect(() => {
    const handleWindowClick = () => setActiveCategoryMenu(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  // Auto-expand category when navigating to a route inside that category
  React.useEffect(() => {
    const activeSection = filteredNavigation.find((sec) =>
      sec.items.some((item) =>
        item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
      )
    );
    if (activeSection && collapsedCategories[activeSection.group]) {
      setCollapsedCategories((prev) => {
        const next = { ...prev, [activeSection.group]: false };
        try {
          localStorage.setItem("gpsi_admin_collapsed_categories", JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  }, [location.pathname, filteredNavigation]);

  // Close dropdown on click outside or escape key
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setActiveCategoryMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close dropdown whenever location changes
  React.useEffect(() => {
    setActiveDropdown(null);
    setActiveCategoryMenu(null);
  }, [location.pathname]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path.startsWith("/jadwal")) return "Jadwal Ibadah & Acara";
    if (path.startsWith("/renungan")) return "Renungan Harian";
    if (path.startsWith("/warta")) return "Warta Jemaat";
    if (path.startsWith("/gallery")) return "Galeri Foto";
    if (path.startsWith("/organization")) return "Struktur Organisasi";
    if (path.startsWith("/users")) return "Manajemen Pengguna";
    if (path.startsWith("/roles")) return "Hak Akses & Perizinan";
    if (path.startsWith("/profile")) return "Manajemen Profil";
    return "Portal Admin";
  };

  const isPelayananActive =
    location.pathname.startsWith("/jadwal") ||
    location.pathname.startsWith("/renungan") ||
    location.pathname.startsWith("/warta") ||
    location.pathname.startsWith("/gallery");

  const isStrukturActive =
    location.pathname.startsWith("/organization") ||
    location.pathname.startsWith("/users") ||
    location.pathname.startsWith("/roles");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout().catch(() => null);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      toast.info("Anda telah keluar dari sistem");
      logoutAndRedirect();
    }
  };

  return (
    <SidebarProvider>
      {/* ─── SIDEBAR ───────────────────────────────────────────────────────────── */}
      <Sidebar className="border-r border-border/60">
        <SidebarHeader className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
              <Church className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight truncate text-foreground">
                GPSI Soteria
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Administrator Portal
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2 gap-3">
          {/* Quick Header Toolbar with Minimize / Expand All Categories */}
          <div className="flex items-center justify-between px-2 pt-1 pb-1.5 border-b border-border/40 text-[11px] text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Kategori Menu</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={expandAllCategories}
                title="Buka semua kategori menu"
                className="px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Buka Semua
              </button>
              <span className="text-border/60">|</span>
              <button
                type="button"
                onClick={collapseAllCategories}
                title="Minimize semua kategori menu"
                className="px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Minimize
              </button>
            </div>
          </div>

          {filteredNavigation.map((section) => {
            const isCollapsed = !!collapsedCategories[section.group];
            const hasActiveChild = section.items.some((item) =>
              item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
            );

            return (
              <SidebarGroup key={section.group} className="py-1">
                {/* Category Header with Toggle Button & Contextual Dropdown Menu */}
                <div className="relative group/cat mb-1">
                  <div
                    className={`flex items-center justify-between px-2 py-1.5 rounded-xl transition-all ${
                      hasActiveChild && isCollapsed
                        ? "bg-indigo-600/10 border border-indigo-500/30"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    {/* Clickable Header Label to Toggle Minimize/Expand */}
                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(section.group)}
                      className="flex-1 flex items-center gap-2 text-left cursor-pointer select-none min-w-0"
                      title={isCollapsed ? `Buka kategori ${section.group}` : `Minimize kategori ${section.group}`}
                    >
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider group-hover/cat:text-foreground transition-colors flex items-center gap-1.5 truncate">
                        {section.group}
                        {hasActiveChild && isCollapsed && (
                          <span
                            className="size-2 rounded-full bg-indigo-500 animate-pulse shrink-0"
                            title="Menu aktif ada di dalam kategori ini"
                          />
                        )}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground font-mono shrink-0">
                        {section.items.length}
                      </span>
                    </button>

                    {/* Action Buttons: Dropdown Action Menu Trigger & Minimize/Expand Chevron Toggle Button */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Contextual Dropdown Menu Trigger Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCategoryMenu(
                              activeCategoryMenu === section.group ? null : section.group
                            );
                          }}
                          className="size-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer opacity-70 group-hover/cat:opacity-100"
                          title="Menu opsi dropdown kategori"
                        >
                          <MoreHorizontal className="size-3.5" />
                        </button>

                        {/* Category Dropdown Menu Popup */}
                        {activeCategoryMenu === section.group && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-7 w-48 rounded-xl bg-card/95 backdrop-blur-xl border border-border shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95"
                          >
                            <div className="px-2 py-1 border-b border-border/50 mb-1">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                {section.group}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                toggleCategoryCollapse(section.group);
                                setActiveCategoryMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted text-left transition-colors cursor-pointer"
                            >
                              {isCollapsed ? (
                                <>
                                  <Eye className="size-3.5 text-indigo-500" />
                                  <span>Buka Kategori Ini</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="size-3.5 text-muted-foreground" />
                                  <span>Minimize Kategori Ini</span>
                                </>
                              )}
                            </button>
                            <div className="h-px bg-border/40 my-1" />
                            <button
                              type="button"
                              onClick={expandAllCategories}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted text-left transition-colors cursor-pointer"
                            >
                              <Maximize2 className="size-3.5 text-emerald-500" />
                              <span>Buka Semua Kategori</span>
                            </button>
                            <button
                              type="button"
                              onClick={collapseAllCategories}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-muted text-left transition-colors cursor-pointer"
                            >
                              <Minimize2 className="size-3.5 text-amber-500" />
                              <span>Minimize Semua Kategori</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Minimize/Expand Toggle Chevron Button */}
                      <button
                        type="button"
                        onClick={() => toggleCategoryCollapse(section.group)}
                        className="size-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title={isCollapsed ? `Buka kategori ${section.group}` : `Minimize kategori ${section.group}`}
                      >
                        <ChevronDown
                          className={`size-3.5 transition-transform duration-200 ${
                            isCollapsed ? "-rotate-90 text-muted-foreground/60" : "rotate-0 text-muted-foreground"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Minimized Placeholder Card or Expanded Items */}
                {isCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleCategoryCollapse(section.group)}
                    className="mx-2 my-1 px-2.5 py-1.5 rounded-xl border border-dashed border-border/80 bg-muted/20 hover:bg-muted/60 text-[11px] text-muted-foreground flex items-center justify-between transition-all cursor-pointer group/min"
                    title={`Klik untuk membuka kategori ${section.group}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <EyeOff className="size-3 text-muted-foreground/60 group-hover/min:text-indigo-500 transition-colors" />
                      <span>{section.items.length} menu diminimalkan</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover/min:underline">
                      Buka
                    </span>
                  </button>
                ) : (
                  <SidebarGroupContent className="animate-in fade-in duration-200">
                    <SidebarMenu>
                      {section.items.map((item) => {
                        const isActive =
                          item.url === "/"
                            ? location.pathname === "/"
                            : location.pathname.startsWith(item.url);
                        const Icon = item.icon;
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              isActive={isActive}
                              onClick={() => navigate(item.url)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                isActive
                                  ? "!bg-indigo-600 !text-white data-active:!bg-indigo-600 data-active:!text-white shadow-sm hover:!bg-indigo-700 hover:!text-white [&_svg]:!text-white"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              <Icon
                                className={`size-4 shrink-0 transition-colors ${
                                  isActive ? "!text-white text-white" : "text-muted-foreground"
                                }`}
                              />
                              <span className="truncate">{item.title}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border/50">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/60 border border-border/50">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              title="Kelola Profil & Akun Anda"
              className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition-opacity cursor-pointer group flex-1"
            >
              <div className="size-8 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs uppercase group-hover:scale-105 transition-transform">
                {session?.name ? session.name.slice(0, 2) : "AD"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {session?.name || "Admin"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                  <Shield className="size-2.5 text-indigo-500" />
                  {session?.role || "PENGELOLA"}
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              title="Keluar dari sistem"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* ─── MAIN CONTENT INSET ─────────────────────────────────────────────────── */}
      <SidebarInset>
        {/* ─── REDESIGNED INTERACTIVE NAVBAR (HEADER) ───────────────────────────── */}
        <header
          ref={dropdownRef}
          className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/90 backdrop-blur-xl px-4 sm:px-6 sticky top-0 z-30"
        >
          {/* Left Section: Sidebar Trigger & Breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <Breadcrumb className="hidden sm:block">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/");
                    }}
                    className="cursor-pointer"
                  >
                    Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {getBreadcrumbTitle()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Center Section: Interactive Category Dropdown Buttons (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-2">
            {/* 1. Category Dropdown: Pelayanan & Konten (Hanya tampil jika ada menu yang diizinkan) */}
            {(() => {
              const pelayananItems =
                filteredNavigation.find((s) => s.group === "Pelayanan & Konten")
                  ?.items || [];
              if (pelayananItems.length === 0) return null;

              return (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("pelayanan")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      isPelayananActive || activeDropdown === "pelayanan"
                        ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 shadow-2xs"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                    }`}
                  >
                    <Layers className="size-3.5" />
                    <span>Pelayanan & Konten</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-500 font-mono">
                      {pelayananItems.length}
                    </span>
                    <ChevronDown
                      className={`size-3 transition-transform duration-200 ${
                        activeDropdown === "pelayanan" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu: Pelayanan & Konten */}
                  {activeDropdown === "pelayanan" && (
                    <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Kategori Pelayanan
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Kelola jadwal, artikel renungan, warta, & galeri
                        </p>
                      </div>
                      <div className="space-y-1">
                        {pelayananItems.map((item) => {
                          const Icon = item.icon;
                          const active = location.pathname.startsWith(item.url);
                          return (
                            <button
                              key={item.url}
                              type="button"
                              onClick={() => {
                                navigate(item.url);
                                setActiveDropdown(null);
                              }}
                              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                                active
                                  ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400"
                                  : "hover:bg-muted text-foreground"
                              }`}
                            >
                              <div
                                className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  active
                                    ? "bg-indigo-600 text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold leading-tight">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 2. Category Dropdown: Struktur & Keamanan (Hanya tampil jika ada menu yang diizinkan) */}
            {(() => {
              const strukturItems =
                filteredNavigation.find((s) => s.group === "Struktur & Keamanan")
                  ?.items || [];
              if (strukturItems.length === 0) return null;

              return (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown("struktur")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                      isStrukturActive || activeDropdown === "struktur"
                        ? "bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 shadow-2xs"
                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                    }`}
                  >
                    <Shield className="size-3.5" />
                    <span>Struktur & Keamanan</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-500 font-mono">
                      {strukturItems.length}
                    </span>
                    <ChevronDown
                      className={`size-3 transition-transform duration-200 ${
                        activeDropdown === "struktur" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu: Struktur & Keamanan */}
                  {activeDropdown === "struktur" && (
                    <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Struktur & Keamanan
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Organisasi majelis, sektor, & otorisasi akun
                        </p>
                      </div>
                      <div className="space-y-1">
                        {strukturItems.map((item) => {
                          const Icon = item.icon;
                          const active = location.pathname.startsWith(item.url);
                          return (
                            <button
                              key={item.url}
                              type="button"
                              onClick={() => {
                                navigate(item.url);
                                setActiveDropdown(null);
                              }}
                              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                                active
                                  ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400"
                                  : "hover:bg-muted text-foreground"
                              }`}
                            >
                              <div
                                className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  active
                                    ? "bg-indigo-600 text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold leading-tight">
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {item.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. Dropdown: Aksi Cepat (+ Tambah Konten) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("quickAdd")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
              >
                <PlusCircle className="size-3.5" />
                <span>Aksi Cepat</span>
                <ChevronDown
                  className={`size-3 transition-transform duration-200 ${
                    activeDropdown === "quickAdd" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu: Aksi Cepat */}
              {activeDropdown === "quickAdd" && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border/50 mb-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="size-3 text-indigo-500" />
                      <span>Tambah Konten Baru</span>
                    </p>
                  </div>
                  <div className="space-y-0.5 text-xs">
                    {canUserAccess(session, { permission: "jadwal.manage" }) && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/jadwal");
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                      >
                        <CalendarDays className="size-3.5 text-indigo-500" />
                        <span>Jadwal Ibadah Baru</span>
                      </button>
                    )}
                    {canUserAccess(session, { permission: "renungan.manage" }) && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/renungan");
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                      >
                        <BookOpen className="size-3.5 text-indigo-500" />
                        <span>Tulis Renungan Baru</span>
                      </button>
                    )}
                    {canUserAccess(session, { permission: "warta.manage" }) && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/warta");
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                      >
                        <FileText className="size-3.5 text-indigo-500" />
                        <span>Unggah Warta Jemaat</span>
                      </button>
                    )}
                    {canUserAccess(session, { permission: "gallery.manage" }) && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/gallery");
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                      >
                        <Image className="size-3.5 text-indigo-500" />
                        <span>Dokumentasi Foto Galeri</span>
                      </button>
                    )}
                    {canUserAccess(session, {
                      permission: "roles.manage",
                      roles: ["SUPER_ADMIN", "ADMIN"],
                    }) && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/roles");
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                      >
                        <ShieldCheck className="size-3.5 text-indigo-500" />
                        <span>Kelola Hak Akses & Role</span>
                      </button>
                    )}
                    {canUserAccess(session, {
                      permission: "users.manage",
                      roles: ["SUPER_ADMIN", "ADMIN"],
                    }) && (
                      <>
                        <div className="h-px bg-border/50 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            navigate("/users");
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/10 font-medium transition-colors text-left cursor-pointer"
                        >
                          <UserPlus className="size-3.5" />
                          <span>Pendaftaran Pelayan Baru</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Section: API Status, Public Web Link, and User Profile Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* Status Indicator */}
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium hidden md:inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </span>

            {/* Link to Public Website */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              title="Buka Website Jemaat Publik"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 transition-colors"
            >
              <span>Website Jemaat</span>
              <ExternalLink className="size-3" />
            </a>

            {/* 4. User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("profile")}
                className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition-all cursor-pointer ${
                  location.pathname === "/profile" || activeDropdown === "profile"
                    ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                    : "border-border/60 hover:bg-muted bg-background"
                }`}
              >
                <div className="size-7 rounded-lg bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 uppercase border border-indigo-500/30">
                  {session?.name ? session.name.slice(0, 2) : "AD"}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-semibold text-foreground max-w-[100px] truncate">
                    {session?.name || "Admin"}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium mt-0.5">
                    {session?.role || "PENGELOLA"}
                  </span>
                </div>
                <ChevronDown
                  className={`size-3 text-muted-foreground transition-transform duration-200 ${
                    activeDropdown === "profile" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu: Profile */}
              {activeDropdown === "profile" && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-3 bg-muted/50 rounded-xl border border-border/50 mb-2">
                    <p className="text-xs font-bold text-foreground truncate">
                      {session?.name || "Administrator"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {session?.email || "admin@gpsisoteria.org"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-semibold text-[10px] uppercase border border-indigo-500/30">
                        {session?.role || "PENGELOLA"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                        <CheckCircle2 className="size-3" />
                        Terverifikasi
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/profile");
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                        location.pathname === "/profile"
                          ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <UserCog className="size-3.5 text-indigo-500" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium">Manajemen Profil</span>
                        <span className="text-[10px] text-muted-foreground">
                          Kelola data profil & akun Anda
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate("/users");
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                        location.pathname === "/users"
                          ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <UserCheck className="size-3.5 text-slate-400" />
                      <span>Manajemen Akun & Pengguna</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        navigate("/auth/register");
                        setActiveDropdown(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-muted transition-colors text-left cursor-pointer"
                    >
                      <UserPlus className="size-3.5 text-slate-400" />
                      <span>Pendaftaran Akun Baru</span>
                    </button>

                    <div className="h-px bg-border/50 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-destructive hover:bg-destructive/10 font-semibold transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      <span>Keluar dari Sistem</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── PAGE BODY ───────────────────────────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children ?? <Outlet />}
        </main>
      </SidebarInset>

      {/* ─── LOGOUT CONFIRMATION DIALOG ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari portal administrator GPSI Soteria?"
        confirmText="Keluar"
        cancelText="Batal"
        isDestructive={true}
        isLoading={isLoggingOut}
      />
    </SidebarProvider>
  );
}
export default AdminLayout;
