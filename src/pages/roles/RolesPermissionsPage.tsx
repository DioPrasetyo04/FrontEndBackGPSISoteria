import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPermissionsMeta,
  getRolePermissionsMatrix,
  updateRolePermission,
  updateUserPermissions,
  getUserPermissions,
} from "@/services/permission/permission.service";
import { getAllUsers } from "@/services/user/user.service";
import type { UserRole } from "@/services/user/types/user";
import type {
  PermissionModuleGroup,
  RoleInfo,
} from "@/services/permission/types/permission";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { getSession } from "@/lib/utils";
import {
  DEFAULT_AVAILABLE_ROLES,
  DEFAULT_PERMISSION_MODULES,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/permissions";
import {
  ShieldCheck,
  Shield,
  KeyRound,
  Users,
  CheckCircle2,
  Lock,
  RotateCcw,
  Save,
  CheckSquare,
  Square,
  Sparkles,
  Search,
  UserPlus,
  Layers,
  Info,
  CalendarDays,
  BookOpen,
  FileText,
  Image,
  LayoutDashboard,
  UserCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const moduleIcons: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  jadwal: CalendarDays,
  renungan: BookOpen,
  warta: FileText,
  gallery: Image,
  organization: Users,
  users: UserCheck,
  roles: KeyRound,
};

const roleColors: Record<UserRole, { badge: string; border: string; bg: string }> = {
  SUPER_ADMIN: {
    badge: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    border: "border-red-500/40",
    bg: "bg-red-500/5",
  },
  ADMIN: {
    badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    border: "border-indigo-500/40",
    bg: "bg-indigo-500/5",
  },
  PHMJ: {
    badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/5",
  },
  MAJELIS: {
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
  },
  KOORSEK: {
    badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    border: "border-purple-500/40",
    bg: "bg-purple-500/5",
  },
  PENGELOLA: {
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
  },
};

export const RolesPermissionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const session = getSession();
  const currentUserId = session?.id;
  const currentUserEmail = session?.email;

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const userParam = searchParams.get("userId");

  // Active Main Tab: "roles" (Matriks Role) | "users" (Otorisasi Pengguna)
  const [activeTab, setActiveTab] = useState<"roles" | "users">(
    tabParam === "users" ? "users" : "roles"
  );

  // Selected Role in Tab 1
  const [selectedRole, setSelectedRole] = useState<UserRole>("PENGELOLA");

  // Local draft of permissions for the selected role (fallback to default permissions)
  const [draftPermissions, setDraftPermissions] = useState<Record<UserRole, string[]>>(
    DEFAULT_ROLE_PERMISSIONS as any
  );

  // Tab 2 State: Selected user for user-level multi-role & permissions
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    userParam && userParam !== currentUserId ? userParam : null
  );
  const [userRolesDraft, setUserRolesDraft] = useState<UserRole[]>([]);
  const [userCustomPermsDraft, setUserCustomPermsDraft] = useState<string[]>([]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    const uid = searchParams.get("userId");
    if (tab === "users") {
      setActiveTab("users");
    }
    if (uid && uid !== currentUserId) {
      setSelectedUserId(uid);
    }
  }, [searchParams, currentUserId]);

  // 1. Fetch metadata (modules, definitions, available roles)
  const {
    data: metaResponse,
    isError: errorMeta,
    refetch: refetchMeta,
  } = useQuery({
    queryKey: ["roles-permissions-meta"],
    queryFn: getPermissionsMeta,
    staleTime: 60000,
  });

  // 2. Fetch current role permissions matrix from DB
  const {
    data: matrixResponse,
    isLoading: loadingMatrix,
    isError: errorMatrix,
    refetch: refetchMatrix,
  } = useQuery({
    queryKey: ["roles-permissions-matrix"],
    queryFn: getRolePermissionsMatrix,
    staleTime: 60000,
  });

  // Sync draft permissions whenever matrix is loaded or updated
  React.useEffect(() => {
    if (matrixResponse?.data) {
      setDraftPermissions(matrixResponse.data as any);
    }
  }, [matrixResponse?.data]);

  // 3. Fetch users for Tab 2
  const { data: usersResponse, isLoading: loadingUsers } = useQuery({
    queryKey: ["all-users-permissions-list", userSearch],
    queryFn: () => getAllUsers({ q: userSearch.trim() || undefined, limit: 50 }),
  });

  // 4. Fetch specific selected user detail
  const { data: userPermDetailResponse, isLoading: loadingUserPerm } = useQuery({
    queryKey: ["user-permission-detail", selectedUserId],
    queryFn: () => (selectedUserId ? getUserPermissions(selectedUserId) : null),
    enabled: Boolean(selectedUserId),
  });

  // Sync user draft when user detail loads
  React.useEffect(() => {
    if (userPermDetailResponse?.data) {
      const u = userPermDetailResponse.data;
      setUserRolesDraft(u.roles || [u.primaryRole]);
      setUserCustomPermsDraft(u.customPermissions || []);
    }
  }, [userPermDetailResponse?.data]);

  // Mutation: Update Role Permissions
  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      const perms = draftPermissions[selectedRole] || [];
      return updateRolePermission(selectedRole, { permissions: perms });
    },
    onSuccess: () => {
      toast.success(`Hak akses untuk role ${selectedRole} berhasil disimpan`, {
        description: "Pengguna dengan role ini akan memiliki menu dan izin yang diperbarui secara otomatis.",
      });
      queryClient.invalidateQueries({ queryKey: ["roles-permissions-matrix"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Gagal memperbarui izin role";
      toast.error("Terjadi Kesalahan", { description: msg });
    },
  });

  // Mutation: Update User Permissions (multi-role & custom perms)
  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUserId) return;
      return updateUserPermissions(selectedUserId, {
        roles: userRolesDraft,
        role: userRolesDraft[0] || "PENGELOLA",
        customPermissions: userCustomPermsDraft,
      });
    },
    onSuccess: () => {
      toast.success("Otorisasi pengguna berhasil diperbarui", {
        description: "Peran ganda dan izin kustom pengguna telah aktif di sistem.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-permission-detail", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["all-users-permissions-list"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Gagal menyimpan otorisasi pengguna";
      toast.error("Gagal Memperbarui", { description: msg });
    },
  });

  const meta = metaResponse?.data;
  const modules: PermissionModuleGroup[] =
    meta?.modules && meta.modules.length > 0
      ? meta.modules
      : (DEFAULT_PERMISSION_MODULES as any);
  const availableRoles: RoleInfo[] =
    meta?.availableRoles && meta.availableRoles.length > 0
      ? (meta.availableRoles as RoleInfo[])
      : (DEFAULT_AVAILABLE_ROLES as RoleInfo[]);
  const currentRolePerms =
    draftPermissions[selectedRole] ||
    (DEFAULT_ROLE_PERMISSIONS[selectedRole] as string[]) ||
    [];

  const togglePermissionForRole = (permId: string) => {
    if (selectedRole === "SUPER_ADMIN") return; // Super admin selalu wildcard
    setDraftPermissions((prev) => {
      const currentList = prev[selectedRole] || [];
      const exists = currentList.includes(permId);
      const nextList = exists
        ? currentList.filter((p) => p !== permId)
        : [...currentList, permId];
      return {
        ...prev,
        [selectedRole]: nextList,
      };
    });
  };

  const selectAllForRole = () => {
    if (selectedRole === "SUPER_ADMIN") return;
    const allIds =
      meta?.allPermissions?.map((p) => p.id) ||
      DEFAULT_PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.id));
    setDraftPermissions((prev) => ({
      ...prev,
      [selectedRole]: allIds,
    }));
  };

  const clearAllForRole = () => {
    if (selectedRole === "SUPER_ADMIN") return;
    setDraftPermissions((prev) => ({
      ...prev,
      [selectedRole]: [],
    }));
  };

  const resetRoleToDefault = () => {
    const def =
      meta?.defaultRolePermissions?.[selectedRole] ||
      DEFAULT_ROLE_PERMISSIONS[selectedRole] ||
      [];
    setDraftPermissions((prev) => ({
      ...prev,
      [selectedRole]: [...def],
    }));
    toast.info(`Perizinan role ${selectedRole} dikembalikan ke konfigurasi default.`);
  };

  const toggleRoleForUser = (roleValue: UserRole) => {
    setUserRolesDraft((prev) => {
      if (prev.includes(roleValue)) {
        // Jangan biarkan kosong sama sekali
        if (prev.length <= 1) {
          toast.warning("Pengguna harus memiliki minimal satu peran (role).");
          return prev;
        }
        return prev.filter((r) => r !== roleValue);
      } else {
        return [...prev, roleValue];
      }
    });
  };

  const toggleCustomPermForUser = (permId: string) => {
    setUserCustomPermsDraft((prev) => {
      if (prev.includes(permId)) {
        return prev.filter((p) => p !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const rawUsersList = usersResponse?.data?.items || usersResponse?.data?.users || [];
  // User requirement: Sembunyikan user yang sedang login, hanya tampilkan user lain untuk konfigurasi
  const usersList = rawUsersList.filter(
    (u) => u.id !== currentUserId && u.email !== currentUserEmail
  );

  // Auto-select user pertama jika belum ada yang terpilih atau user yang dipilih adalah akun sendiri
  useEffect(() => {
    if (usersList.length > 0) {
      if (!selectedUserId || selectedUserId === currentUserId) {
        setSelectedUserId(usersList[0].id);
      }
    }
  }, [usersList, selectedUserId, currentUserId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="size-6 text-indigo-500" />
            Hak Akses & Otorisasi Peran
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Konfigurasi granular perizinan role dan atur peran ganda (multiple roles) serta perizinan kustom bagi setiap akun staf.
          </p>
        </div>

        {/* Tab Buttons Switcher */}
        <div className="inline-flex p-1 bg-muted/60 border border-border/60 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "roles"
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="size-3.5 text-indigo-500" />
            <span>Matriks Peran (Role Matrix)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-3.5 text-purple-500" />
            <span>Otorisasi Pengguna (User Multi-Roles)</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: ROLE MATRIX ──────────────────────────────────────────────── */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          {/* Role Selector Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {availableRoles.map((r: RoleInfo) => {
              const rRole = r.role as UserRole;
              const isSelected = selectedRole === rRole;
              const color = roleColors[rRole] || roleColors.PENGELOLA;
              const count =
                rRole === "SUPER_ADMIN"
                  ? meta?.allPermissions?.length || 15
                  : (draftPermissions[rRole] || []).length;

              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(rRole)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `border-indigo-600 bg-indigo-600/10 shadow-sm ring-1 ring-indigo-600/30`
                      : `border-border/70 bg-card hover:bg-muted/40`
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${color.badge}`}
                    >
                      {r.role}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                      {count} Izin
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-tight truncate">
                      {r.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {r.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Role Permissions Configuration Panel */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        roleColors[selectedRole]?.badge
                      }`}
                    >
                      {selectedRole}
                    </span>
                    <CardTitle className="text-base font-bold">
                      Konfigurasi Izin Akses:{" "}
                      {availableRoles.find((r: RoleInfo) => r.role === selectedRole)?.label ||
                        selectedRole}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Tentukan modul dan menu mana saja yang dapat dilihat dan dikelola oleh pemegang peran ini.
                  </CardDescription>
                </div>

                {/* Role Actions */}
                {selectedRole !== "SUPER_ADMIN" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllForRole}
                      className="px-3 py-1.5 rounded-xl border border-border/60 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckSquare className="size-3.5 text-indigo-500" />
                      <span>Pilih Semua</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearAllForRole}
                      className="px-3 py-1.5 rounded-xl border border-border/60 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Square className="size-3.5 text-muted-foreground" />
                      <span>Hapus Semua</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetRoleToDefault}
                      title="Kembalikan ke rekomendasi default gereja"
                      className="px-3 py-1.5 rounded-xl border border-border/60 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Reset Default</span>
                    </button>
                    <button
                      type="button"
                      disabled={updateRoleMutation.isPending}
                      onClick={() => updateRoleMutation.mutate()}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {updateRoleMutation.isPending ? (
                        <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      <span>Simpan Perubahan Role</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
                    <Sparkles className="size-3.5" />
                    <span>Super Admin Memiliki Akses Penuh Sistem (Wildcard *)</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {(errorMeta || errorMatrix) && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                    <span>Menampilkan konfigurasi default role. Server belum dapat disinkronkan.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      refetchMeta();
                      refetchMatrix();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="size-3" /> Coba Sinkronkan
                  </button>
                </div>
              )}

              {loadingMatrix && !matrixResponse && modules.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="size-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Memuat matriks perizinan...</span>
                  </div>
                </div>
              ) : selectedRole === "SUPER_ADMIN" ? (
                <div className="p-6 rounded-2xl bg-muted/40 border border-border/60 text-center space-y-3">
                  <div className="mx-auto size-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
                    <Lock className="size-6" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">
                    Peran SUPER_ADMIN Tidak Memerlukan Konfigurasi Granular
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                    Role SUPER_ADMIN merupakan level wewenang tertinggi yang selalu diizinkan mengakses dan mengelola seluruh modul, database, serta fitur keamanan tanpa batasan hak akses.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map((group) => {
                    const GroupIcon = moduleIcons[group.module] || Layers;
                    const groupPermIds = group.permissions.map((p) => p.id);
                    const enabledCount = groupPermIds.filter((id) =>
                      currentRolePerms.includes(id)
                    ).length;
                    const isAllEnabled = enabledCount === groupPermIds.length;

                    return (
                      <div
                        key={group.module}
                        className="rounded-2xl border border-border/70 bg-card p-4 flex flex-col justify-between shadow-2xs hover:border-indigo-500/40 transition-colors"
                      >
                        <div>
                          {/* Module Header */}
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <GroupIcon className="size-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-foreground">
                                  {group.title}
                                </h4>
                                <span className="text-[10px] text-muted-foreground">
                                  {enabledCount} dari {group.permissions.length} izin aktif
                                </span>
                              </div>
                            </div>

                            <span
                              className={`size-2 rounded-full ${
                                isAllEnabled
                                  ? "bg-emerald-500"
                                  : enabledCount > 0
                                  ? "bg-amber-500"
                                  : "bg-muted-foreground/30"
                              }`}
                              title={
                                isAllEnabled
                                  ? "Semua izin aktif"
                                  : enabledCount > 0
                                  ? "Sebagian izin aktif"
                                  : "Tidak ada izin aktif (Menu Disembunyikan)"
                              }
                            />
                          </div>

                          {/* Permission Toggles List */}
                          <div className="space-y-2.5">
                            {group.permissions.map((perm) => {
                              const isChecked = currentRolePerms.includes(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  onClick={() => togglePermissionForRole(perm.id)}
                                  className={`flex items-start gap-3 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                                    isChecked
                                      ? "bg-indigo-600/10 border-indigo-500/30 text-foreground"
                                      : "bg-muted/30 border-transparent hover:bg-muted/60 text-muted-foreground"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="mt-0.5 size-4 rounded-md accent-indigo-600 cursor-pointer shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`text-xs font-semibold leading-tight ${
                                        isChecked ? "text-indigo-600 dark:text-indigo-400 font-bold" : ""
                                      }`}
                                    >
                                      {perm.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                                      {perm.description}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {enabledCount === 0 && (
                          <div className="mt-3 pt-2 border-t border-border/40 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                            <Info className="size-3 shrink-0" />
                            <span>Menu modul ini akan disembunyikan di sidebar</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: USER MULTI-ROLES & CUSTOM OVERRIDES ───────────────────────── */}
      {activeTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Users List & Search */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="size-4 text-purple-500" />
                  <span>Daftar Pengguna Sistem</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Pilih akun pengguna untuk menetapkan peran ganda atau perizinan khusus.
                </CardDescription>

                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Cari nama atau email staf..."
                    className="w-full pl-9 pr-3 py-1.5 bg-muted/40 border border-border/60 rounded-xl text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-foreground"
                  />
                </div>

                <div className="mt-2.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Info className="size-3.5 text-purple-500 shrink-0" />
                  <span>
                    Akun Anda ({session?.name || "Login"}) disembunyikan dari daftar untuk mencegah modifikasi hak akses mandiri.
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-2 divide-y divide-border/40 max-h-[550px] overflow-y-auto">
                {loadingUsers ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Memuat daftar pengguna...
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Tidak ditemukan pengguna yang sesuai.
                  </div>
                ) : (
                  usersList.map((user) => {
                    const isSelected = selectedUserId === user.id;
                    const roleBadge = roleColors[user.role] || roleColors.PENGELOLA;
                    const hasMultiRole = user.roles && user.roles.length > 1;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUserId(user.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-600/10 border border-purple-500/30"
                            : "hover:bg-muted/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-8 rounded-lg bg-purple-500/15 text-purple-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                            {user.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${roleBadge.badge}`}
                          >
                            {user.role}
                          </span>
                          {hasMultiRole && (
                            <span className="text-[9px] font-semibold text-purple-600 dark:text-purple-400">
                              +{user.roles!.length - 1} Peran Lain
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: User Multi-Role & Permissions Editor */}
          <div className="lg:col-span-7">
            {selectedUserId ? (
              <Card className="border border-border/80">
                <CardHeader className="border-b border-border/60 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold">
                          {userPermDetailResponse?.data?.name || "Memuat detail pengguna..."}
                        </CardTitle>
                        <span className="text-xs font-mono text-muted-foreground">
                          ({userPermDetailResponse?.data?.email})
                        </span>
                      </div>
                      <CardDescription className="text-xs mt-1">
                        Atur peran ganda (multiple roles) dan perizinan kustom untuk akun ini.
                      </CardDescription>
                    </div>

                    <button
                      type="button"
                      disabled={updateUserMutation.isPending}
                      onClick={() => updateUserMutation.mutate()}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
                    >
                      {updateUserMutation.isPending ? (
                        <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="size-3.5" />
                      )}
                      <span>Simpan Otorisasi Akun</span>
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {loadingUserPerm ? (
                    <div className="py-12 text-center text-xs text-muted-foreground">
                      Mengambil data otorisasi pengguna...
                    </div>
                  ) : (
                    <>
                      {/* Section 1: Multi-Role Assignment */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                            <Shield className="size-4 text-purple-500" />
                            <span>Peran Akun Pengguna (Multiple Roles)</span>
                          </label>
                          <span className="text-[11px] text-muted-foreground">
                            {userRolesDraft.length} peran aktif
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Pilih satu atau lebih peran. Pengguna akan memperoleh gabungan seluruh hak akses dari setiap peran yang dicentang.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                          {availableRoles.map((r: RoleInfo) => {
                            const rRole = r.role as UserRole;
                            const isChecked = userRolesDraft.includes(rRole);
                            const color = roleColors[rRole] || roleColors.PENGELOLA;

                            return (
                              <label
                                key={r.role}
                                onClick={() => toggleRoleForUser(r.role)}
                                className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? "bg-purple-600/10 border-purple-500/40 text-foreground"
                                    : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="mt-0.5 size-4 rounded-md accent-purple-600 cursor-pointer shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">
                                    {r.label}
                                  </p>
                                  <span
                                    className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold mt-1 border ${color.badge}`}
                                  >
                                    {r.role}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="h-px bg-border/60" />

                      {/* Section 2: Custom Permission Overrides */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                            <KeyRound className="size-4 text-indigo-500" />
                            <span>Izin Kustom Tambahan (Custom Permission Overrides)</span>
                          </label>
                          <span className="text-[11px] text-muted-foreground">
                            {userCustomPermsDraft.length} izin tambahan
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Berikan hak akses khusus secara langsung ke akun ini tanpa harus menaikkan level peran (role) utamanya.
                        </p>

                        <div className="space-y-4 pt-1">
                          {modules.map((group) => {
                            const GroupIcon = moduleIcons[group.module] || Layers;
                            return (
                              <div
                                key={group.module}
                                className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2"
                              >
                                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                  <GroupIcon className="size-3.5 text-indigo-500" />
                                  <span>{group.title}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {group.permissions.map((perm) => {
                                    const isCustom = userCustomPermsDraft.includes(perm.id);
                                    return (
                                      <label
                                        key={perm.id}
                                        onClick={() => toggleCustomPermForUser(perm.id)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                          isCustom
                                            ? "bg-indigo-600/15 border-indigo-500/40 text-foreground font-semibold"
                                            : "bg-card border-border/60 hover:bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isCustom}
                                          onChange={() => {}}
                                          className="size-3.5 rounded accent-indigo-600 cursor-pointer"
                                        />
                                        <span className="truncate">{perm.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 3: Summary of Effective Permissions */}
                      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          <CheckCircle2 className="size-4" />
                          <span>Ringkasan Otorisasi Efektif Pengguna</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Setelah disimpan, akun ini akan otomatis dapat mengakses seluruh menu sidebar dan rute yang dicakup oleh {userRolesDraft.length} peran aktif dan {userCustomPermsDraft.length} perizinan kustom di atas.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full min-h-[350px] flex items-center justify-center p-8 rounded-3xl border border-dashed border-border/80 bg-muted/10 text-center">
                <div className="space-y-3 max-w-sm">
                  <div className="mx-auto size-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <UserPlus className="size-6" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Pilih Pengguna untuk Mengelola Otorisasi
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Klik salah satu nama pengguna di sebelah kiri untuk mengatur peran jamak (multi-role) atau menambahkan izin kustom khusus bagi akun tersebut.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
