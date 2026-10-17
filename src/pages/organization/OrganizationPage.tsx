import React, { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "@/services/organization/organization.service";
import type {
  Organization,
  OrganizationCategory,
  OrganizationCreateInput,
  OrganizationSortOption,
} from "@/services/organization/types/organization";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
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
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  MapPin,
  BarChart3,
} from "lucide-react";

const orgChartConfig = {
  count: {
    label: "Jumlah Pengurus",
    color: "#06b6d4",
  },
} satisfies ChartConfig;

export const OrganizationPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search, sort, category filter, pagination
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<OrganizationCategory | "">("");
  const [sort, setSort] = useState<OrganizationSortOption>("order_asc");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Organization | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<OrganizationCreateInput>({
    category: "PENGURUS_HARIAN",
    position: "",
    name: "",
    phone: "",
    fax: "",
    order: 1,
    isActive: true,
  });

  // Query list
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "organization-list",
      { search, category: selectedCategory, sort, page, limit },
    ],
    queryFn: () =>
      getAllOrganizations({
        q: search.trim() || undefined,
        category: selectedCategory || undefined,
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

  const orgStats = statsResponse?.data?.organization;
  const items = data?.data?.items || data?.data?.organization || [];
  const pagination = data?.data?.pagination;

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: OrganizationCreateInput) => {
      if (editingItem) {
        return updateOrganization(editingItem.id, payload);
      }
      return createOrganization(payload);
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Data pengurus berhasil diperbarui" : "Pengurus berhasil ditambahkan"
      );
      queryClient.invalidateQueries({ queryKey: ["organization-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-org"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      closeModal();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menyimpan data organisasi";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      toast.success("Data pengurus berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["organization-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-org"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus pengurus";
      toast.error("Gagal Menghapus", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
      setDeletingId(null);
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      category: selectedCategory || "PENGURUS_HARIAN",
      position: "",
      name: "",
      phone: "",
      fax: "",
      order: (items.length || 0) + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Organization) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      position: item.position,
      name: item.name || "",
      phone: item.phone || "",
      fax: item.fax || "",
      order: item.order,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="size-6 text-cyan-500" />
            Struktur Organisasi & Pelayanan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data fungsionaris Pengurus Harian Majelis Jemaat dan Koordinator Sektor
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
        >
          <Plus className="size-4" />
          Tambah Pengurus
        </button>
      </div>

      {/* Module Statistic Cards using Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Fungsionaris
            </CardTitle>
            <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (orgStats?.total ?? pagination?.totalItems ?? items.length).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Seluruh susunan pengurus</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Pengurus Harian (PHMJ)
            </CardTitle>
            <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (orgStats?.pengurusHarian ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">Badan pekerja majelis jemaat</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Koordinator Sektor
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <MapPin className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (orgStats?.koordinatorSektor ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Perwakilan wilayah pelayanan</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Status Keaktifan
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? "..." : (orgStats?.activeCount ?? 0)} / {orgStats?.total ?? 0}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">100% fungsionaris aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Organization Structure Comparison Chart */}
      {orgStats && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-cyan-500" />
                  Perbandingan Komposisi Pengurus Harian & Sektor
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribusi fungsionaris antara Pengurus Harian Majelis Jemaat dan Koordinator Sektor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={orgChartConfig} className="h-40 w-full">
              <BarChart
                data={[
                  {
                    name: "Pengurus Harian (PHMJ)",
                    count: orgStats.pengurusHarian ?? 0,
                    fill: "#6366f1",
                  },
                  {
                    name: "Koordinator Sektor Pelayanan",
                    count: orgStats.koordinatorSektor ?? 0,
                    fill: "#06b6d4",
                  },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  <Cell fill="#6366f1" />
                  <Cell fill="#06b6d4" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory("");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selectedCategory === ""
              ? "bg-cyan-600 text-white shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Semua Kategori
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedCategory("PENGURUS_HARIAN");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selectedCategory === "PENGURUS_HARIAN"
              ? "bg-cyan-600 text-white shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Pengurus Harian (PHMJ)
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedCategory("KOORDINATOR_SEKTOR");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            selectedCategory === "KOORDINATOR_SEKTOR"
              ? "bg-cyan-600 text-white shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Koordinator Sektor Pelayanan
        </button>
      </div>

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
              placeholder="Cari nama pejabat, jabatan..."
              className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as OrganizationSortOption);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-foreground"
            >
              <option value="order_asc">Urutan (Kecil ke Besar)</option>
              <option value="order_desc">Urutan (Besar ke Kecil)</option>
              <option value="name_asc">Nama Pejabat (A-Z)</option>
              <option value="name_desc">Nama Pejabat (Z-A)</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSort("order_asc");
                setSelectedCategory("");
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
                <th className="py-3.5 px-4 w-16">No</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4">Nama Pejabat</th>
                <th className="py-3.5 px-4">Kontak / Telepon</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <span className="size-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat struktur organisasi...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-destructive">
                    Gagal mengambil data struktur organisasi.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Belum ada data pengurus yang sesuai filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                      #{item.order}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.category === "PENGURUS_HARIAN"
                            ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
                            : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                        }`}
                      >
                        {item.category === "PENGURUS_HARIAN"
                          ? "Pengurus Harian"
                          : "Koordinator Sektor"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {item.position}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {item.name || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {item.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3 text-cyan-500" />
                          <span>{item.phone}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="size-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-semibold">
                          <XCircle className="size-3.5" /> Tidak Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10 transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(item.id)}
                          title="Hapus"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/60 text-xs text-muted-foreground">
            <div>
              Menampilkan Halaman <span className="font-semibold text-foreground">{pagination.page}</span> dari{" "}
              <span className="font-semibold text-foreground">{pagination.totalPages}</span> (Total {pagination.totalItems} Pengurus)
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
        title={editingItem ? "Edit Data Pengurus" : "Tambah Pengurus Baru"}
        description="Lengkapi informasi fungsionaris kepengurusan organisasi gereja"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Kategori Struktur *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as OrganizationCategory,
                  })
                }
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-foreground"
              >
                <option value="PENGURUS_HARIAN">Pengurus Harian (PHMJ)</option>
                <option value="KOORDINATOR_SEKTOR">Koordinator Sektor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nomor Urutan Tampil
              </label>
              <input
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Jabatan / Posisi *
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder="Contoh: Ketua Majelis Jemaat / Sekretaris I / Koordinator Sektor I"
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Lengkap Pejabat
            </label>
            <input
              type="text"
              maxLength={100}
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Pdt. Jane Doe, S.Th / Pnt. Dominggus Ratu"
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                maxLength={30}
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Contoh: 0812-3456-7890"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                No. Fax (Opsional)
              </label>
              <input
                type="text"
                maxLength={30}
                value={formData.fax || ""}
                onChange={(e) =>
                  setFormData({ ...formData, fax: e.target.value })
                }
                placeholder="Contoh: 021-1234567"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-foreground"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-border text-cyan-600 focus:ring-cyan-500 size-4"
              />
              <span className="text-xs font-semibold text-foreground">
                Status Pengurus Aktif Melayani
              </span>
            </label>
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
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending && (
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingItem ? "Simpan Perubahan" : "Tambah Pengurus"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Hapus Data Pengurus"
        message="Apakah Anda yakin ingin menghapus data pengurus ini dari susunan organisasi?"
        confirmText="Hapus Pengurus"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
