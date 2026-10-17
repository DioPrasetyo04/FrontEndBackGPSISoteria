import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router"
import { useMutation } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login, loginByGoogle, loginByFacebook } from "@/services/auth/auth.service"
import { setSession } from "@/lib/utils"
import { toast } from "sonner"
import { Church, Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<{
    email: string;
    name?: string;
    role?: string;
  } | null>(null);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "973852122466-4445nnh2ugqfg562lioc9o9dtf4so2u8.apps.googleusercontent.com";
  const facebookAppId =
    import.meta.env.VITE_FACEBOOK_APP_ID || "1754888139124417";

  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services & Facebook SDK scripts
  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (res: any) => {
              if (res?.credential) {
                googleLoginMutation.mutate({ idToken: res.credential });
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleButtonRef.current) {
            googleButtonRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 250,
            });
          }
        } catch (err) {
          console.error("GSI init error:", err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGoogle();
        }
      }, 150);
      return () => clearInterval(timer);
    }

    // Initialize Facebook SDK
    const initFacebook = () => {
      if (window.FB) {
        try {
          window.FB.init({
            appId: facebookAppId,
            cookie: true,
            xfbml: true,
            version: "v19.0",
            fedCM: false,
          });
        } catch (err) {
          console.error("Facebook SDK init error:", err);
        }
      }
    };

    if (window.FB) {
      initFacebook();
    } else {
      window.fbAsyncInit = function () {
        initFacebook();
      };
      if (!document.getElementById("facebook-sdk-script")) {
        const fbScript = document.createElement("script");
        fbScript.id = "facebook-sdk-script";
        fbScript.src = "https://connect.facebook.net/id_ID/sdk.js";
        fbScript.async = true;
        fbScript.defer = true;
        document.body.appendChild(fbScript);
      }
    }
  }, [googleClientId, facebookAppId]);

  const handleAuthSuccess = (authData: any, defaultEmail = email) => {
    const userId = authData.user?.id || authData.userId || authData.id || authData.session?.userId;
    setSession({
      id: userId,
      name: authData.name || authData.user?.name || "Administrator",
      email: authData.email || authData.user?.email || defaultEmail,
      role: authData.role || authData.user?.role || "ADMIN",
      token: authData.token,
      expiresAt: authData.expiresAt ? String(authData.expiresAt) : undefined,
    });
    toast.success("Login Berhasil", {
      description: `Selamat datang kembali, ${
        authData.name || authData.user?.name || "Admin"
      }!`,
    });
    navigate("/", { replace: true });
  };

  // Email/Password Mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      if (response && response.data) {
        handleAuthSuccess(response.data);
      } else {
        setErrorMessage("Data respon autentikasi tidak valid");
      }
    },
    onError: (error: any) => {
      const respData = error?.response?.data;
      const code = respData?.code;

      if (code === "ACCOUNT_PENDING") {
        setPendingUser({
          email: respData?.data?.email || email,
          name: respData?.data?.name || "Pelayan",
          role: respData?.data?.role || "PENGELOLA",
        });
        setErrorMessage(
          "Akun Anda sedang dalam antrean verifikasi oleh Administrator.",
        );
        toast.warning("Akun Menunggu Persetujuan", {
          description:
            "Silakan periksa status pendaftaran Anda di halaman konfirmasi.",
        });
        return;
      }

      setPendingUser(null);
      const msg =
        respData?.message ||
        error?.response?.data?.data ||
        "Email atau kata sandi tidak sesuai. Periksa kembali akun Anda.";
      setErrorMessage(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error("Gagal Masuk", {
        description: typeof msg === "string" ? msg : "Periksa kredensial Anda",
      });
    },
  });

  // Google Login Mutation
  const googleLoginMutation = useMutation({
    mutationFn: loginByGoogle,
    onSuccess: (response) => {
      if (response && response.data) {
        handleAuthSuccess(response.data);
      }
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Gagal autentikasi via akun Google. Pastikan akun terdaftar.";
      toast.error("Google Auth Gagal", { description: msg });
    },
  });

  // Facebook Login Mutation
  const facebookLoginMutation = useMutation({
    mutationFn: loginByFacebook,
    onSuccess: (response) => {
      if (response && response.data) {
        handleAuthSuccess(response.data);
      }
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Gagal autentikasi via akun Facebook. Pastikan izin email aktif.";
      toast.error("Facebook Auth Gagal", { description: msg });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Email dan kata sandi wajib diisi");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleGoogleClick = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (res: any) => {
            if (res?.credential) {
              googleLoginMutation.mutate({ idToken: res.credential });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Trigger rendered Google button if available
        const renderedBtn = googleButtonRef.current?.querySelector(
          "div[role=button], button, iframe",
        ) as HTMLElement;
        if (renderedBtn && typeof renderedBtn.click === "function") {
          renderedBtn.click();
          return;
        }

        window.google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.()) {
            toast.info("Google Sign-In Popup", {
              description: "Silakan gunakan tombol Google langsung di form.",
            });
          }
        });
      } catch (err) {
        console.error("GSI prompt error:", err);
      }
    } else {
      toast.info("Menghubungkan layanan Google...", {
        description: "Memuat library Google Identity Services, silakan coba beberapa detik lagi.",
      });
    }
  };

  const handleFacebookClick = () => {
    // Facebook Login mewajibkan HTTPS secara ketat sesuai kebijakan Meta Security
    if (window.location.protocol !== "https:") {
      toast.error("Protokol HTTPS Diperlukan", {
        description:
          "Facebook Login mewajibkan koneksi HTTPS yang aman. Silakan buka atau alihkan aplikasi ke https://localhost:5173",
        action: {
          label: "Beralih ke HTTPS",
          onClick: () => {
            window.location.href = window.location.href.replace(/^http:/, "https:");
          },
        },
        duration: 8000,
      });
      return;
    }

    if (window.FB) {
      window.FB.login(
        (response: any) => {
          if (response?.authResponse?.accessToken) {
            facebookLoginMutation.mutate({
              accessToken: response.authResponse.accessToken,
            });
          } else {
            if (response?.status === "not_authorized") {
              toast.error("Otorisasi Facebook Ditolak", {
                description:
                  "Aplikasi belum diizinkan mengakses akun Facebook Anda.",
              });
            } else {
              toast.error("Login Facebook dibatalkan");
            }
          }
        },
        { scope: "public_profile,email" }
      );
    } else {
      toast.info("Menghubungkan layanan Facebook...", {
        description:
          "Library Facebook SDK sedang dimuat. Silakan coba kembali dalam beberapa detik.",
      });
    }
  };

  const handleQuickFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMessage(null);
  };

  const isPending =
    loginMutation.isPending ||
    googleLoginMutation.isPending ||
    facebookLoginMutation.isPending;

  return (
    <div className={cn("w-full flex flex-col gap-6", className)} {...props}>
      <Card className="w-full overflow-hidden p-0 border border-white/20 dark:border-border/80 shadow-2xl rounded-3xl bg-card/95 backdrop-blur-xl text-card-foreground">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0 min-h-[580px] w-full">
          {/* Form Column */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6 w-full">
            <FieldGroup className="space-y-4">
              {/* Header with Church Badge */}
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="size-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs p-2.5">
                  <Church className="size-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    GPSI Soteria
                  </h1>
                  <p className="text-balance text-xs sm:text-sm text-muted-foreground mt-1">
                    Masuk ke Portal Manajemen Administrator & Pelayanan
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                  {pendingUser && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/auth/pending-approval?email=${encodeURIComponent(pendingUser.email)}&name=${encodeURIComponent(pendingUser.name || "")}&role=${encodeURIComponent(pendingUser.role || "")}`,
                        )
                      }
                      className="w-full h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Lihat Status & Kirim Ulang Notifikasi</span>
                      <ArrowRight className="size-3" />
                    </Button>
                  )}
                </div>
              )}

              {/* Email Field */}
              <Field>
                <FieldLabel htmlFor="email" className="text-xs font-semibold text-foreground">
                  Alamat Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gpsisoteria.org"
                  required
                  className="h-10 text-sm text-foreground bg-background border-border/80 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20 rounded-xl"
                />
              </Field>

              {/* Password Field */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-xs font-semibold text-foreground">
                    Kata Sandi
                  </FieldLabel>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {showPassword ? (
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
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 text-sm text-foreground bg-background border-border/80 focus-visible:border-indigo-600 focus-visible:ring-indigo-600/20 rounded-xl"
                />
              </Field>

              {/* Submit Button */}
              <Field>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <span>Masuk ke Dashboard</span>
                  )}
                </Button>
              </Field>

              {/* Separator */}
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-[11px] text-muted-foreground uppercase font-medium">
                Atau masuk dengan akun sosial
              </FieldSeparator>

              {/* Social Login Buttons: Google & Facebook */}
              <div className="grid grid-cols-2 gap-3 items-center">
                {/* Google Button Container */}
                <div className="relative h-10 w-full group rounded-xl">
                  {/* Visually balanced button matching Facebook */}
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isPending}
                    className="w-full h-10 rounded-xl border border-border/80 bg-background group-hover:bg-muted font-medium text-xs text-foreground flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                  >
                    <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Google</span>
                  </Button>

                  {/* Google GSI rendered button overlay for native GIS popup */}
                  <div
                    ref={googleButtonRef}
                    className="absolute inset-0 w-full h-full opacity-[0.0001] overflow-hidden cursor-pointer z-10 flex items-center justify-center [&>div]:w-full! [&>div]:h-full! [&_iframe]:w-full! [&_iframe]:h-full! [&_iframe]:cursor-pointer"
                  />
                </div>

                {/* Facebook Button */}
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleFacebookClick}
                  disabled={isPending}
                  className="h-10 rounded-xl border border-border/80 bg-background hover:bg-muted font-medium text-xs text-foreground flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <svg className="size-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </Button>
              </div>

              {/* Quick Fill Testing Credentials */}
              <div className="pt-2">
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 text-center">
                  Akun Pengujian Cepat:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill("user1@gmai.com", "Admin@123")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-muted border border-border hover:bg-muted/80 text-foreground transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3 text-indigo-500" />
                    Admin (user1@gmai.com)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill("user@gmail.com", "Admin@123")}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-muted border border-border hover:bg-muted/80 text-foreground transition-colors font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3 text-indigo-500" />
                    Pengelola (user@gmail.com)
                  </button>
                </div>
              </div>

              <FieldDescription className="text-center text-xs text-muted-foreground pt-1">
                Belum memiliki akun pelayanan?{" "}
                <Link
                  to="/auth/register"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Daftar di sini</span>
                  <ArrowRight className="size-3" />
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Right Column: Visual Sanctuary Church Showcase */}
          <div className="relative hidden bg-slate-950 md:flex flex-col justify-end p-8 lg:p-10 overflow-hidden select-none min-h-[580px]">
            {/* Background Image */}
            <img
              src="/images/background.jpg"
              alt="GPSI Soteria Sanctuary"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-45 mix-blend-luminosity scale-105"
            />

            {/* Radiant Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-indigo-950/30" />

            {/* Glowing Accent Orbs */}
            <div className="absolute top-1/4 right-1/4 size-48 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 size-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            {/* Content on Right Banner */}
            <div className="relative z-10 space-y-4 text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-semibold tracking-wide">
                <Sparkles className="size-3 text-indigo-400" />
                <span>Gereja Protestan di Indonesia</span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-white">
                GPSI Soteria
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                &ldquo;Melayani dengan kasih Kristus, teguh dalam kebenaran firman, dan bersaksi bagi kemuliaan nama Tuhan di tengah jemaat dan masyarakat.&rdquo;
              </p>

              <div className="pt-3 flex items-center gap-4 text-xs text-slate-400 border-t border-white/10">
                <span>Pelayanan Terpadu</span>
                <span>•</span>
                <span>Warta Jemaat</span>
                <span>•</span>
                <span>Renungan Harian</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Terms */}
      <FieldDescription className="px-6 text-center text-xs text-slate-400">
        Dengan masuk, Anda menyetujui kebijakan pelayanan dan privasi sistem informasi GPSI Soteria.
      </FieldDescription>
    </div>
  )
}
