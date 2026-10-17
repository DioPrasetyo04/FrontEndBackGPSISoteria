import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllJadwal,
  createJadwal,
  updateJadwal,
  deleteJadwal,
} from "@/services/jadwal/jadwal.service";
import type {
  Jadwal,
  JadwalCreateInput,
  JadwalSortOption,
} from "@/services/jadwal/types/jadwal";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { toast } from "sonner";
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
  CalendarDays,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  History,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const jadwalChartConfig = {
  count: {
    label: "Jumlah Jadwal",
    color: "#6366f1",
  },
} satisfies ChartConfig;

export const JadwalPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<JadwalSortOption>("upcoming");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Jadwal | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<JadwalCreateInput>({
    date: new Date().toISOString().split("T")[0],
    time: "09:00 - 11:00 WIB",
    activity: "",
    organizer: "Majelis Jemaat",
    location: "Gedung Gereja GPSI Soteria",
    description: "",
  });

  // Fetch Jadwal list
  // Query list
  const { data, isLoading, isError } = useQuery({
    queryKey: ["jadwal-list", { search, dateFrom, dateTo, sort, page, limit }],
    queryFn: () =>
      getAllJadwal({
        q: search.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
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

  const jadwalStats = statsResponse?.data?.jadwal;
  const items = data?.data?.items || data?.data?.jadwal || [];
  const pagination = data?.data?.pagination;

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: JadwalCreateInput) => {
      if (editingItem) {
        return updateJadwal(editingItem.id, payload);
      }
      return createJadwal(payload);
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan"
      );
      queryClient.invalidateQueries({ queryKey: ["jadwal-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-jadwal"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      closeModal();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menyimpan data jadwal";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJadwal(id),
    onSuccess: () => {
      toast.success("Jadwal berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["jadwal-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-jadwal"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus jadwal";
      toast.error("Gagal Menghapus", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
      setDeletingId(null);
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      time: "09:00 - 11:00 WIB",
      activity: "",
      organizer: "Majelis Jemaat",
      location: "Gedung Gereja GPSI Soteria",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Jadwal) => {
    setEditingItem(item);
    setFormData({
      date: new Date(item.date).toISOString().split("T")[0],
      time: item.time,
      activity: item.activity,
      organizer: item.organizer,
      location: item.location,
      description: item.description,
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

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSort("upcoming");
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarDays className="size-6 text-indigo-600 dark:text-indigo-400" />
            Jadwal Ibadah & Kegiatan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola agenda ibadah raya, persekutuan, dan kegiatan pelayanan jemaat
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="size-4" />
          Tambah Jadwal
        </button>
      </div>

      {/* Module Statistic Cards using Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Seluruh Agenda
            </CardTitle>
            <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <CalendarDays className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (jadwalStats?.total ?? pagination?.totalItems ?? items.length).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Semua agenda tercatat</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Agenda Mendatang
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
                (jadwalStats?.upcoming ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Akan segera dilaksanakan</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Agenda Selesai / Arsip
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <History className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (jadwalStats?.past ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Telah terlaksana</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Rentang Periode
            </CardTitle>
            <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {jadwalStats?.byMonth?.length ?? 0} <span className="text-sm font-normal text-muted-foreground">Bulan</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Distribusi aktivitas</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart for Jadwal */}
      {jadwalStats?.byMonth && jadwalStats.byMonth.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-indigo-500" />
                  Statistik Frekuensi Agenda Ibadah Per Bulan
                </CardTitle>
                <CardDescription className="text-xs">
                  Jumlah keseluruhan ibadah dan kegiatan yang diagendakan pada setiap bulan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={jadwalChartConfig} className="h-44 w-full">
              <BarChart data={jadwalStats.byMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Filter & Search Bar */}
      <div className="rounded-2xl bg-card border border-border/70 p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari kegiatan, lokasi, penyelenggara..."
              className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-foreground"
            />
          </div>

          {/* Sort Selector */}
          <div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as JadwalSortOption);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-foreground"
            >
              <option value="upcoming">Akan Datang (Terdekat)</option>
              <option value="latest">Terbaru Ditambahkan</option>
              <option value="activity_asc">Nama Kegiatan (A-Z)</option>
              <option value="activity_desc">Nama Kegiatan (Z-A)</option>
            </select>
          </div>

          {/* Reset filter button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full px-3 py-2 border border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Filter className="size-3.5 text-indigo-500" /> Rentang Tanggal:
          </span>
          <div className="flex items-center gap-2">
            <span>Dari:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 bg-muted/40 border border-border/60 rounded-lg text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span>Sampai:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 bg-muted/40 border border-border/60 rounded-lg text-xs text-foreground focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Table & Content */}
      <div className="rounded-2xl bg-card border border-border/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tanggal & Waktu</th>
                <th className="py-3.5 px-4">Nama Kegiatan</th>
                <th className="py-3.5 px-4">Lokasi</th>
                <th className="py-3.5 px-4">Penyelenggara</th>
                <th className="py-3.5 px-4">Deskripsi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <span className="size-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data jadwal...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-destructive">
                    Gagal mengambil data jadwal. Silakan muat ulang.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Tidak ada jadwal yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground">
                        {new Date(item.date).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="size-3 text-indigo-500" />
                        {item.time}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {item.activity}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate max-w-xs">{item.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-medium whitespace-nowrap">
                        {item.organizer}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
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
              <span className="font-semibold text-foreground">{pagination.totalPages}</span> (Total {pagination.totalItems} Jadwal)
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
        title={editingItem ? "Edit Jadwal Kegiatan" : "Tambah Jadwal Baru"}
        description="Lengkapi informasi agenda ibadah atau kegiatan persekutuan berikut"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Kegiatan *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Waktu Pelaksanaan *
              </label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                placeholder="Contoh: 09:00 - 11:00 WIB"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Kegiatan / Ibadah *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={formData.activity}
              onChange={(e) =>
                setFormData({ ...formData, activity: e.target.value })
              }
              placeholder="Contoh: Ibadah Hari Minggu I / Persekutuan Doa"
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Penyelenggara *
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={formData.organizer}
                onChange={(e) =>
                  setFormData({ ...formData, organizer: e.target.value })
                }
                placeholder="Contoh: Majelis Jemaat / Pelkat Pemuda"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Lokasi Kegiatan *
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={150}
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Contoh: Gedung Gereja GPSI Soteria"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Deskripsi / Keterangan *
            </label>
            <textarea
              required
              rows={3}
              minLength={5}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Masukkan rincian kegiatan, tata ibadah, pelayan firman, dll..."
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-foreground resize-none"
            />
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending && (
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingItem ? "Simpan Perubahan" : "Tambah Jadwal"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Hapus Jadwal Kegiatan"
        message="Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Jadwal"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
