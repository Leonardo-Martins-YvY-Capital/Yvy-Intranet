import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "../components/ui/Logo";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/design-system", label: "Design System" },
];

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-yvy-navy text-white sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-[1494px] mx-auto px-6 h-12 flex items-center justify-between">
          <NavLink to="/" className="flex items-center">
            <Logo width={60} height={30} fillColor="#ffffff" />
          </NavLink>
          <ul className="flex items-center gap-x-6">
            {NAV_LINKS.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    [
                      "text-base font-barlowcn uppercase tracking-widest transition-colors",
                      isActive ? "text-white" : "text-white/55 hover:text-white/85",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
