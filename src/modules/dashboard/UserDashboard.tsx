// src/modules/dashboard/UserDashboard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants/routes";

export default function UserDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente a la vista de selección de entrada
    navigate(ROUTES.USER_ENTRY, { replace: true });
  }, [navigate]);

  return null;
}