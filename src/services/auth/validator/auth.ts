import { z } from "zod";

export const ROLE_OPTIONS = [
  {
    value: "PENGELOLA",
    label: "Pengelola Pelayanan",
    desc: "Mengelola jadwal ibadah, artikel renungan, warta jemaat, dan dokumentasi galeri.",
  },
  {
    value: "ADMIN",
    label: "Administrator Sistem",
    desc: "Akses penuh manajemen operasional modul portal dan kepengurusan.",
  },
  {
    value: "PHMJ",
    label: "Pengurus Harian Majelis Jemaat",
    desc: "Pimpinan harian majelis jemaat, monitoring kegiatan dan warta jemaat.",
  },
  {
    value: "MAJELIS",
    label: "Majelis Jemaat",
    desc: "Anggota majelis gereja untuk koordinasi pelayanan ibadah.",
  },
  {
    value: "KOORSEK",
    label: "Koordinator Sektor",
    desc: "Pelayanan jemaat tingkat sektor wilayah kepengurusan.",
  },
  {
    value: "SUPER_ADMIN",
    label: "Super Administrator",
    desc: "Kontrol keamanan penuh, konfigurasi global dan audit sistem.",
  },
] as const;

export const roleEnumSchema = z.enum([
  "ADMIN",
  "SUPER_ADMIN",
  "PENGELOLA",
  "KOORSEK",
  "PHMJ",
  "MAJELIS",
]);

export type RoleUserType = z.infer<typeof roleEnumSchema>;

export const passwordSchema = z
  .string()
  .min(8, { message: "Kata sandi minimal 8 karakter" })
  .regex(/[A-Z]/, {
    message: "Harus mengandung minimal 1 huruf besar",
  })
  .regex(/[a-z]/, {
    message: "Harus mengandung minimal 1 huruf kecil",
  })
  .regex(/[0-9]/, { message: "Harus mengandung minimal 1 angka" })
  .regex(/[^A-Za-z0-9]/, {
    message: "Harus mengandung minimal 1 karakter spesial (@, #, $, dll)",
  });

export const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi" }),
});

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  role: roleEnumSchema,
  password: passwordSchema,
});

export const registerFormSchema = z
  .object({
    name: z.string().min(3, { message: "Nama lengkap minimal 3 karakter" }),
    email: z.string().email({ message: "Format email tidak valid" }),
    role: roleEnumSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Konfirmasi kata sandi wajib diisi" }),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "Anda wajib menyetujui syarat & kebijakan pelayanan",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok dengan kata sandi",
    path: ["confirmPassword"],
  });

export const resendApprovalSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
});

export const processApprovalSchema = z.object({
  token: z.string().min(1, { message: "Token verifikasi wajib disertakan" }),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export const googleAuthSchema = z
  .object({
    idToken: z.string().min(1, { message: "Google ID Token wajib diisi" }),
  })
  .strict();

export const facebookAuthSchema = z
  .object({
    accessToken: z
      .string()
      .min(1, { message: "Facebook Access Token wajib diisi" }),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type ResendApprovalInput = z.infer<typeof resendApprovalSchema>;
export type ProcessApprovalInput = z.infer<typeof processApprovalSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type FacebookAuthInput = z.infer<typeof facebookAuthSchema>;