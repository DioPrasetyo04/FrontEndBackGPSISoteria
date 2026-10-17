import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserById, updateUser } from "@/services/user/user.service";
import { getSession, setSession, getCurrentUserId } from "@/lib/utils";
import type { UserRole } from "@/services/user/types/user";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Sparkles,
  KeyRound,
  Calendar,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router";

const roleDescriptions: Record<string, { label: string; desc: string; color: string }> = {
  SUPER_ADMIN: {
    label: "Super Administrator",
    desc: "Akses penuh ke seluruh konfigurasi sistem, data jemaat, dan manajemen hak akses.",
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  },
  ADMIN: {
    label: "Administrator",
    desc: "Akses manajemen operasional konten, warta, renungan, dan struktur organisasi.",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
  PHMJ: {
    label: "Pengurus Harian Majelis Jemaat",
    desc: "Akses kepengurusan warta, kegiatan gereja, dan verifikasi pelayanan jemaat.",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  },
  MAJELIS: {
    label: "Majelis Jemaat",
    desc: "Akses pelaporan pelayanan, jadwal ibadah, dan kegiatan kategorial gereja.",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  KOORSEK: {
    label: "Koordinator Sektor",
    desc: "Akses koordinasi sektor pelayanan dan kegiatan ibadah rumah tangga.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  PENGELOLA: {
    label: "Pengelola Konten",
    desc: "Akses pengelolaan renungan harian, jadwal mingguan, galeri foto, dan warta.",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
};

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const activeSession = getSession();
  const userId = getCurrentUserId();

  // Form states
  const [name, setName] = useState(activeSession?.name || "");
  const [email, setEmail] = useState(activeSession?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch complete user data from backend if userId available
  const { data: userDataResponse } = useQuery({
    queryKey: ["user-profile-data", userId],
    queryFn: () => (userId ? getUserById(userId) : null),
    enabled: !!userId,
  });

  const currentUserData = userDataResponse?.data?.user;

  // Sync state with fetched user data
  useEffect(() => {
    if (currentUserData) {
      setName(currentUserData.name || activeSession?.name || "");
      setEmail(currentUserData.email || activeSession?.email || "");
    }
  }, [currentUserData, activeSession]);

  const activeRole = (currentUserData?.role || activeSession?.role || "PENGELOLA") as UserRole;
  const roleMeta = roleDescriptions[activeRole] || {
    label: activeRole,
    desc: "Hak akses peran pengguna dalam sistem informasi GPSI Soteria.",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  };

  // Password validation rules
  const passwordCriteria = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid =
    passwordCriteria.minLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecial;

  // Copy ID to clipboard
  const handleCopyId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setIsCopied(true);
    toast.success("User ID berhasil disalin ke clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Mutation to update user
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("ID Akun tidak ditemukan. Harap login kembali.");
      }

      if (!name.trim() || name.trim().length < 3) {
        throw new Error("Nama lengkap minimal 3 karakter");
      }

      if (!email.trim() || !email.includes("@")) {
        throw new Error("Format email tidak valid");
      }

      if (password) {
        if (!isPasswordValid) {
          throw new Error("Password baru belum memenuhi semua kriteria keamanan.");
        }
        if (password !== confirmPassword) {
          throw new Error("Konfirmasi password tidak cocok dengan password baru.");
        }
      }

      const payload: { name: string; email: string; password?: string } = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };

      if (password) {
        payload.password = password;
      }

      return updateUser(userId, payload);
    },
    onSuccess: (res) => {
      const updatedUser = res?.data?.user;
      const newName = updatedUser?.name || name.trim();
      const newEmail = updatedUser?.email || email.trim().toLowerCase();

      // Update session in local storage
      if (activeSession) {
        setSession({
          ...activeSession,
          id: userId || activeSession.id,
          name: newName,
          email: newEmail,
        });
      }

      // Notify other components (Navbar & Sidebar)
      window.dispatchEvent(new Event("session-updated"));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["user-profile-data", userId] });
      queryClient.invalidateQueries({ queryKey: ["users-list"] });

      // Clear password fields
      setPassword("");
      setConfirmPassword("");

      toast.success("Profil akun berhasil diperbarui!", {
        description: "Data profil dan kredensial Anda telah disimpan secara aman.",
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gagal memperbarui profil akun. Silakan coba lagi.";
      toast.error("Gagal Memperbarui Profil", {
        description: msg,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleReset = () => {
    setName(currentUserData?.name || activeSession?.name || "");
    setEmail(currentUserData?.email || activeSession?.email || "");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── HEADER / BANNER ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-card/80 via-card/50 to-background border border-border/70 shadow-xs backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl uppercase shadow-xs shrink-0">
            {name ? name.slice(0, 2) : "AD"}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Manajemen Profil & Akun
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleMeta.color}`}
              >
                {roleMeta.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3" />
                Akun Terverifikasi
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kelola informasi profil pribadi, pengaturan keamanan data akun, dan kredensial akses Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            to="/users"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors"
          >
            <span>Daftar Pengguna</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* ─── MAIN CONTENT GRID ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── LEFT: USER INFO & ACCOUNT CARD ───────────────────────── */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card Ringkasan Akun */}
          <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
              <Sparkles className="size-4 text-indigo-500" />
              <span>Ringkasan Akun Pengguna</span>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-muted/40 rounded-xl border border-border/50">
              <div className="size-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-2xl flex items-center justify-center uppercase shadow-md shadow-indigo-600/20 border-2 border-background">
                {name ? name.slice(0, 2) : "AD"}
              </div>
              <h2 className="text-sm font-bold text-foreground mt-3 truncate max-w-[200px]">
                {name || "Administrator"}
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-[220px] mt-0.5">
                {email || "admin@gpsisoteria.org"}
              </p>
              <div className="mt-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${roleMeta.color}`}
                >
                  {roleMeta.label}
                </span>
              </div>
            </div>

            {/* Detail Metadata Akun */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-muted/20 rounded-xl border border-border/40 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Shield className="size-3.5 text-indigo-500" />
                    ID Akun
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Salin ID Akun"
                    className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span className="text-emerald-500">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-[11px] text-foreground bg-background p-2 rounded-lg border border-border/60 truncate select-all">
                  {userId || "Tidak tersedia"}
                </p>
              </div>

              {currentUserData?.createdAt && (
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/40">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3.5 text-indigo-500" />
                    Terdaftar Sejak
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(currentUserData.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/50 dark:border-indigo-900/40">
                <p className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-300">
                  Hak Akses & Wewenang
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {roleMeta.desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: EDIT PROFILE & PASSWORD FORM ─────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Informasi Profil */}
            <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-foreground">
                    Informasi Data Profil
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Data utama identitas akun Anda
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field: Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Nama Lengkap</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      required
                      minLength={3}
                      maxLength={100}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-background border border-border/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-foreground transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Minimal 3 karakter, ditampilkan di seluruh dashboard.
                  </p>
                </div>

                {/* Field: Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Alamat Email</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@gpsisoteria.org"
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-background border border-border/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-foreground transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Digunakan untuk login dan menerima notifikasi sistem.
                  </p>
                </div>
              </div>

              {/* Field: Role / Peran (Readonly) */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-foreground">
                  Peran / Hak Akses (Role)
                </label>
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/50">
                  <Shield className="size-4 text-indigo-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {roleMeta.label}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/10 text-indigo-500 font-mono">
                        {activeRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      Peran hanya dapat diubah oleh Administrator Utama melalui menu Manajemen Pengguna.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Keamanan Akun & Ganti Kata Sandi */}
            <div className="p-6 rounded-2xl bg-card border border-border/70 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-foreground">
                    Keamanan & Ganti Kata Sandi
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Opsional — kosongkan jika tidak ingin mengubah kata sandi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Field: Password Baru */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password baru"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-background border border-border/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-foreground transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Field: Konfirmasi Password Baru */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-background border border-border/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-foreground transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Checklist (shown when password is being entered) */}
              {password.length > 0 && (
                <div className="p-3.5 bg-muted/30 rounded-xl border border-border/50 space-y-2 text-xs">
                  <p className="font-semibold text-foreground text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-indigo-500" />
                    Standar Keamanan Kata Sandi Baru:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCriteria.minLength ? "text-emerald-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {passwordCriteria.minLength ? (
                        <Check className="size-3" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground/50 ml-1 mr-0.5" />
                      )}
                      <span>Minimal 8 karakter</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCriteria.hasUpper ? "text-emerald-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {passwordCriteria.hasUpper ? (
                        <Check className="size-3" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground/50 ml-1 mr-0.5" />
                      )}
                      <span>Minimal 1 huruf besar (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCriteria.hasLower ? "text-emerald-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {passwordCriteria.hasLower ? (
                        <Check className="size-3" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground/50 ml-1 mr-0.5" />
                      )}
                      <span>Minimal 1 huruf kecil (a-z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        passwordCriteria.hasNumber ? "text-emerald-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {passwordCriteria.hasNumber ? (
                        <Check className="size-3" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground/50 ml-1 mr-0.5" />
                      )}
                      <span>Minimal 1 angka (0-9)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 sm:col-span-2 ${
                        passwordCriteria.hasSpecial ? "text-emerald-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {passwordCriteria.hasSpecial ? (
                        <Check className="size-3" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-muted-foreground/50 ml-1 mr-0.5" />
                      )}
                      <span>Minimal 1 karakter spesial (!@#$%^&*...)</span>
                    </div>
                  </div>

                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1 pt-1">
                      <AlertCircle className="size-3" />
                      Konfirmasi password tidak cocok!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Section 3: Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={updateMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset Perubahan</span>
              </button>

              <button
                type="submit"
                disabled={
                  updateMutation.isPending ||
                  (password.length > 0 && (!isPasswordValid || password !== confirmPassword))
                }
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>Simpan Perubahan Profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
