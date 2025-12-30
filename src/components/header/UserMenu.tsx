// src/components/header/UserMenu.tsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/auth/useAuth";
import { LogOut, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserMenu() {
  const { user, displayName, role, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-zinc-100 active:bg-zinc-200",
          isOpen && "bg-zinc-100"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-zinc-900">
              {displayName || "Usuario"}
            </p>
            {role === "admin" && (
              <p className="text-xs text-zinc-500">Administrador</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-zinc-500 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-zinc-100">
              <p className="text-sm font-medium text-zinc-900">
                {displayName || "Usuario"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">
                {user?.email}
              </p>
              {role === "admin" && (
                <span className="inline-block mt-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded-full">
                  Administrador
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}