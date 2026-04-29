import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Главная", icon: "🏠" },
  { to: "/channels", label: "Каналы", icon: "📡" },
  { to: "/sessions", label: "Сессии", icon: "💬" },
  { to: "/logs", label: "Логи", icon: "📋" },
];

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-rurik-400">🛡️</span> Rurik
          </h1>
          <nav className="flex gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm transition-colors ${
                    isActive
                      ? "bg-rurik-900/50 text-rurik-300"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  }`
                }
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">
        <Outlet />
      </main>
      <footer className="border-t border-gray-800 py-3 text-center text-xs text-gray-600">
        Rurik Gateway · MIT License
      </footer>
    </div>
  );
}
