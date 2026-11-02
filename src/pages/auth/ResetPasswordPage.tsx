import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  verifyResetToken,
  resetPassword,
} from "@/services/auth/auth.service";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Compass,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  KeyRound,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

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
];

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [activeSlide, setActiveSlide] = useState(0);
  const [bgSwiper, setBgSwiper] = useState<any>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Verifikasi keabsahan token reset password
  const {
    data: verifyData,
    isLoading: isVerifying,
    isError: isTokenInvalid,
    error: verifyError,
  } = useQuery({
    queryKey: ["verifyResetToken", token],
    queryFn: () => verifyResetToken(token),
    enabled: Boolean(token),
    retry: false,
  });

  // Evaluasi 5 kriteria password aman
  const isLengthValid = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isAllCriteriaMet =
    isLengthValid && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const isMatching =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const canSubmit = isAllCriteriaMet && isMatching;

  const resetMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (res) => {
      setIsSuccess(true);
      toast.success(
        res.message || "Kata sandi Anda berhasil diperbarui! Silakan masuk.",
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memperbarui kata sandi.";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Token reset tidak ditemukan");
      return;
    }
    if (!isAllCriteriaMet) {
      toast.error(
        "Kata sandi harus memenuhi seluruh 5 kriteria keamanan karakter.",
      );
      return;
    }
    if (!isMatching) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }

    resetMutation.mutate({
      token,
      newPassword,
    });
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
      {/* Background Swiper Carousel */}
      <div className="absolute inset-0 z-0 select-none">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          loop={true}
          grabCursor={true}
          onSwiper={setBgSwiper}
          onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
          className="h-full w-full"
        >
          {backgroundSlides.map((slide, idx) => (
            <SwiperSlide key={idx} className="relative h-full w-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.title}
                className="h-full w-full object-cover object-center"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Top Branding Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl shadow-xl">
          <div className="size-10 rounded-xl bg-white dark:bg-slate-900 border border-white/30 p-1 flex items-center justify-center shadow-lg">
            <img
              src="/images/logo-gpsi.png"
              alt="Logo GPSI Soteria"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-white font-bold text-sm tracking-wide">
              <span>GPSI SOTERIA</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 text-white border border-white/30 backdrop-blur-xs font-semibold">
                PORTAL ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-200">Gereja Protestan di Indonesia</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-white bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-full shadow-xl pointer-events-auto">
          <Compass className="size-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Pengaturan Kata Sandi Baru</span>
        </div>
      </header>

      {/* Center Container Form */}
      <main className="relative z-20 w-full max-w-lg my-16 sm:my-12">
        <Card className="rounded-3xl border border-white/20 bg-card/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <CardContent className="p-0 space-y-6">
            {/* Case 1: Token Missing or Invalid */}
            {!token || isTokenInvalid ? (
              <div className="text-center space-y-5 animate-in fade-in duration-300">
                <div className="mx-auto size-16 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center justify-center shadow-sm">
                  <ShieldAlert className="size-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl font-bold text-foreground">
                    Tautan Tidak Valid atau Kedaluwarsa
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {(verifyError as any)?.response?.data?.message ||
                      "Tautan pengaturan ulang kata sandi ini sudah tidak berlaku (masa aktif 15 menit telah habis) atau telah digunakan sebelumnya."}
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    onClick={() => navigate("/auth/forgot-password")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Ajukan Permintaan Reset Baru
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/auth/login")}
                    className="w-full rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Ke Halaman Masuk
                  </Button>
                </div>
              </div>
            ) : isVerifying ? (
              /* Case 2: Loading Validation */
              <div className="text-center py-10 space-y-4">
                <div className="mx-auto size-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Memverifikasi keabsahan tautan pemulihan...
                </p>
              </div>
            ) : isSuccess ? (
              /* Case 3: Success Screen */
              <div className="text-center space-y-5 animate-in zoom-in-95 duration-300">
                <div className="mx-auto size-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="size-9" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    Kata Sandi Berhasil Diperbarui!
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Kata sandi baru Anda telah aktif. Seluruh sesi login sebelumnya telah diamankan. Silakan masuk kembali dengan kata sandi baru.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              /* Case 4: Reset Password Form */
              <div className="space-y-6">
                <div className="space-y-2 text-center">
                  <div className="mx-auto size-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                    <KeyRound className="size-7" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight pt-1">
                    Buat Kata Sandi Baru
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Halo{" "}
                    <strong className="text-foreground">
                      {verifyData?.data?.name || "Pengguna"}
                    </strong>
                    , silakan masukkan kata sandi baru Anda dengan memenuhi kriteria keamanan di bawah.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Kata Sandi Baru */}
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel
                        htmlFor="newPassword"
                        className="text-xs font-semibold text-foreground"
                      >
                        Kata Sandi Baru
                      </FieldLabel>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        {showNewPassword ? (
                          <>
                            <EyeOff className="size-3.5" /> Sembunyikan
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" /> Tampilkan
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Kombinasi huruf besar, kecil, angka, simbol"
                        required
                        className="pl-10 h-10 text-sm text-foreground bg-background border-border/80 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20 rounded-xl"
                      />
                    </div>
                  </Field>

                  {/* Dynamic Progress Bar & Character Criteria Checklist */}
                  <PasswordStrengthIndicator
                    password={newPassword}
                    confirmPassword={confirmPassword}
                    showConfirmCheck={true}
                  />

                  {/* Konfirmasi Kata Sandi Baru */}
                  <Field className="pt-1">
                    <div className="flex items-center justify-between">
                      <FieldLabel
                        htmlFor="confirmPassword"
                        className="text-xs font-semibold text-foreground"
                      >
                        Konfirmasi Kata Sandi Baru
                      </FieldLabel>
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <>
                            <EyeOff className="size-3.5" /> Sembunyikan
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" /> Tampilkan
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        required
                        className="pl-10 h-10 text-sm text-foreground bg-background border-border/80 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20 rounded-xl"
                      />
                    </div>
                  </Field>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!canSubmit || resetMutation.isPending}
                    className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetMutation.isPending ? (
                      <>
                        <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan Kata Sandi Baru...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        <span>Simpan Kata Sandi Baru</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Bottom Slider Information */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 sm:px-10 pointer-events-none text-xs text-slate-200">
        <div className="hidden md:flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-xl pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 border border-white/20 text-[11px] text-white backdrop-blur-md shadow-sm">
            <Sparkles className="size-3 text-amber-300" />
            {backgroundSlides[activeSlide]?.tag}
          </span>
          <span className="text-white font-semibold">
            {backgroundSlides[activeSlide]?.title}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto pointer-events-auto bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-xl">
          <button
            type="button"
            onClick={() => bgSwiper?.slidePrev()}
            className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-1.5 px-1">
            {backgroundSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => bgSwiper?.slideToLoop(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === i ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => bgSwiper?.slideNext()}
            className="p-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
