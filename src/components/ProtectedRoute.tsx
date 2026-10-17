import React from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { getSession } from "@/lib/utils";
import { canUserAccess } from "@/lib/permissions";
import type { UserRole } from "@/services/user/types/user";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  permission?: string | string[];
  roles?: (UserRole | string) | (UserRole | string)[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  roles,
}) => {
  const session = getSession();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Cek autentikasi sesi login
  if (!session || !session.token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 2. Cek otorisasi peran dan perizinan jika disyaratkan
  if (permission || roles) {
    const hasAccess = canUserAccess(session, { permission, roles });

    if (!hasAccess) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-card border border-border/80 rounded-3xl p-8 text-center shadow-xl space-y-6">
            <div className="mx-auto size-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center">
              <ShieldAlert className="size-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-destructive/15 text-destructive border border-destructive/20">
                Akses Ditolak (403 Forbidden)
              </span>
              <h2 className="text-xl font-bold text-foreground tracking-tight pt-1">
                Anda Tidak Memiliki Hak Akses
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Halaman ini tidak diperuntukkan bagi akun Anda. Hubungi Administrator jika Anda memerlukan akses ke modul ini.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="size-3.5 text-muted-foreground" />
                <span>Peran Akun Anda:</span>
              </div>
              <span className="font-semibold text-foreground">
                {session.role || "PENGELOLA"}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/70 hover:bg-muted text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                Kembali
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
              >
                <Home className="size-3.5" />
                Ke Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export const PublicOnlyRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const session = getSession();

  if (session && session.token) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
