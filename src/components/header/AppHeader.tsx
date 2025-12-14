// src/components/header/AppHeader.tsx
import { useAuth } from "@/auth/useAuth";
import { LogOut, User } from "lucide-react";

export default function AppHeader() {
  const { user, role, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">
          Control Financiero
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-zinc-600" />
            <span className="text-zinc-700">{user?.email}</span>
            {role === "admin" && (
              <span className="px-2 py-1 bg-zinc-900 text-white text-xs rounded-full">
                Admin
              </span>
            )}
          </div>
          
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}