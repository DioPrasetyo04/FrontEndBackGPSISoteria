import React, { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllGallery,
  createGallery,
  updateGallery,
  deleteGallery,
} from "@/services/gallery/gallery.service";
import type {
  Gallery,
  GallerySortOption,
} from "@/services/gallery/types/gallery";
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
  Image as ImageIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  Sparkles,
  Home,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  BarChart3,
  Layers,
} from "lucide-react";

const galleryChartConfig = {
  count: {
    label: "Jumlah Foto",
    color: "#a855f7",
  },
} satisfies ChartConfig;

export const GalleryPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Search, sort, category, pagination
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState<GallerySortOption>("newest");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Gallery | null>(null);
  const [lightboxItem, setLightboxItem] = useState<Gallery | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kegiatan Ibadah");
  const [alt, setAlt] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [highlight, setHighlight] = useState(false);
  const [showInHome, setShowInHome] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Query list
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "gallery-list",
      { search, category: selectedCategory, sort, page, limit },
    ],
    queryFn: () =>
      getAllGallery({
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

  const galleryStats = statsResponse?.data?.gallery;
  const items = data?.data?.items || data?.data?.gallery || [];
  const pagination = data?.data?.pagination;

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("alt", alt);
      formData.append("date", date);
      formData.append("highlight", String(highlight));
      formData.append("showInHome", String(showInHome));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingItem) {
        return updateGallery(editingItem.id, formData);
      }
      return createGallery(formData);
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Foto galeri berhasil diperbarui" : "Foto galeri berhasil ditambahkan"
      );
      queryClient.invalidateQueries({ queryKey: ["gallery-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      closeModal();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menyimpan foto galeri";
      toast.error("Terjadi Kesalahan", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGallery(id),
    onSuccess: () => {
      toast.success("Foto galeri berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["gallery-list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeletingId(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Gagal menghapus galeri";
      toast.error("Gagal Menghapus", {
        description: typeof msg === "string" ? msg : JSON.stringify(msg),
      });
      setDeletingId(null);
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setCategory("Kegiatan Ibadah");
    setAlt("");
    setDate(new Date().toISOString().split("T")[0]);
    setHighlight(false);
    setShowInHome(false);
    setImageFile(null);
    setImagePreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Gallery) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setAlt(item.alt);
    setDate(
      item.date
        ? new Date(item.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setHighlight(Boolean(item.highlight));
    setShowInHome(Boolean(item.showInHome));
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
      if (!alt && title) setAlt(title);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem && !imageFile) {
      toast.error("Wajib mengunggah foto");
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
            <ImageIcon className="size-6 text-purple-500" />
            Galeri Dokumentasi Foto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Arsip foto dokumentasi kegiatan ibadah, pelayanan, perayaan, dan komunitas
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="size-4" />
          Tambah Foto Galeri
        </button>
      </div>

      {/* Module Statistic Cards using Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Dokumentasi
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
              <ImageIcon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (galleryStats?.total ?? pagination?.totalItems ?? items.length).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Semua foto terarsip</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Foto Sorotan Utama
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (galleryStats?.highlighted ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">Ditandai sebagai sorotan</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tampil di Beranda
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Home className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loadingStats ? (
                <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
              ) : (
                (galleryStats?.showInHome ?? 0).toLocaleString("id-ID")
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Dipilih untuk landing page</p>
          </CardContent>
        </Card>

        <Card className="py-4 gap-2">
          <CardHeader className="flex flex-row items-center justify-between pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Ragam Kategori
            </CardTitle>
            <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <Layers className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {galleryStats?.byCategory?.length ?? 0} <span className="text-sm font-normal text-muted-foreground">Kategori</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Sektor & badan pelayanan</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Chart */}
      {galleryStats?.byCategory && galleryStats.byCategory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-purple-500" />
                  Distribusi Foto Berdasarkan Kategori Pelayanan
                </CardTitle>
                <CardDescription className="text-xs">
                  Jumlah foto dokumentasi yang dikelompokkan menurut badan kategorial / acara
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={galleryChartConfig} className="h-44 w-full">
              <BarChart
                data={galleryStats.byCategory}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari foto, teks deskripsi..."
              className="w-full pl-10 pr-4 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-foreground"
            />
          </div>
          <div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as GallerySortOption);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-foreground"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="title_asc">Judul Foto (A-Z)</option>
              <option value="title_desc">Judul Foto (Z-A)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("");
                setSort("newest");
                setPage(1);
              }}
              title="Reset"
              className="w-full px-3 py-2 border border-border/60 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-card border border-border/70 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-card border border-destructive/30 p-8 text-center text-destructive">
          Gagal mengambil data galeri.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border/70 p-12 text-center text-muted-foreground">
          Belum ada foto galeri yang tersimpan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl bg-card border border-border/70 overflow-hidden shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all flex flex-col"
            >
              {/* Image Preview with Hover Controls */}
              <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden">
                <img
                  src={getPublicAssetUrl(item.image)}
                  alt={item.alt || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLightboxItem(item)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors"
                    title="Perbesar"
                  >
                    <Maximize2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors"
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(item.id)}
                    className="p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-xs transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Badges on image */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 pointer-events-none">
                  {item.highlight && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="size-2.5" /> Sorotan
                    </span>
                  )}
                  {item.showInHome && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/90 text-white text-[10px] font-bold flex items-center gap-1">
                      <Home className="size-2.5" /> Beranda
                    </span>
                  )}
                </div>
              </div>

              {/* Information */}
              <div className="p-3.5 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    {item.category}
                  </span>
                  <h4 className="font-semibold text-sm text-foreground truncate mt-0.5">
                    {item.title}
                  </h4>
                </div>
                <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3 text-purple-500" />
                  <span>
                    {new Date(item.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
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
            <span className="font-semibold text-foreground">{pagination.totalPages}</span> (Total {pagination.totalItems} Foto)
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
        title={editingItem ? "Edit Foto Galeri" : "Tambah Foto Galeri"}
        description="Unggah foto dokumentasi kegiatan pelayanan GPSI Soteria"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Berkas Foto *
            </label>
            <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center gap-4">
              {imagePreviewUrl ? (
                <div className="relative size-20 rounded-lg overflow-hidden shrink-0 border border-border">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="size-20 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                  <ImageIcon className="size-7" />
                </div>
              )}
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-500/10 file:text-purple-600 hover:file:bg-purple-500/20 cursor-pointer"
                />
                <p className="text-[11px] text-muted-foreground">
                  Format gambar JPG, PNG, atau WebP
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul Foto *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ibadah Syukur Natal Jemaat Soteria"
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Kategori *
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Ibadah Raya, Natal, Paskah, Pelkat"
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Dokumentasi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Teks Alternatif (Alt) *
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Deskripsi singkat foto untuk aksesibilitas..."
              className="w-full px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-foreground"
            />
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer">
              <input
                type="checkbox"
                checked={highlight}
                onChange={(e) => setHighlight(e.target.checked)}
                className="rounded border-border text-purple-600 focus:ring-purple-500 size-4"
              />
              <span className="text-xs font-semibold text-foreground">
                Tampilkan sebagai Sorotan (Highlight)
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer">
              <input
                type="checkbox"
                checked={showInHome}
                onChange={(e) => setShowInHome(e.target.checked)}
                className="rounded border-border text-purple-600 focus:ring-purple-500 size-4"
              />
              <span className="text-xs font-semibold text-foreground">
                Tampilkan di Beranda Web (Show in Home)
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saveMutation.isPending && (
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {editingItem ? "Simpan Perubahan" : "Tambah Foto"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <Modal
          isOpen={Boolean(lightboxItem)}
          onClose={() => setLightboxItem(null)}
          title={lightboxItem.title}
          description={`${lightboxItem.category} • ${new Date(lightboxItem.date).toLocaleDateString("id-ID", { dateStyle: "long" })}`}
          maxWidth="3xl"
        >
          <div className="space-y-3">
            <div className="max-h-[70vh] rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={getPublicAssetUrl(lightboxItem.image)}
                alt={lightboxItem.alt}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            {lightboxItem.alt && (
              <p className="text-xs text-muted-foreground italic">
                {lightboxItem.alt}
              </p>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Hapus Foto Galeri"
        message="Apakah Anda yakin ingin menghapus foto ini dari galeri dan server penyimpanan?"
        confirmText="Hapus Foto"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
