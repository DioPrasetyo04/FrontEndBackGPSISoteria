import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectFade, Pagination } from "swiper/modules"
import { LoginForm } from "@/components/login-form"
import { Sparkles, Compass } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/effect-fade"
import "swiper/css/pagination"

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
    image: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=1600&auto=format&fit=crop",
    title: "Pujian & Kemuliaan Bagi Nama Tuhan",
    subtitle: "Menghadirkan Hadirat Tuhan di Tengah Setiap Ibadah",
    tag: "Worship Sanctuary",
  },
]

export default function LoginPage() {
  const [activeSlide, setActiveSlide] = useState(0)

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden bg-slate-950">
      {/* ─── BACKGROUND SWIPER CAROUSEL ────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 select-none">
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/70 z-10" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90 z-10 pointer-events-none" />

        {/* Glowing Orbs */}
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none z-10" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none z-10" />
      </div>

      {/* ─── TOP BRANDING BAR ─────────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-lg">
            <img
              src="/images/logo-soteria.png"
              alt="Logo GPSI Soteria"
              className="h-full w-full object-contain"
              onError={(e) => {
                // Fallback to logo.png or icon
                (e.target as HTMLElement).style.display = "none"
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
            <p className="text-[11px] text-slate-300">Gereja Protestan di Indonesia</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full">
          <Compass className="size-3.5 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Sistem Informasi Terpadu Pelayanan</span>
        </div>
      </header>

      {/* ─── CENTER LOGIN FORM CONTAINER ───────────────────────────────────────── */}
      <main className="relative z-20 w-full max-w-md md:max-w-4xl lg:max-w-5xl my-16 sm:my-12">
        <LoginForm />
      </main>

      {/* ─── BOTTOM SLIDE INFO & PAGINATION ────────────────────────────────────── */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 sm:px-10 pointer-events-none text-xs text-slate-400">
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

        <div className="flex items-center gap-1.5 ml-auto pointer-events-auto">
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
  )
}

export { LoginPage };
