import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Compass,
  ChevronLeft,
  ChevronRight,
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

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [bgSwiper, setBgSwiper] = useState<any>(null);
  const [isSent, setIsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Timer cooldown untuk pengiriman ulang
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const forgotMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (res) => {
      setIsSent(true);
      const remainingSeconds = res?.data?.cooldownSeconds || 60;
      setCooldown(remainingSeconds);
      toast.success(
        res.message || "Tautan reset kata sandi telah dikirim ke email Anda!",
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal mengirimkan tautan reset kata sandi.";
      if (err?.response?.data?.data?.remainingSeconds) {
        setCooldown(err.response.data.data.remainingSeconds);
      }
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Alamat email wajib diisi");
      return;
    }
    forgotMutation.mutate({ email: email.trim() });
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
          <span>Pemulihan Keamanan Akun</span>
        </div>
      </header>

      {/* Center Container Form */}
      <main className="relative z-20 w-full max-w-md my-16 sm:my-12">
        <Card className="rounded-3xl border border-white/20 bg-card/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <CardContent className="p-0 space-y-6">
            {/* Header Icon & Title */}
            <div className="space-y-2 text-center">
              <div className="mx-auto size-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                <Mail className="size-7" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight pt-1">
                Lupa Kata Sandi?
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan verifikasi untuk membuat kata sandi baru.
              </p>
            </div>

            {/* Success Notification Box */}
            {isSent ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>Email Terkirim!</span>
                  </div>
                  <p className="leading-relaxed">
                    Instruksi reset kata sandi telah dikirimkan ke{" "}
                    <strong className="text-foreground">{email}</strong>.
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                    <Clock className="size-3.5 text-amber-500" />
                    <span>Tautan hanya berlaku selama <strong>15 menit</strong>.</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={cooldown > 0 || forgotMutation.isPending}
                    variant="outline"
                    className="w-full h-10 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {cooldown > 0 ? (
                      <span>Kirim Ulang Tautan ({cooldown}s)</span>
                    ) : forgotMutation.isPending ? (
                      <span>Mengirim...</span>
                    ) : (
                      <span>Kirim Ulang Email</span>
                    )}
                  </Button>

                  <Link
                    to="/auth/login"
                    className="w-full h-10 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    Kembali ke Halaman Masuk
                  </Link>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="email" className="text-xs font-semibold text-foreground">
                    Alamat Email Terdaftar
                  </FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@gerejasoteria.org"
                      required
                      autoFocus
                      className="pl-10 h-10 text-sm text-foreground bg-background border-border/80 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20 rounded-xl"
                    />
                  </div>
                </Field>

                <Button
                  type="submit"
                  disabled={forgotMutation.isPending || cooldown > 0}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {forgotMutation.isPending ? (
                    <>
                      <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim Tautan...</span>
                    </>
                  ) : cooldown > 0 ? (
                    <span>Tunggu ({cooldown}s)</span>
                  ) : (
                    <>
                      <span>Kirim Tautan Reset Kata Sandi</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Kembali ke Halaman Masuk</span>
                  </Link>
                </div>
              </form>
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

export default ForgotPasswordPage;
