import * as React from "react";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { signUp } from "@/services/auth/auth.service";
import {
  ROLE_OPTIONS,
  type RoleUserType,
} from "@/services/auth/validator/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Church,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Compass,
  CalendarDays,
  HeartHandshake,
} from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const backgroundSlides = [
  {
    image: "/images/background.jpg",
    title: "Gedung Gereja GPSI Soteria",
    subtitle: "Pusat Persekutuan, Doa & Pelayanan Jemaat",
    tag: "Gereja Induk",
  },
  {
    image: "/images/background-tentang-kami.jpg",
    title: "Kebersamaan & Kasih Persaudaraan",
    subtitle: "Melayani dengan Kesetiaan dalam Firman Tuhan",
    tag: "Persekutuan Jemaat",
  },
  {
    image: "/images/gallery/gallery.jpg",
    title: "Ibadah Raya & Pujian Penyembahan",
    subtitle: "Membangun Jemaat yang Berbuah dan Bersaksi",
    tag: "Pelayanan Ibadah",
  },
  {
    image:
      "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1600&auto=format&fit=crop",
    title: "Pujian & Kemuliaan Bagi Nama Tuhan",
    subtitle: "Menghadirkan Hadirat Tuhan di Tengah Setiap Ibadah",
    tag: "Worship Sanctuary",
  },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleUserType>("PENGELOLA");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password)
      return { score: 0, label: "Kosong", color: "bg-slate-300 dark:bg-slate-700", text: "text-muted-foreground" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return { score: 1, label: "Lemah", color: "bg-rose-500", text: "text-rose-500" };
    if (score === 3 || score === 4)
      return { score: 2, label: "Sedang", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 3, label: "Kuat", color: "bg-emerald-500", text: "text-emerald-500" };
  }, [password]);

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      toast.success("Pendaftaran Berhasil Dikirimkan!", {
        description:
          "Akun Anda sedang dalam antrean verifikasi oleh Administrator. Cek status di halaman konfirmasi.",
      });

      navigate(
        `/auth/pending-approval?email=${encodeURIComponent(email)}&role=${role}&name=${encodeURIComponent(name)}`,
        { replace: true },
      );
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Pendaftaran gagal. Silakan periksa kembali data Anda.";
      setErrorMessage(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error("Pendaftaran Gagal", {
        description: typeof msg === "string" ? msg : "Periksa input form Anda",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name || name.trim().length < 3) {
      setErrorMessage("Nama lengkap minimal 3 karakter");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMessage("Format email tidak valid");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Kata sandi minimal 8 karakter");
      return;
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setErrorMessage(
        "Kata sandi wajib memuat huruf besar, huruf kecil, angka, dan karakter spesial",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok dengan kata sandi");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Anda wajib menyetujui syarat & kebijakan pelayanan");
      return;
    }

    signUpMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password,
    });
  };

  const selectedRoleDesc = useMemo(() => {
    return (
      ROLE_OPTIONS.find((r) => r.value === role)?.desc ||
      "Akses standar ke sistem"
    );
  }, [role]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 pt-20 pb-20 overflow-x-hidden overflow-y-auto bg-slate-950">
      {/* ─── BACKGROUND SWIPER CAROUSEL ────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1200}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
          className="h-full w-full"
        >
          {backgroundSlides.map((slide, idx) => (
            <SwiperSlide key={idx} className="relative h-full w-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover object-center scale-105 transition-transform duration-10000 ease-out"
                style={{
                  filter: "brightness(0.65) saturate(1.15)",
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Ambient Overlays (Vignette & Deep Gradient) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/75 z-10" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/45 to-slate-950/90 z-10 pointer-events-none" />

        {/* Glowing Orbs */}
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none z-10" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none z-10" />
      </div>

      {/* ─── TOP BRANDING BAR ─────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 sm:px-10 bg-slate-950/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-lg">
            <img
              src="/images/logo-soteria.png"
              alt="Logo GPSI Soteria"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-white font-bold text-sm tracking-wide">
              <span>GPSI SOTERIA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                PORTAL ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-300">Gereja Pantekosta Soteria Indonesia</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full">
          <Compass className="size-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Sistem Informasi Terpadu Pelayanan</span>
        </div>
      </header>

      {/* ─── CENTER REGISTER FORM CONTAINER ────────────────────────────────────── */}
      <main className="relative z-20 w-full max-w-md md:max-w-4xl lg:max-w-5xl my-4 sm:my-6">
        <Card className="w-full overflow-hidden p-0 border border-white/20 dark:border-border/80 shadow-2xl rounded-3xl bg-card/95 backdrop-blur-xl text-card-foreground">
          <CardContent className="grid grid-cols-1 lg:grid-cols-12 p-0 min-h-[640px] w-full">
            {/* ─── FORM COLUMN (LEFT) ─────────────────────────────────────────── */}
            <div className="lg:col-span-7 p-6 sm:p-8 md:p-9 pb-8 sm:pb-10 flex flex-col justify-between space-y-5 w-full">
              <div className="space-y-6">
                {/* Header with Church Badge */}
                <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                  <div className="size-13 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center p-2.5 shadow-xs">
                    <Church className="size-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      Pendaftaran Akun Pelayanan
                    </h1>
                    <p className="text-balance text-xs sm:text-sm text-muted-foreground mt-1">
                      Bergabung melayani di Portal Manajemen Gereja GPSI Soteria
                    </p>
                  </div>
                </div>

                {/* Info Banner tentang Verifikasi */}
                <div className="p-3.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2.5 shadow-xs">
                  <ShieldCheck className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                  <span className="leading-relaxed">
                    Setiap pendaftaran akun baru akan diverifikasi oleh Administrator/Pengelola sebelum hak akses sistem diaktifkan.
                  </span>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Form Elements */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground tracking-wide flex items-center justify-between">
                      <span>Nama Lengkap</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Sesuai KTP / SK Pelayanan</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Yohanes Pembaptis"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-background text-foreground border border-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Alamat Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground tracking-wide">
                      Alamat Email Aktif
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@gpsisoteria.org"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-background text-foreground border border-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Pilihan Peran / Role Pelayanan */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground tracking-wide flex items-center gap-1.5">
                        <span>Peran Pelayanan (Role)</span>
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 uppercase">
                        {role}
                      </span>
                    </div>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as RoleUserType)}
                      className="w-full px-3.5 py-2.5 bg-background text-foreground border border-input rounded-xl text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-xs"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-background text-foreground py-1"
                        >
                          {opt.label} ({opt.value})
                        </option>
                      ))}
                    </select>
                    <div className="p-2.5 rounded-lg bg-muted/60 border border-border/50 text-[11px] text-muted-foreground flex items-center gap-2">
                      <Sparkles className="size-3.5 text-indigo-500 shrink-0" />
                      <span>
                        <strong className="text-foreground font-semibold">Tugas:</strong> {selectedRoleDesc}
                      </span>
                    </div>
                  </div>

                  {/* Kata Sandi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground tracking-wide">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter (huruf besar, kecil, angka, simbol)"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-background text-foreground border border-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-muted-foreground">Kekuatan Kata Sandi:</span>
                          <span className={cn("font-bold", passwordStrength.text)}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              passwordStrength.score >= 1 ? passwordStrength.color : "bg-muted",
                            )}
                          />
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              passwordStrength.score >= 2 ? passwordStrength.color : "bg-muted",
                            )}
                          />
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              passwordStrength.score >= 3 ? passwordStrength.color : "bg-muted",
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Konfirmasi Kata Sandi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground tracking-wide">
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-background text-foreground border border-input rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-[11px] text-destructive font-medium flex items-center gap-1.5">
                        <AlertCircle className="size-3.5" />
                        Kata sandi tidak cocok
                      </p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        Kata sandi cocok
                      </p>
                    )}
                  </div>

                  {/* Checkbox Persetujuan */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-foreground/80 leading-relaxed">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="size-4 mt-0.5 rounded border-input text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                      <span>
                        Saya menyetujui ketentuan pelayanan gereja dan bertanggung jawab penuh atas kerahasiaan akun portal GPSI Soteria ini.
                      </span>
                    </label>
                  </div>

                  {/* Tombol Submit */}
                  <button
                    type="submit"
                    disabled={signUpMutation.isPending}
                    className="w-full mt-3 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {signUpMutation.isPending ? (
                      <>
                        <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memproses Pendaftaran...</span>
                      </>
                    ) : (
                      <>
                        <span>Daftarkan Akun Pelayanan</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Tautan Kembali ke Login */}
              <div className="pt-4 pb-2 border-t border-border/60 text-center">
                <p className="text-xs text-muted-foreground">
                  Sudah memiliki akun pelayanan?{" "}
                  <Link
                    to="/auth/login"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold underline underline-offset-4 transition-colors"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>

            {/* ─── VISUAL SHOWCASE COLUMN (RIGHT) ─────────────────────────────── */}
            <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 xl:p-10 text-white overflow-hidden bg-slate-950">
              {/* Background Image with Deep Overlay */}
              <img
                src="/images/background-tentang-kami.jpg"
                alt="Pelayanan Jemaat GPSI Soteria"
                className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.45] saturate-[1.2] scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-indigo-950/65 z-1" />
              <div className="absolute -top-24 -right-24 size-80 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none z-1" />
              <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-blue-500/25 blur-3xl pointer-events-none z-1" />

              {/* Top Branding inside right panel */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
                  <Church className="size-6 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold tracking-wider text-indigo-300 uppercase">
                      GPSI SOTERIA
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      PELAYANAN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    Sistem Terpadu Pelayanan Jemaat
                  </p>
                </div>
              </div>

              {/* Ministry Pillars Information */}
              <div className="relative z-10 space-y-6 my-auto py-6">
                <div className="space-y-2">
                  <h2 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Melayani dengan Sepenuh Hati Bagi Kemuliaan Tuhan
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Portal ini memfasilitasi koordinasi pelayanan ibadah, renungan jemaat, dan administrasi gereja secara transparan dan tertib.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="size-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">
                        Hak Akses Terverifikasi
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Menjaga keamanan data jemaat dan inventaris dengan otorisasi pengurus berjenjang.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="size-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
                      <CalendarDays className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">
                        Koordinasi Jadwal & Warta
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Pengelolaan jadwal petugas ibadah, renungan harian, dan warta jemaat terpusat.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="size-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
                      <HeartHandshake className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">
                        Kolaborasi Kasih Persaudaraan
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Mempererat sinergi antara PHMJ, Majelis, Pengelola, dan Koordinator Sektor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bible Verse Card */}
              <div className="relative z-10 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl space-y-2">
                <p className="text-xs italic text-slate-200 leading-relaxed font-serif">
                  &ldquo;Layanilah seorang akan yang lain, sesuai dengan karunia yang telah diperoleh tiap-tiap orang sebagai pengurus yang baik dari kasih karunia Allah.&rdquo;
                </p>
                <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold pt-1 border-t border-white/10">
                  <span>1 Petrus 4:10</span>
                  <span className="text-slate-400 text-[10px] font-normal">Firman Tuhan</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* ─── BOTTOM SLIDE INFO & PAGINATION ────────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3.5 sm:px-10 bg-slate-950/60 backdrop-blur-md border-t border-white/10 text-xs text-slate-400">
        <div className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] text-slate-200 backdrop-blur-md">
            <Sparkles className="size-3 text-indigo-400" />
            {backgroundSlides[activeSlide]?.tag}
          </span>
          <span className="text-slate-300 font-medium">
            {backgroundSlides[activeSlide]?.title}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">
            {backgroundSlides[activeSlide]?.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {backgroundSlides.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                activeSlide === i ? "w-6 bg-indigo-400" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;
