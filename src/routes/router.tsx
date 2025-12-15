// src/routes/router.tsx
import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/modules/auth/LoginPage";
import AdminDashboard from "@/modules/dashboard/AdminDashboard";
import UserDashboard from "@/modules/dashboard/UserDashboard";
import UserEntryChoice from "@/modules/user/UserEntryChoice";
import UserIncomeForm from "@/modules/user/forms/UserIncomeForm";
import UserExpenseForm from "@/modules/user/forms/UserExpenseForm";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { ROUTES } from "@/lib/constants/routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <UserDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER_ENTRY,
    element: (
      <ProtectedRoute>
        <UserEntryChoice />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER_INCOME,
    element: (
      <ProtectedRoute>
        <UserIncomeForm />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.USER_EXPENSE,
    element: (
      <ProtectedRoute>
        <UserExpenseForm />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.ADMIN,
    element: (
      <ProtectedRoute requireAdmin>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
]);