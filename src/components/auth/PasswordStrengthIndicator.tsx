import React, { useMemo } from "react";
import { CheckCircle2, Circle, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  showConfirmCheck?: boolean;
}

export interface RuleCheck {
  id: string;
  label: string;
  hint: string;
  met: boolean;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, confirmPassword, showConfirmCheck = false }) => {
  const rules = useMemo<RuleCheck[]>(() => {
    return [
      {
        id: "length",
        label: "Minimal 8 Karakter",
        hint: "8+ karakter",
        met: password.length >= 8,
      },
      {
        id: "uppercase",
        label: "Huruf Besar",
        hint: "A-Z",
        met: /[A-Z]/.test(password),
      },
      {
        id: "lowercase",
        label: "Huruf Kecil",
        hint: "a-z",
        met: /[a-z]/.test(password),
      },
      {
        id: "number",
        label: "Karakter Angka",
        hint: "0-9",
        met: /[0-9]/.test(password),
      },
      {
        id: "special",
        label: "Karakter Spesial / Simbol",
        hint: "!@#$%^&*",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
  }, [password]);

  const metCount = useMemo(() => rules.filter((r) => r.met).length, [rules]);

  const strength = useMemo(() => {
    if (!password) {
      return {
        percent: 0,
        label: "Belum Diisi",
        color: "bg-slate-300 dark:bg-slate-700",
        textColor: "text-muted-foreground",
        badgeBg: "bg-muted text-muted-foreground",
      };
    }
    const percent = Math.round((metCount / rules.length) * 100);

    if (metCount <= 2) {
      return {
        percent,
        label: "Lemah",
        color: "bg-rose-500",
        textColor: "text-rose-500",
        badgeBg: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
      };
    }
    if (metCount === 3 || metCount === 4) {
      return {
        percent,
        label: "Sedang",
        color: "bg-amber-500",
        textColor: "text-amber-500",
        badgeBg: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      };
    }
    return {
      percent: 100,
      label: "Kuat & Aman",
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
      badgeBg: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    };
  }, [password, metCount, rules.length]);

  const passwordsMatch =
    confirmPassword !== undefined &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const passwordsMismatch =
    confirmPassword !== undefined &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  return (
    <div className="space-y-2.5 pt-1.5 animate-in fade-in duration-200">
      {/* Header Info & Dynamic Label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
          <ShieldCheck className="size-3.5 text-indigo-500" />
          Kekuatan Kata Sandi:
        </span>
        <span
          className={cn(
            "text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all",
            strength.badgeBg,
          )}
        >
          {strength.label} ({strength.percent}%)
        </span>
      </div>

      {/* Progress Bar Container with 5 Segments */}
      <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            strength.color,
          )}
          style={{ width: `${strength.percent}%` }}
        />
      </div>

      {/* Rule Checklist Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all duration-200",
              rule.met
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-muted/40 border-border/40 text-muted-foreground",
            )}
          >
            {rule.met ? (
              <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="size-3 text-muted-foreground/60 shrink-0" />
            )}
            <span className="truncate">{rule.label}</span>
          </div>
        ))}

        {/* Confirmation Match Chip */}
        {showConfirmCheck && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all duration-200 col-span-2 sm:col-span-1",
              passwordsMatch
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : passwordsMismatch
                  ? "bg-rose-50 dark:bg-rose-950/30 border-rose-500/30 text-rose-600 dark:text-rose-400"
                  : "bg-muted/40 border-border/40 text-muted-foreground",
            )}
          >
            {passwordsMatch ? (
              <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
            ) : passwordsMismatch ? (
              <ShieldAlert className="size-3 text-rose-500 shrink-0" />
            ) : (
              <Circle className="size-3 text-muted-foreground/60 shrink-0" />
            )}
            <span className="truncate">
              {passwordsMatch
                ? "Kata Sandi Cocok"
                : passwordsMismatch
                  ? "Belum Cocok"
                  : "Konfirmasi Cocok"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
