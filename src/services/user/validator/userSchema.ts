import {z} from "zod"

const passwordSchema = z
  .string()
  .min(8, { message: "Password minimal 8 karakter" })
  .regex(/[A-Z]/, {
    message: "Password harus mengandung minimal 1 huruf besar",
  })
  .regex(/[a-z]/, {
    message: "Password harus mengandung minimal 1 huruf kecil",
  })
  .regex(/[0-9]/, { message: "Password harus mengandung minimal 1 angka" })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password harus mengandung minimal 1 karakter spesial",
  });

const roleEnumSchema = z.enum([
  "ADMIN",
  "SUPER_ADMIN",
  "PENGELOLA",
  "KOORSEK",
  "PHMJ",
  "MAJELIS",
]);

export const UserCreateSchema = z.object({
    name: z
    .string()
    .min(1, { message: "Nama wajib diisi" })
    .min(3, { message: "Nama minimal 3 karakter" })
    .max(100, { message: "Nama maksimal 100 karakter" }),
  email: z
    .string()
    .min(1, { message: "Email wajib diisi" })
    .email({ message: "Format email tidak valid" }),
  password: passwordSchema,
  role: roleEnumSchema,
})

export const UserUpdateSchema = z.object({
   name: z
    .string()
    .min(1, { message: "Nama wajib diisi" })
    .min(3, { message: "Nama minimal 3 karakter" })
    .max(100, { message: "Nama maksimal 100 karakter" })
    .optional(),
  email: z
    .string()
    .min(1, { message: "Email wajib diisi" })
    .email({ message: "Format email tidak valid" })
    .optional(),
  password: passwordSchema.optional(),
  role: roleEnumSchema.optional(),
})

export type UserCreateInput = z.infer<typeof UserCreateSchema>
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>

