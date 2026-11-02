import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectFade } from "swiper/modules"
import { LoginForm } from "@/components/login-form"
import { Sparkles, Compass, ChevronLeft, ChevronRight } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/effect-fade"

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
  const [bgSwiper, setBgSwiper] = useState<any>(null)

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
      {/* ─── BACKGROUND SWIPER CAROUSEL (ZERO OVERLAY - FULL PURE CONTRAST) ────── */}
      <div className="absolute inset-0 z-0 select-none">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1000}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
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

      {/* ─── FLOATING BUTTON SLIDER (PREV & NEXT) ────────────────────────────── */}
      <button
        type="button"
        onClick={() => bgSwiper?.slidePrev()}
        className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 size-11 sm:size-12 rounded-full bg-black/65 hover:bg-black/90 active:scale-95 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-2xl cursor-pointer group"
        title="Latar Belakang Sebelumnya"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="size-6 text-white group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        type="button"
        onClick={() => bgSwiper?.slideNext()}
        className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 size-11 sm:size-12 rounded-full bg-black/65 hover:bg-black/90 active:scale-95 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-2xl cursor-pointer group"
        title="Latar Belakang Selanjutnya"
        aria-label="Next Slide"
      >
        <ChevronRight className="size-6 text-white group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* ─── TOP BRANDING BAR ─────────────────────────────────────────────────── */}
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
          <span>Sistem Informasi Terpadu Pelayanan</span>
        </div>
      </header>

      {/* ─── CENTER LOGIN FORM CONTAINER ───────────────────────────────────────── */}
      <main className="relative z-20 w-full max-w-md md:max-w-4xl lg:max-w-5xl my-16 sm:my-12">
        <LoginForm />
      </main>

      {/* ─── BOTTOM SLIDE INFO & BUTTON SLIDER PAGINATION ──────────────────────── */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 sm:px-10 pointer-events-none text-xs text-slate-200">
        <div className="hidden md:flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-xl pointer-events-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 border border-white/20 text-[11px] text-white backdrop-blur-md shadow-sm">
            <Sparkles className="size-3 text-amber-300" />
            {backgroundSlides[activeSlide]?.tag}
          </span>
          <span className="text-white font-semibold">
            {backgroundSlides[activeSlide]?.title}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300 text-[11px]">
            {backgroundSlides[activeSlide]?.subtitle}
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
  )
}

export { LoginPage };
