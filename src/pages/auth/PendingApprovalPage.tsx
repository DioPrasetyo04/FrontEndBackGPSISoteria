import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { resendApproval } from "@/services/auth/auth.service";
import { toast } from "sonner";
import {
  Clock,
  Mail,
  ArrowLeft,
  Send,
} from "lucide-react";

const COOLDOWN_DURATION = 60; // 60 seconds limiter
const STORAGE_KEY_PREFIX = "GPSI_RESEND_TIMESTAMP_";

export const PendingApprovalPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "Pelayan";
  const role = searchParams.get("role") || "PENGELOLA";

  const storageKey = `${STORAGE_KEY_PREFIX}${email}`;

  const [cooldown, setCooldown] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const lastSent = parseInt(stored, 10);
        const elapsed = Math.floor((Date.now() - lastSent) / 1000);
        if (elapsed < COOLDOWN_DURATION) {
          return COOLDOWN_DURATION - elapsed;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  // Countdown interval
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const resendMutation = useMutation({
    mutationFn: resendApproval,
    onSuccess: (response) => {
      sessionStorage.setItem(storageKey, Date.now().toString());
      setCooldown(COOLDOWN_DURATION);

      toast.success("Notifikasi Berhasil Dikirimkan!", {
        description:
          response.message ||
          "Email permohonan verifikasi telah dikirimkan ulang ke Administrator.",
      });
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 429) {
        const remaining = data?.data?.remainingSeconds || 60;
        setCooldown(remaining);
        toast.warning("Batas Pengiriman", {
          description:
            data?.message ||
            `Harap tunggu ${remaining} detik lagi sebelum mengirim ulang.`,
        });
        return;
      }

      toast.error("Gagal Mengirim Ulang", {
        description:
          data?.message ||
          "Terjadi kendala saat mengirim notifikasi. Silakan coba lagi.",
      });
    },
  });

  const handleResend = () => {
    if (cooldown > 0 || resendMutation.isPending) return;

    if (!email) {
      toast.error("Alamat email tidak ditemukan.");
      return;
    }

    resendMutation.mutate({ email });
  };

  return (
    <div className="dark min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 text-slate-100 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-2xl shadow-black/60 p-6 md:p-8 space-y-6 text-slate-100">
          {/* Header & Icon */}
          <div className="text-center space-y-3">
            <div className="relative inline-flex items-center justify-center size-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
              <Clock className="size-10 animate-pulse text-amber-400" />
              <div className="absolute -bottom-1 -right-1 size-7 bg-white dark:bg-slate-900 rounded-full border-2 border-slate-900 p-1 flex items-center justify-center shadow-sm">
                <img
                  src="/images/logo-gpsi.png"
                  alt="Logo GPSI Soteria"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Pendaftaran Sedang Ditinjau
              </h1>
              <p className="text-sm text-slate-300">
                Menunggu Konfirmasi & Verifikasi Administrator
              </p>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              Halo, <strong className="text-white font-semibold">{name}</strong>! Pendaftaran
              akun pelayanan Anda telah berhasil diterima oleh sistem GPSI
              Soteria.
            </p>
            <p className="text-slate-400">
              Notifikasi email otomatis telah dikirimkan ke kotak masuk
              Administrator / Pengelola gereja untuk memeriksa dan menyetujui
              pengajuan peran Anda.
            </p>
          </div>

          {/* Applicant Summary Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Nama Pendaftar</span>
              <span className="font-semibold text-white">{name}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Alamat Email</span>
              <span className="font-semibold text-white break-all text-right">{email || "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Peran yang Diajukan</span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase tracking-wider text-[11px]">
                {role}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400">Status Akun</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1.5 text-[11px]">
                <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                MENUNGGU VERIFIKASI
              </span>
            </div>
          </div>

          {/* Resend Section with Rate Limiter */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Mail className="size-3.5 text-indigo-400" />
                Admin belum memverifikasi?
              </span>
              {cooldown > 0 && (
                <span className="text-amber-400 font-mono text-[11px] font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                  Tunggu {cooldown}s
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resendMutation.isPending || !email}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                cooldown > 0 || resendMutation.isPending || !email
                  ? "bg-slate-800/70 border-slate-700/60 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] border-indigo-500/80 text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
              }`}
            >
              {resendMutation.isPending ? (
                <>
                  <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim Notifikasi...</span>
                </>
              ) : cooldown > 0 ? (
                <>
                  <Clock className="size-3.5 text-amber-400" />
                  <span className="text-slate-300">Kirim Ulang Notifikasi ({cooldown} detik)</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5 text-white" />
                  <span>Kirim Ulang Notifikasi ke Admin</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Pengiriman ulang dibatasi jeda 60 detik untuk mencegah spam server.
            </p>
          </div>

          {/* Action Links */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-4 text-xs">
            <Link
              to="/auth/login"
              className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium py-1"
            >
              <ArrowLeft className="size-3.5" />
              <span>Kembali ke Halaman Login</span>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} GPSI Soteria. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
};
export default PendingApprovalPage;
