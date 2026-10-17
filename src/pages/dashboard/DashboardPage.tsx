import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { getDashboardStats } from "@/services/dashboard/dashboard.service";
import { getAllJadwal } from "@/services/jadwal/jadwal.service";
import { getAllRenungan } from "@/services/renungan/renungan.service";
import { getSession } from "@/lib/utils";
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CalendarDays,
  BookOpen,
  FileText,
  Image,
  Users,
  UserCheck,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  BarChart3,
  Layers,
  PieChart as PieIcon,
} from "lucide-react";

const moduleChartConfig = {
  count: {
    label: "Total Data",
  },
  jadwal: {
    label: "Jadwal",
    color: "#6366f1",
  },
  renungan: {
    label: "Renungan",
    color: "#f59e0b",
  },
  warta: {
    label: "Warta",
    color: "#10b981",
  },
  gallery: {
    label: "Galeri",
    color: "#a855f7",
  },
  organization: {
    label: "Organisasi",
    color: "#06b6d4",
  },
  users: {
    label: "Pengguna",
    color: "#f43f5e",
  },
} satisfies ChartConfig;

const timelineChartConfig = {
  jadwal: {
    label: "Jadwal Acara",
    color: "#6366f1",
  },
  warta: {
    label: "Warta Jemaat",
    color: "#10b981",
  },
} satisfies ChartConfig;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();

  // Fetch complete real-time dashboard statistics
  const { data: statsResponse, isLoading: loadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  // Fetch upcoming previews
  const { data: jadwalData, isLoading: loadingJadwal } = useQuery({
    queryKey: ["dashboard-jadwal-preview"],
    queryFn: () => getAllJadwal({ limit: 4, sort: "upcoming" }),
  });

  const { data: renunganData, isLoading: loadingRenungan } = useQuery({
    queryKey: ["dashboard-renungan-preview"],
    queryFn: () => getAllRenungan({ limit: 3, sort: "newest" }),
  });

  const stats = statsResponse?.data;

  // Stat summary items
  const statCards = [
    {
      title: "Jadwal Ibadah & Acara",
      count: stats?.jadwal?.total ?? 0,
      subText: `${stats?.jadwal?.upcoming ?? 0} acara mendatang`,
      loading: loadingStats,
      icon: CalendarDays,
      color: "from-blue-500/20 to-indigo-500/10 text-blue-500 border-blue-500/20",
      link: "/jadwal",
    },
    {
      title: "Renungan Harian",
      count: stats?.renungan?.total ?? 0,
      subText: `${stats?.renungan?.byAuthor?.length ?? 0} penulis aktif`,
      loading: loadingStats,
      icon: BookOpen,
      color: "from-amber-500/20 to-orange-500/10 text-amber-500 border-amber-500/20",
      link: "/renungan",
    },
    {
      title: "Warta Jemaat",
      count: stats?.warta?.total ?? 0,
      subText: "Publikasi warta digital",
      loading: loadingStats,
      icon: FileText,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/20",
      link: "/warta",
    },
    {
      title: "Galeri Foto",
      count: stats?.gallery?.total ?? 0,
      subText: `${stats?.gallery?.highlighted ?? 0} sorotan utama`,
      loading: loadingStats,
      icon: Image,
      color: "from-purple-500/20 to-pink-500/10 text-purple-500 border-purple-500/20",
      link: "/gallery",
    },
    {
      title: "Struktur Organisasi",
      count: stats?.organization?.total ?? 0,
      subText: `${stats?.organization?.pengurusHarian ?? 0} PHMJ • ${stats?.organization?.koordinatorSektor ?? 0} Sektor`,
      loading: loadingStats,
      icon: Users,
      color: "from-cyan-500/20 to-sky-500/10 text-cyan-500 border-cyan-500/20",
      link: "/organization",
    },
    {
      title: "Pengguna Sistem",
      count: stats?.users?.total ?? 0,
      subText: `${stats?.users?.approved ?? 0} aktif • ${stats?.users?.pending ?? 0} pending`,
      loading: loadingStats,
      icon: UserCheck,
      color: "from-rose-500/20 to-red-500/10 text-rose-500 border-rose-500/20",
      link: "/users",
    },
  ];

  // Chart 1 Data: Module Volume Distribution
  const moduleChartData = [
    {
      module: "Jadwal",
      count: stats?.counts?.jadwal ?? 0,
      fill: "var(--color-jadwal)",
    },
    {
      module: "Renungan",
      count: stats?.counts?.renungan ?? 0,
      fill: "var(--color-renungan)",
    },
    {
      module: "Warta",
      count: stats?.counts?.warta ?? 0,
      fill: "var(--color-warta)",
    },
    {
      module: "Galeri",
      count: stats?.counts?.gallery ?? 0,
      fill: "var(--color-gallery)",
    },
    {
      module: "Organisasi",
      count: stats?.counts?.organization ?? 0,
      fill: "var(--color-organization)",
    },
    {
      module: "Pengguna",
      count: stats?.counts?.users ?? 0,
      fill: "var(--color-users)",
    },
  ];

  // Chart 2 Data: Monthly Timeline (Jadwal & Warta)
  const monthNames = Array.from(
    new Set([
      ...(stats?.jadwal?.byMonth?.map((m) => m.name) || []),
      ...(stats?.warta?.byMonth?.map((m) => m.name) || []),
    ])
  );

  const timelineChartData = monthNames.map((month) => {
    const jCount =
      stats?.jadwal?.byMonth?.find((m) => m.name === month)?.count || 0;
    const wCount =
      stats?.warta?.byMonth?.find((m) => m.name === month)?.count || 0;
    return {
      month,
      jadwal: jCount,
      warta: wCount,
    };
  });

  // Chart 3 Data: Org & User Composition Pie
  const orgCompositionData = [
    {
      name: "Pengurus Harian",
      value: stats?.organization?.pengurusHarian ?? 0,
      color: "#6366f1",
    },
    {
      name: "Koordinator Sektor",
      value: stats?.organization?.koordinatorSektor ?? 0,
      color: "#06b6d4",
    },
    {
      name: "Foto Sorotan",
      value: stats?.gallery?.highlighted ?? 0,
      color: "#f59e0b",
    },
    {
      name: "Galeri Umum",
      value: Math.max(
        0,
        (stats?.gallery?.total ?? 0) - (stats?.gallery?.highlighted ?? 0)
      ),
      color: "#a855f7",
    },
  ];

  const upcomingJadwal =
    jadwalData?.data?.items || jadwalData?.data?.jadwal || [];
  const latestRenungan =
    renunganData?.data?.items || renunganData?.data?.renungan || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-950 via-slate-900 to-indigo-900 p-8 border border-indigo-500/20 shadow-xl text-white">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium">
            <span>Gereja Protestan di Indonesia Soteria</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Selamat Datang, {session?.name || "Administrator"}!
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Portal kendali terpadu data pelayanan jemaat, publikasi warta mingguan, renungan rohani, dokumentasi kegiatan, dan kepengurusan gereja.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => navigate("/jadwal")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="size-4" />
              Kelola Jadwal
            </button>
            <button
              type="button"
              onClick={() => navigate("/renungan")}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              Tulis Renungan
            </button>
            <button
              type="button"
              onClick={() => navigate("/warta")}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              Unggah Warta
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid combining Shadcn Card design */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Statistik Ringkasan Modul
            </h2>
            <p className="text-xs text-muted-foreground">
              Kalkulasi data aktual langsung dari basis data Supabase
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sinkronisasi Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                onClick={() => navigate(stat.link)}
                className="group cursor-pointer hover:border-indigo-500/50 hover:shadow-md transition-all gap-3 py-5"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`size-10 rounded-xl bg-linear-to-br border flex items-center justify-center shrink-0 ${stat.color}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {stat.loading ? (
                        <span className="inline-block size-6 rounded-md bg-muted animate-pulse" />
                      ) : (
                        stat.count.toLocaleString("id-ID")
                      )}
                    </div>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Detail <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.subText}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts Section using Shadcn Cards & Chart Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Module Data Volume Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="size-5 text-indigo-600 dark:text-indigo-400" />
                  Distribusi Volume Konten Antar Modul
                </CardTitle>
                <CardDescription>
                  Komparasi jumlah record aktif di setiap modul sistem
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Layers className="size-4 text-indigo-500" />
                <span>Total 6 Modul</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="h-64 rounded-xl bg-muted/40 animate-pulse flex items-center justify-center text-sm text-muted-foreground">
                Memuat visualisasi data...
              </div>
            ) : (
              <ChartContainer
                config={moduleChartConfig}
                className="h-64 w-full"
              >
                <BarChart
                  data={moduleChartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="module"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Organization & Gallery Composition */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="size-5 text-cyan-600 dark:text-cyan-400" />
              Struktur & Komposisi
            </CardTitle>
            <CardDescription>
              Proporsi kepengurusan & dokumentasi
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {loadingStats ? (
              <div className="h-48 rounded-xl bg-muted/40 animate-pulse" />
            ) : (
              <div className="h-48 w-full flex items-center justify-center">
                <ChartContainer
                  config={{
                    composition: { label: "Komposisi" },
                  }}
                  className="h-48 w-full"
                >
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          nameKey="name"
                          indicator="dot"
                        />
                      }
                    />
                    <Pie
                      data={orgCompositionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {orgCompositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val: string) => (
                        <span className="text-xs text-muted-foreground">
                          {val}
                        </span>
                      )}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart 3: Timeline Trend Comparison (Jadwal vs Warta) */}
      {timelineChartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                  Tren Agenda Ibadah & Terbitan Warta Bulanan
                </CardTitle>
                <CardDescription>
                  Dinamika intensitas peribadatan dan penyampaian warta gereja per periode
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2.5 rounded-sm bg-indigo-500" />
                  Jadwal Ibadah
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2.5 rounded-sm bg-emerald-500" />
                  Warta Jemaat
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={timelineChartConfig}
              className="h-64 w-full"
            >
              <AreaChart
                data={timelineChartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="jadwalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="wartaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="jadwal"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#jadwalGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="warta"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#wartaGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Two-column preview: Upcoming Jadwal & Latest Renungan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Jadwal */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base">Jadwal Acara Terdekat</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => navigate("/jadwal")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </CardHeader>

          <CardContent className="mt-4 flex-1 space-y-3">
            {loadingJadwal ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : upcomingJadwal.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Belum ada jadwal ibadah / kegiatan yang terdaftar.
              </div>
            ) : (
              upcomingJadwal.slice(0, 4).map((j) => (
                <div
                  key={j.id}
                  className="p-3.5 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-foreground">
                      {j.activity}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5 text-indigo-500" />
                        {new Date(j.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5 text-indigo-500" />
                        {j.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5 text-indigo-500" />
                        {j.location}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium shrink-0">
                    {j.organizer}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Latest Renungan */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-amber-500" />
              <CardTitle className="text-base">Renungan Harian Terkini</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => navigate("/renungan")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </CardHeader>

          <CardContent className="mt-4 flex-1 space-y-3">
            {loadingRenungan ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : latestRenungan.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Belum ada data renungan yang diunggah.
              </div>
            ) : (
              latestRenungan.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {r.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {new Date(r.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {r.excerpt || r.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    <span>Oleh: {r.author}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
