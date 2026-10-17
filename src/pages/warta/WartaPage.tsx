import React, { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllWarta,
  createWarta,
  updateWarta,
  deleteWarta,
} from "@/services/warta/warta.service";
import type { Warta, WartaSortOption } from "@/services/warta/types/warta";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { getPublicAssetUrl } from "@/lib/utils";
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
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  ExternalLink,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const wartaChartConfig = {
  count: {
    label: "Warta Terbit",
    color: "#10b981",
  },
} satisfies ChartConfig;

export const WartaPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search, sort, pagination
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<WartaSortOption>("newest");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Warta | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Query list
  const { data, isLoading, isError } = useQuery({
    queryKey: ["warta-list", { search, sort, page, limit }],
    queryFn: () =>
      getAllWarta({
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

  const wartaStats = statsResponse?.data?.warta;
  const items = data?.data?.items || data?.data?.warta || [];
  const pagination = data?.data?.pagination;

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (publishedAt) formData.append("publishedAt", publishedAt);
      if (documentFile) {
        formData.append("fileUrl", documentFile);
      }

      if (editingItem) {
        return updateWarta(editingItem.slug, formData);
      }
      return createWarta(formData);
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Warta berhasil diperbarui" : "Warta berhasil diunggah"
      );
      queryClient.invalidateQueries({ queryKey: ["warta-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-warta"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      closeModal();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menyimpan warta jemaat";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (slug: string) => deleteWarta(slug),
    onSuccess: () => {
      toast.success("Warta jemaat berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["warta-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-warta"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeletingSlug(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus warta";
      toast.error("Gagal Menghapus", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
      setDeletingSlug(null);
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setPublishedAt(new Date().toISOString().split("T")[0]);
    setDocumentFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Warta) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setPublishedAt(
      item.publishedAt
        ? new Date(item.publishedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setDocumentFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setDocumentFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem && !documentFile) {
      toast.error("Wajib mengunggah file dokumen warta");
      return;
    }
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="size-6 text-emerald-500" />
            Warta Jemaat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola publikasi berkas warta mingguan, buletin ibadah, dan pengumuman jemaat
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="size-4" />
          Unggah Warta
        </button>
      </div>

      {/* Module Statistic Cards using Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Berkas Warta
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <FileText className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (wartaStats?.total ?? pagination?.totalItems ?? items.length).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Edisi warta mingguan</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Terbit Bulan Ini
            </CardTitle>
            <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {wartaStats?.byMonth && wartaStats.byMonth.length > 0
                ? (wartaStats.byMonth[wartaStats.byMonth.length - 1]?.count ?? 0)
                : 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Edisi peribadatan terkini</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Akses Unduhan
            </CardTitle>
            <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              100%
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Tersedia online untuk jemaat</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Riwayat Terbitan
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {wartaStats?.byMonth?.length ?? 0} <span className="text-sm font-normal text-muted-foreground">Bulan</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Arsip publikasi gereja</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Warta Trend Chart */}
      {wartaStats?.byMonth && wartaStats.byMonth.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-emerald-500" />
                  Tren Publikasi Warta Jemaat Per Bulan
                </CardTitle>
                <CardDescription className="text-xs">
                  Frekuensi penerbitan buletin warta mingguan di GPSI Soteria
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={wartaChartConfig} className="h-44 w-full">
              <AreaChart
                data={wartaStats.byMonth}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="wartaModuleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#wartaModuleGrad)"
                />
              </AreaChart>
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
              placeholder="Cari judul warta, deskripsi pengumuman..."
              className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as WartaSortOption);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-foreground"
            >
              <option value="newest">Terbaru (Dipublikasi)</option>
              <option value="oldest">Terlama</option>
              <option value="title_asc">Judul (A-Z)</option>
              <option value="title_desc">Judul (Z-A)</option>
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
                <th className="py-3.5 px-4">Tanggal Terbit</th>
                <th className="py-3.5 px-4">Judul Warta</th>
                <th className="py-3.5 px-4">Deskripsi / Catatan</th>
                <th className="py-3.5 px-4">Berkas Dokumen</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <span className="size-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat data warta jemaat...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-destructive">
                    Gagal mengambil daftar warta.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Belum ada dokumen warta jemaat yang sesuai.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-emerald-500" />
                        {new Date(item.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground max-w-sm truncate">
                      {item.description}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.fileUrl ? (
                        <a
                          href={getPublicAssetUrl(item.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                        >
                          <ExternalLink className="size-3.5" />
                          Unduh / Buka Dokumen
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSlug(item.slug)}
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
              <span className="font-semibold text-foreground">{pagination.totalPages}</span> (Total {pagination.totalItems} Warta)
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
        title={editingItem ? "Edit Warta Jemaat" : "Unggah Warta Baru"}
        description="Unggah dokumen warta mingguan jemaat dan tentukan rincian publikasi"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul Warta Jemaat *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Warta Jemaat Minggu X Setelah Trinitatis"
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tanggal Publikasi
            </label>
            <input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Berkas Dokumen Warta (PDF / Gambar / Doc) *
            </label>
            <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 space-y-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDocumentFile(e.target.files[0]);
                  }
                }}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20 cursor-pointer"
              />
              {editingItem?.fileUrl && !documentFile && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <FileCheck className="size-3.5" /> Berkas saat ini tersimpan. Unggah berkas baru hanya jika ingin menggantinya.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Deskripsi / Ringkasan Isi Warta *
            </label>
            <textarea
              required
              rows={3}
              minLength={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masukkan ringkasan pengumuman penting, ucapan selamat datang, atau agenda..."
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-foreground resize-none"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending && (
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingItem ? "Simpan Perubahan" : "Unggah Warta"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingSlug)}
        onClose={() => setDeletingSlug(null)}
        onConfirm={() => deletingSlug && deleteMutation.mutate(deletingSlug)}
        title="Hapus Warta Jemaat"
        message="Apakah Anda yakin ingin menghapus warta jemaat ini? Berkas dokumen juga akan dihapus dari server."
        confirmText="Hapus Warta"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
