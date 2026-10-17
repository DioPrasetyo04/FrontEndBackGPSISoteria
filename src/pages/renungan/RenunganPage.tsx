import React, { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllRenungan,
  createRenungan,
  updateRenungan,
  deleteRenungan,
} from "@/services/renungan/renungan.service";
import type {
  Renungan,
  RenunganSortOption,
} from "@/services/renungan/types/renungan";
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
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  User,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  Users,
  BarChart3,
  PenTool,
} from "lucide-react";

const renunganChartConfig = {
  count: {
    label: "Jumlah Artikel",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

export const RenunganPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search, sort, pagination
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<RenunganSortOption>("newest");
  const [page, setPage] = useState(1);
  const limit = 9;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Renungan | null>(null);
  const [previewItem, setPreviewItem] = useState<Renungan | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Renungan");
  const [excerpt, setExcerpt] = useState("");
  const [description, setDescription] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Query list
  const { data, isLoading, isError } = useQuery({
    queryKey: ["renungan-list", { search, sort, page, limit }],
    queryFn: () =>
      getAllRenungan({
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

  const renunganStats = statsResponse?.data?.renungan;
  const items = data?.data?.items || data?.data?.renungan || [];
  const pagination = data?.data?.pagination;

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("category", category);
      formData.append("excerpt", excerpt);
      formData.append("description", description);
      if (publishedAt) formData.append("publishedAt", publishedAt);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingItem) {
        return updateRenungan(editingItem.slug, formData);
      }
      return createRenungan(formData);
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Renungan berhasil diperbarui" : "Renungan berhasil diterbitkan"
      );
      queryClient.invalidateQueries({ queryKey: ["renungan-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-renungan"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      closeModal();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menyimpan renungan";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (slug: string) => deleteRenungan(slug),
    onSuccess: () => {
      toast.success("Renungan berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["renungan-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-renungan"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeletingSlug(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus renungan";
      toast.error("Gagal Menghapus", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
      setDeletingSlug(null);
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setAuthor("Pdt. Jemaat GPSI Soteria");
    setCategory("Renungan");
    setExcerpt("");
    setDescription("");
    setPublishedAt(new Date().toISOString().split("T")[0]);
    setImageFile(null);
    setImagePreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Renungan) => {
    setEditingItem(item);
    setTitle(item.title);
    setAuthor(item.author);
    setCategory(item.category || "Renungan");
    setExcerpt(item.excerpt);
    setDescription(item.description);
    setPublishedAt(
      item.publishedAt
        ? new Date(item.publishedAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setImageFile(null);
    setImagePreviewUrl(item.image ? getPublicAssetUrl(item.image) : null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
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
            <BookOpen className="size-6 text-amber-500" />
            Renungan Harian Jemaat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publikasikan renungan firman Tuhan, artikel kerohanian, dan wawasan iman
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-amber-600/20 cursor-pointer"
        >
          <Plus className="size-4" />
          Tulis Renungan
        </button>
      </div>

      {/* Module Statistic Cards using Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Renungan
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <BookOpen className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (renunganStats?.total ?? pagination?.totalItems ?? items.length).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Artikel tersimpan di database</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Penulis / Hamba Tuhan
            </CardTitle>
            <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (renunganStats?.byAuthor?.length ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Kontributor renungan rohani</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Rata-rata Penulisan
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <PenTool className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {renunganStats?.byAuthor && renunganStats.byAuthor.length > 0
                ? ((renunganStats.total || items.length) / renunganStats.byAuthor.length).toFixed(1)
                : "1.0"}{" "}
              <span className="text-sm font-normal text-muted-foreground">naskah</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Per kontributor penulis</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Kategori Utama
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold tracking-tight text-foreground truncate">
              Renungan Harian
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Penyegaran iman jemaat</p>
          </CardContent>
        </Card>
      </div>

      {/* Author Contribution Bar Chart */}
      {renunganStats?.byAuthor && renunganStats.byAuthor.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-amber-500" />
                  Statistik Kontribusi Penulis Renungan
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribusi jumlah naskah firman yang ditulis oleh masing-masing pelayan / penulis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={renunganChartConfig} className="h-44 w-full">
              <BarChart
                data={renunganStats.byAuthor}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  tickFormatter={(val: string) => {
                    const parts = val.trim().split(" ");
                    return parts.length > 2 ? `${parts[0]} ${parts[1]}` : val;
                  }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} maxBarSize={40} />
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
              placeholder="Cari judul, penulis, isi renungan..."
              className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as RenunganSortOption);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-foreground"
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

      {/* Renungan Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl bg-card border border-border/70 p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="h-36 rounded-xl bg-muted" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-muted rounded-md w-3/4" />
                <div className="h-3 bg-muted rounded-md w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-card border border-destructive/30 p-8 text-center text-destructive">
          Gagal mengambil daftar renungan. Silakan periksa koneksi backend.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border/70 p-12 text-center text-muted-foreground">
          Tidak ada data renungan yang sesuai pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-500/40 transition-all flex flex-col"
            >
              {/* Image Banner */}
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                {item.image ? (
                  <img
                    src={getPublicAssetUrl(item.image)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=800&auto=format&fit=crop";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/60 text-muted-foreground">
                    <ImageIcon className="size-8" />
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold border border-white/20">
                  {item.category || "Renungan"}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5 text-amber-500" />
                    <span>
                      {new Date(item.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {item.excerpt || item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <User className="size-3.5 text-amber-500" />
                    <span className="truncate max-w-[120px]">{item.author}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      title="Lihat Detail"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                    >
                      <Eye className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      title="Edit"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/70 text-xs text-muted-foreground">
          <div>
            Menampilkan Halaman <span className="font-semibold text-foreground">{pagination.page}</span> dari{" "}
            <span className="font-semibold text-foreground">{pagination.totalPages}</span> (Total {pagination.totalItems} Renungan)
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

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? "Edit Renungan" : "Tulis Renungan Baru"}
        description="Lengkapi artikel renungan dengan gambar ilustrasi dan firman Tuhan"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Gambar Sampul / Ilustrasi
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-border/80 bg-muted/20">
              {imagePreviewUrl ? (
                <div className="relative size-24 rounded-lg overflow-hidden shrink-0 border border-border">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="size-24 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                  <ImageIcon className="size-8" />
                </div>
              )}
              <div className="space-y-2 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-600 hover:file:bg-amber-500/20 cursor-pointer"
                />
                <p className="text-[11px] text-muted-foreground">
                  Format gambar JPG, PNG, atau WebP (maksimal 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Judul Renungan *
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tetap Bertumbuh dalam Iman"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Penulis / Pelayan Firman *
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Contoh: Pdt. John Doe, M.Th"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Kategori
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Renungan, Khotbah, Artikel Rohani"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Terbit
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Ringkasan (Excerpt) *
            </label>
            <textarea
              required
              rows={2}
              minLength={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat renungan untuk pengantar pembaca..."
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-foreground resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Isi Lengkap Renungan *
            </label>
            <textarea
              required
              rows={6}
              minLength={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan renungan lengkap, ayat alkitab, aplikasi hidup, dan doa..."
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-foreground resize-y"
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending && (
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingItem ? "Simpan Perubahan" : "Terbitkan Renungan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title={previewItem.title}
          description={`Ditulis oleh ${previewItem.author} • ${new Date(previewItem.publishedAt).toLocaleDateString("id-ID", { dateStyle: "long" })}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {previewItem.image && (
              <div className="h-64 w-full rounded-xl overflow-hidden bg-slate-900 border border-border">
                <img
                  src={getPublicAssetUrl(previewItem.image)}
                  alt={previewItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm italic text-foreground leading-relaxed">
              "{previewItem.excerpt}"
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-line leading-relaxed">
              {previewItem.description}
            </div>
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingSlug)}
        onClose={() => setDeletingSlug(null)}
        onConfirm={() => deletingSlug && deleteMutation.mutate(deletingSlug)}
        title="Hapus Renungan"
        message="Apakah Anda yakin ingin menghapus renungan ini secara permanen beserta dokumen gambarnya?"
        confirmText="Hapus Renungan"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
