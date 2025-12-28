// src/components/header/AppHeaderWithMenu.tsx
// Esta es una versión alternativa de AppHeader que usa el UserMenu con dropdown
import UserMenu from "./UserMenu";

export default function AppHeaderWithMenu() {
  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">
          Control Financiero
        </h1>
        
        <UserMenu />
      </div>
    </header>
  );
}