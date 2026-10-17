import { createBrowserRouter, Navigate } from "react-router";
import adminRoutes from "./admin/adminRoutes";
import authRoutes from "./auth/authRoutes";

const router = createBrowserRouter([
  ...authRoutes,
  ...adminRoutes,
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
