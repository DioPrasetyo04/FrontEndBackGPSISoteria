import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/user/user.service";
import type {
  UserCreateInput,
  UserItem,
  UserRole,
  UserSortOption,
} from "@/services/user/types/user";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { getSession } from "@/lib/utils";
import { getDashboardStats } from "@/services/dashboard/dashboard.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  UserCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Mail,
  Shield,
  Calendar,
  Lock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  BarChart3,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

const userChartConfig = {
  count: {
    label: "Jumlah Pengguna",
    color: "#f43f5e",
  },
} satisfies ChartConfig;

const rolesList: { value: UserRole; label: string; color: string }[] = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  {
    value: "ADMIN",
    label: "Administrator",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    value: "PHMJ",
    label: "PHMJ",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  {
    value: "MAJELIS",
    label: "Majelis Jemaat",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    value: "KOORSEK",
    label: "Koordinator Sektor",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    value: "PENGELOLA",
    label: "Pengelola Konten",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
];

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentSession = getSession();

  // Search, sort, pagination
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<UserSortOption>("newest");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("PENGELOLA");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["PENGELOLA"]);

  // Query list
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users-list", { search, sort, page, limit }],
    queryFn: () =>
      getAllUsers({
        q: search.trim() || undefined,
        sort,
        page,
        limit,
      }),
  });

  // Fetch module statistics
  const { data: statsResponse, isLoading: loadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const usersStats = statsResponse?.data?.users;
  const items = data?.data?.items || data?.data?.users || [];
  const pagination = data?.data?.pagination;

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const primaryRole = selectedRoles[0] || role;
      if (editingItem) {
        const payload: Partial<UserCreateInput> = {
          name,
          email,
          role: primaryRole,
          roles: selectedRoles,
        };
        if (password.trim().length > 0) {
          payload.password = password;
        }
        return updateUser(editingItem.id, payload);
      }

      return createUser({
        name,
        email,
        password,
        role: primaryRole,
        roles: selectedRoles,
      });
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Data pengguna berhasil diperbarui" : "Pengguna berhasil dibuat"
      );
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      closeModal();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menyimpan data pengguna";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("Pengguna berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus pengguna";
      toast.error("Gagal Menghapus", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
      setDeletingId(null);
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("PENGELOLA");
    setSelectedRoles(["PENGELOLA"]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: UserItem) => {
    setEditingItem(item);
    setName(item.name);
    setEmail(item.email);
    setPassword("");
    setRole(item.role);
    setSelectedRoles(
      Array.isArray(item.roles) && item.roles.length > 0
        ? item.roles
        : [item.role]
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const toggleRole = (rValue: UserRole) => {
    setSelectedRoles((prev) => {
      let next: UserRole[];
      if (prev.includes(rValue)) {
        if (prev.length === 1) {
          toast.info("Pengguna harus memiliki minimal satu peran aktif.");
          return prev;
        }
        next = prev.filter((r) => r !== rValue);
      } else {
        next = [...prev, rValue];
      }
      setRole(next[0]);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCheck className="size-6 text-rose-500" />
            Manajemen Pengguna & Otorisasi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola akun pengguna, perizinan role akses, dan staf sekretariat gereja
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/roles")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-card hover:bg-muted text-foreground border border-border/80 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-xs"
          >
            <ShieldCheck className="size-4 text-indigo-500" />
            Hak Akses & Peran
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Plus className="size-4" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Module Statistic Cards using Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Pengguna
            </CardTitle>
            <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center">
              <UserCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (usersStats?.total ?? pagination?.totalItems ?? items.length).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Akun terdaftar dalam sistem</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pengguna Aktif
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (usersStats?.approved ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Memiliki izin login aktif</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Menunggu Persetujuan
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (usersStats?.pending ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Permohonan akun baru</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Akses Ditolak
            </CardTitle>
            <div className="size-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
              <XCircle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (usersStats?.rejected ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Status verifikasi ditolak</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution Chart */}
      {usersStats?.byRole && usersStats.byRole.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-rose-500" />
                  Distribusi Hak Akses & Role Pengguna
                </CardTitle>
                <CardDescription className="text-xs">
                  Jumlah akun staf terdaftar berdasarkan perizinan hak akses di sistem
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={userChartConfig} className="h-40 w-full">
              <BarChart
                data={usersStats.byRole}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-card border border-border/70 p-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama pengguna, alamat email..."
              className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as UserSortOption);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-foreground"
            >
              <option value="newest">Terbaru Terdaftar</option>
              <option value="oldest">Terlama</option>
              <option value="name_asc">Nama (A-Z)</option>
              <option value="name_desc">Nama (Z-A)</option>
              <option value="email_asc">Email (A-Z)</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSort("newest");
                setPage(1);
              }}
              title="Reset"
              className="p-2 border border-border/60 rounded-xl text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-2xl bg-card border border-border/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Nama Pengguna</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Peran (Role)</th>
                <th className="py-3.5 px-4">Terdaftar Sejak</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <span className="size-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-destructive">
                    Gagal mengambil data pengguna. Pastikan Anda login dengan akun Admin.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Belum ada data pengguna yang terdaftar.
                  </td>
                </tr>
              ) : (
                items.map((user) => {
                  const roleConfig =
                    rolesList.find((r) => r.value === user.role) || {
                      label: user.role,
                      color: "bg-muted text-muted-foreground border-border",
                    };
                  const isSelf = currentSession?.email === user.email;

                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                            {user.name.slice(0, 2)}
                          </div>
                          <span>{user.name}</span>
                          {isSelf && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role]).map((r) => {
                            const conf = rolesList.find((item) => item.value === r) || roleConfig;
                            return (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1 ${conf.color}`}
                              >
                                <Shield className="size-2.5" />
                                {conf.label}
                              </span>
                            );
                          })}
                          {user.customPermissions && user.customPermissions.length > 0 && (
                            <span
                              title={`Izin Khusus Tambahan: ${user.customPermissions.join(", ")}`}
                              className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                            >
                              +{user.customPermissions.length} khusus
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="size-3 text-muted-foreground" />
                          {new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/roles?tab=users&userId=${user.id}`)}
                            title="Atur Hak Akses & Role Pengguna"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                          >
                            <KeyRound className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => setDeletingId(user.id)}
                            title={isSelf ? "Tidak dapat menghapus akun sendiri" : "Hapus"}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/60 text-xs text-muted-foreground">
            <div>
              Menampilkan Halaman <span className="font-semibold text-foreground">{pagination.page}</span> dari{" "}
              <span className="font-semibold text-foreground">{pagination.totalPages}</span> (Total {pagination.totalItems} Pengguna)
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="size-3.5" /> Sebelumnya
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-border/60 hover:bg-muted font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                Berikutnya <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Edit Pengguna" : "Tambah Pengguna Baru"}
        description="Atur nama, email, kata sandi, dan tingkat hak akses pengguna"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dio Prasetyo"
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Alamat Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pengguna@gpsisoteria.org"
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {editingItem ? "Kata Sandi Baru (Kosongkan jika tidak diubah)" : "Kata Sandi *"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                required={!editingItem}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={editingItem ? "••••••••" : "Min. 8 karakter (huruf besar, kecil, angka, simbol)"}
                className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-foreground"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Kriteria: Min. 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Peran Pengguna (Multi-Role) *
              </label>
              <span className="text-[11px] text-muted-foreground font-medium">
                {selectedRoles.length} peran dipilih
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Pilih satu atau beberapa role. Pengguna akan mewarisi seluruh izin hak akses gabungan dari role yang diaktifkan.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5 border border-border/60 rounded-xl bg-muted/20">
              {rolesList.map((r) => {
                const isChecked = selectedRoles.includes(r.value);
                const isPrimary = selectedRoles[0] === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => toggleRole(r.value)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isChecked
                        ? "bg-card border-rose-500/50 shadow-xs"
                        : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-4 rounded flex items-center justify-center border text-white transition-colors ${
                          isChecked
                            ? "bg-rose-600 border-rose-600"
                            : "border-muted-foreground/40 bg-transparent"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="size-3 text-white" />}
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {r.label}
                      </span>
                    </div>
                    {isPrimary && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        Utama
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-border/60 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending && (
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingItem ? "Simpan Perubahan" : "Buat Pengguna"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Hapus Pengguna"
        message="Apakah Anda yakin ingin menghapus akun pengguna ini? Pengguna tersebut tidak akan bisa login lagi."
        confirmText="Hapus Pengguna"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
