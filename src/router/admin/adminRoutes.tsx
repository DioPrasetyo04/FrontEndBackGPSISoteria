import type { RouteObject } from "react-router";
import { AdminLayout } from "@/components/admin-layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { JadwalPage } from "@/pages/jadwal/JadwalPage";
import { RenunganPage } from "@/pages/renungan/RenunganPage";
import { WartaPage } from "@/pages/warta/WartaPage";
import { GalleryPage } from "@/pages/gallery/GalleryPage";
import { OrganizationPage } from "@/pages/organization/OrganizationPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { RolesPermissionsPage } from "@/pages/roles/RolesPermissionsPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";

const adminRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute permission="dashboard.view">
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "jadwal",
        element: (
          <ProtectedRoute permission="jadwal.view">
            <JadwalPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "renungan",
        element: (
          <ProtectedRoute permission="renungan.view">
            <RenunganPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "warta",
        element: (
          <ProtectedRoute permission="warta.view">
            <WartaPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "gallery",
        element: (
          <ProtectedRoute permission="gallery.view">
            <GalleryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "organization",
        element: (
          <ProtectedRoute permission="organization.view">
            <OrganizationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute permission="users.view" roles={["SUPER_ADMIN", "ADMIN"]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "roles",
        element: (
          <ProtectedRoute permission="roles.view" roles={["SUPER_ADMIN", "ADMIN"]}>
            <RolesPermissionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "roles-permissions",
        element: (
          <ProtectedRoute permission="roles.view" roles={["SUPER_ADMIN", "ADMIN"]}>
            <RolesPermissionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
];

export default adminRoutes;