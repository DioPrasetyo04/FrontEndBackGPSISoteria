import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getApprovalInfo, processApproval } from "@/services/auth/auth.service";
import { toast } from "sonner";
import {
  Church,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Mail,
  ArrowRight,
} from "lucide-react";

export const VerifyApprovalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const initialAction = searchParams.get("action") || "";

  const [actionChoice, setActionChoice] = useState<"approve" | "reject">(
    initialAction === "reject" ? "reject" : "approve",
  );
  const [reason, setReason] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  // Fetch applicant info using the verification token
  const {
    data: applicantData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["approval-info", token],
    queryFn: () => getApprovalInfo(token),
    enabled: !!token,
    retry: 1,
  });

  const applicant = applicantData?.data;

  const approvalMutation = useMutation({
    mutationFn: processApproval,
    onSuccess: (response) => {
      setIsCompleted(true);
      const msg =
        response?.message ||
        (actionChoice === "approve"
          ? "Akun berhasil diverifikasi dan diaktifkan."
          : "Pendaftaran akun telah ditolak.");
      setResultMessage(msg);
      toast.success(actionChoice === "approve" ? "Akun Disetujui" : "Akun Ditolak", {
        description: msg,
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        "Gagal memproses verifikasi. Token mungkin sudah kedaluwarsa.";
      toast.error("Gagal Memproses", { description: msg });
    },
  });

  const handleProcess = (chosenAction: "approve" | "reject") => {
    if (!token) {
      toast.error("Token verifikasi tidak ditemukan.");
      return;
    }
    setActionChoice(chosenAction);
    approvalMutation.mutate({
      token,
      action: chosenAction,
      reason: chosenAction === "reject" ? reason : undefined,
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 text-foreground relative overflow-hidden py-12">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2 shadow-inner">
              <Church className="size-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Verifikasi Pendaftaran Akun
            </h1>
            <p className="text-sm text-slate-400">
              Panel Otorisasi Administrator & Pengelola GPSI Soteria
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <div className="size-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-400">
                Memuat data pendaftar dari token verifikasi...
              </p>
            </div>
          )}

          {/* Invalid Token State */}
          {(isError || (!isLoading && !applicant && !isCompleted)) && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/30 text-center space-y-4">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  Tautan Verifikasi Tidak Berlaku
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {(error as any)?.response?.data?.message ||
                    "Tautan ini tidak valid, sudah pernah digunakan, atau masa berlakunya telah habis."}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <span>Buka Dashboard Portal</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Completed State */}
          {isCompleted && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div
                className={`inline-flex items-center justify-center size-12 rounded-xl ${
                  actionChoice === "approve"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {actionChoice === "approve" ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <XCircle className="size-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  {actionChoice === "approve"
                    ? "Pendaftaran Berhasil Disetujui!"
                    : "Pendaftaran Berhasil Ditolak"}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {resultMessage}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
                >
                  <span>Menuju Dashboard Admin</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Active Applicant Review State */}
          {!isLoading && applicant && !isCompleted && (
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-slate-950/70 border border-white/10 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="size-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                    <User className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {applicant.name}
                    </h2>
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <Mail className="size-3" />
                      {applicant.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Peran yang Diajukan</span>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
                      {applicant.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Waktu Mendaftar</span>
                    <span className="text-slate-300 font-medium">
                      {new Date(applicant.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Status Saat Ini</span>
                    <span className="text-amber-400 font-semibold uppercase">
                      {applicant.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Optional Reason if rejecting */}
              {actionChoice === "reject" && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="text-xs font-medium text-slate-300">
                    Alasan Penolakan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Contoh: Belum terdaftar dalam data jemaat sektor..."
                    className="w-full px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              {/* Dual Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleProcess("approve")}
                  disabled={approvalMutation.isPending}
                  className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Setujui & Aktifkan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (actionChoice !== "reject") {
                      setActionChoice("reject");
                    } else {
                      handleProcess("reject");
                    }
                  }}
                  disabled={approvalMutation.isPending}
                  className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="size-4" />
                  <span>
                    {actionChoice === "reject" ? "Konfirmasi Tolak" : "Tolak Pendaftaran"}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Aksi ini bersifat permanen dan akan langsung memperbarui hak akses pengguna di database.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} GPSI Soteria. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
};
export default VerifyApprovalPage;
