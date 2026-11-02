import type { RouteObject } from "react-router";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { PendingApprovalPage } from "@/pages/auth/PendingApprovalPage";
import { VerifyApprovalPage } from "@/pages/auth/VerifyApprovalPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { PublicOnlyRoute } from "@/components/ProtectedRoute";

const authRoutes: RouteObject[] = [
  {
    path: "/auth/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/auth/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/auth/forgot-password",
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/auth/reset-password",
    element: (
      <PublicOnlyRoute>
        <ResetPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/auth/pending-approval",
    element: <PendingApprovalPage />,
  },
  {
    path: "/auth/verify-approval",
    element: <VerifyApprovalPage />,
  },
];

export default authRoutes;
