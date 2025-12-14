// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/modules/auth/LoginPage";
import AdminDashboard from "@/modules/dashboard/AdminDashboard";
import UserDashboard from "@/modules/dashboard/UserDashboard";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
]);