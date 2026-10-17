import type { LoginSchema } from "@/services/auth/types/auth";
import type { UserRole } from "@/services/user/types/user";

export const DEFAULT_AVAILABLE_ROLES = [
  {
    role: "SUPER_ADMIN" as UserRole,
    label: "Super Admin",
    description: "Akses penuh tak terbatas ke seluruh sistem",
  },
  {
    role: "ADMIN" as UserRole,
    label: "Administrator",
    description: "Pengelola utama sistem dan operasional gereja",
  },
  {
    role: "PHMJ" as UserRole,
    label: "PHMJ (Pengurus Harian)",
    description: "Pengurus Harian Majelis Jemaat",
  },
  {
    role: "MAJELIS" as UserRole,
    label: "Majelis Jemaat",
    description: "Pelayan majelis jemaat gereja",
  },
  {
    role: "KOORSEK" as UserRole,
    label: "Koordinator Sektor",
    description: "Koordinator pelayanan sektor",
  },
  {
    role: "PENGELOLA" as UserRole,
    label: "Pengelola Konten",
    description: "Staf multimedia & publikasi warta/renungan/jadwal",
  },
];

export const DEFAULT_PERMISSION_MODULES = [
  {
    module: "dashboard",
    title: "Dashboard & Ringkasan",
    permissions: [
      {
        id: "dashboard.view",
        name: "Lihat Ringkasan Statistik",
        description: "Mengakses dashboard analitik dan ringkasan data jemaat/konten",
        module: "dashboard",
      },
    ],
  },
  {
    module: "jadwal",
    title: "Jadwal Ibadah & Acara",
    permissions: [
      {
        id: "jadwal.view",
        name: "Lihat Jadwal Ibadah",
        description: "Melihat daftar jadwal ibadah rutin dan acara gereja",
        module: "jadwal",
      },
      {
        id: "jadwal.manage",
        name: "Kelola Jadwal Ibadah",
        description: "Menambah, mengubah, dan menghapus jadwal ibadah atau acara",
        module: "jadwal",
      },
    ],
  },
  {
    module: "renungan",
    title: "Renungan Harian",
    permissions: [
      {
        id: "renungan.view",
        name: "Lihat Renungan",
        description: "Membaca artikel renungan harian dan filter tanggal",
        module: "renungan",
      },
      {
        id: "renungan.manage",
        name: "Kelola Renungan",
        description: "Membuat renungan baru, mengedit artikel, dan menghapus renungan",
        module: "renungan",
      },
    ],
  },
  {
    module: "warta",
    title: "Warta Jemaat",
    permissions: [
      {
        id: "warta.view",
        name: "Lihat Warta",
        description: "Melihat dokumen warta jemaat mingguan",
        module: "warta",
      },
      {
        id: "warta.manage",
        name: "Kelola Warta",
        description: "Mengunggah, mengedit, dan menghapus dokumen warta jemaat",
        module: "warta",
      },
    ],
  },
  {
    module: "gallery",
    title: "Galeri Dokumentasi",
    permissions: [
      {
        id: "gallery.view",
        name: "Lihat Galeri",
        description: "Melihat album foto dan dokumentasi kegiatan gereja",
        module: "gallery",
      },
      {
        id: "gallery.manage",
        name: "Kelola Galeri",
        description: "Mengunggah, mengedit sorotan (highlight), dan menghapus foto galeri",
        module: "gallery",
      },
    ],
  },
  {
    module: "organization",
    title: "Struktur Organisasi",
    permissions: [
      {
        id: "organization.view",
        name: "Lihat Organisasi",
        description: "Melihat bagan struktur pengurus harian & koordinator sektor",
        module: "organization",
      },
      {
        id: "organization.manage",
        name: "Kelola Organisasi",
        description: "Menambah, mengedit informasi, dan mengatur urutan pengurus majelis",
        module: "organization",
      },
    ],
  },
  {
    module: "users",
    title: "Manajemen Pengguna",
    permissions: [
      {
        id: "users.view",
        name: "Lihat Pengguna",
        description: "Melihat daftar akun pengguna dan status persetujuan",
        module: "users",
      },
      {
        id: "users.manage",
        name: "Kelola Pengguna",
        description: "Menambah akun baru, mengubah data pengguna, dan menghapus akun",
        module: "users",
      },
    ],
  },
  {
    module: "roles",
    title: "Hak Akses & Perizinan",
    permissions: [
      {
        id: "roles.view",
        name: "Lihat Peran & Hak Akses",
        description: "Melihat matriks perizinan role dan hak akses pengguna",
        module: "roles",
      },
      {
        id: "roles.manage",
        name: "Kelola Peran & Hak Akses",
        description: "Mengubah perizinan role, menetapkan multi-role, dan kustomisasi perizinan user",
        module: "roles",
      },
    ],
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "dashboard.view",
    "jadwal.view",
    "jadwal.manage",
    "renungan.view",
    "renungan.manage",
    "warta.view",
    "warta.manage",
    "gallery.view",
    "gallery.manage",
    "organization.view",
    "organization.manage",
    "users.view",
    "users.manage",
    "roles.view",
    "roles.manage",
  ],
  PHMJ: [
    "dashboard.view",
    "jadwal.view",
    "renungan.view",
    "warta.view",
    "gallery.view",
    "organization.view",
    "organization.manage",
  ],
  MAJELIS: [
    "dashboard.view",
    "jadwal.view",
    "renungan.view",
    "warta.view",
    "gallery.view",
    "organization.view",
  ],
  KOORSEK: [
    "dashboard.view",
    "jadwal.view",
    "warta.view",
    "gallery.view",
  ],
  PENGELOLA: [
    "dashboard.view",
    "jadwal.view",
    "jadwal.manage",
    "renungan.view",
    "renungan.manage",
    "warta.view",
    "warta.manage",
    "gallery.view",
    "gallery.manage",
  ],
};

/**
 * Cek apakah permission matches requiredPermission (mendukung wildcard "*" atau "module.*").
 */
export function hasPermissionMatch(
  userPermissions: string[] = [],
  requiredPermission: string,
): boolean {
  if (userPermissions.includes("*")) return true;
  if (userPermissions.includes(requiredPermission)) return true;

  const [module] = requiredPermission.split(".");
  if (module && userPermissions.includes(`${module}.*`)) return true;

  return false;
}

/**
 * Cek otorisasi user berdasarkan session yang aktif.
 * Memeriksa role tunggal, multiple roles (user.roles), dan perizinan dinamis (user.permissions).
 */
export function canUserAccess(
  session: LoginSchema | null | undefined,
  requirement: {
    permission?: string | string[];
    roles?: (UserRole | string) | (UserRole | string)[];
  },
): boolean {
  if (!session) return false;

  const userRole = session.role || "PENGELOLA";
  const userRoles: string[] =
    Array.isArray(session.roles) && session.roles.length > 0
      ? session.roles
      : [userRole];

  // 1. Super Admin otomatis memiliki akses ke segala modul dan menu
  if (userRoles.includes("SUPER_ADMIN")) {
    return true;
  }

  // Siapkan daftar perizinan user
  let userPermissions = session.permissions;
  if (!userPermissions || userPermissions.length === 0) {
    // Fallback cerdas dari default role permissions jika belum ter-cache di local storage
    const fallbackPerms = new Set<string>();
    for (const r of userRoles) {
      const perms = DEFAULT_ROLE_PERMISSIONS[r] || [];
      for (const p of perms) fallbackPerms.add(p);
    }
    userPermissions = Array.from(fallbackPerms);
  }

  if (userPermissions.includes("*")) {
    return true;
  }

  // 2. Cek apakah ada kecocokan Role (jika disyaratkan)
  if (requirement.roles) {
    const allowedRoles = Array.isArray(requirement.roles)
      ? requirement.roles
      : [requirement.roles];
    const roleMatched = userRoles.some((r) => allowedRoles.includes(r));
    if (roleMatched) {
      return true;
    }
  }

  // 3. Cek apakah ada kecocokan Permission (jika disyaratkan)
  if (requirement.permission) {
    const reqPerms = Array.isArray(requirement.permission)
      ? requirement.permission
      : [requirement.permission];
    const permMatched = reqPerms.some((p) =>
      hasPermissionMatch(userPermissions, p),
    );
    if (permMatched) {
      return true;
    }
  }

  // Jika tidak ada requirement spesifik yang dipenuhi
  if (requirement.roles || requirement.permission) {
    return false;
  }

  return true;
}
