import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Home,
  LayoutDashboard,
  Map,
  Sparkles,
  LogOut,
  TrendingUp,
  LogIn,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getUserLabel, type UserRole } from "@/lib/auth";

const publicNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/about", label: "Impact", icon: TrendingUp },
];

const donorNav = [
  { to: "/donate", label: "Donor Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Insights", icon: Sparkles },
  { to: "/tracking", label: "Map", icon: Map },
];

const ngoNav = [
  { to: "/ngo", label: "NGO Dashboard", icon: LayoutDashboard },
  { to: "/tracking", label: "Map", icon: Map },
  { to: "/analytics", label: "Insights", icon: Sparkles },
];

const volunteerNav = [
  { to: "/tracking", label: "Volunteer Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Insights", icon: Sparkles },
];

function getRoleLabel(role: UserRole) {
  if (role === "ngo") {
    return "NGO";
  }

  if (role === "volunteer") {
    return "Volunteer";
  }

  return "Donor";
}

function getRoleNavigation(role: UserRole) {
  if (role === "donor") {
    return donorNav;
  }

  if (role === "ngo") {
    return ngoNav;
  }

  return volunteerNav;
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isReady, logout } = useAuth();
  const userLabel = user ? getUserLabel(user.email) : "";
  const roleLabel = user ? getRoleLabel(user.role) : "";
  const nav = user ? [...publicNav, ...getRoleNavigation(user.role)] : publicNav;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col w-full font-sans overflow-x-hidden">
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/15 bg-[#0B0F19]/82 px-4 py-3 text-white shadow-[0_24px_80px_-28px_rgba(11,15,25,0.85)] backdrop-blur-2xl sm:px-6">
          <div className="flex min-w-0 items-center gap-4 lg:gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-glow transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="font-black text-lg tracking-tight text-white sm:text-xl">ResQMeal</div>
                <div className="hidden text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300/80 sm:block">
                  Predictive Rescue
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 lg:flex">
              {nav.map((item) => {
                const active = location.pathname === item.to || (location.pathname === "/" && item.to === "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-smooth",
                      active
                        ? "bg-white text-slate-900 shadow-[0_10px_30px_-15px_rgba(255,255,255,0.75)]"
                        : "text-white/68 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              AI Routing Active
            </div>

            {user ? (
              <>
                <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 sm:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white shadow-inner">
                    {userLabel.slice(0, 1)}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold leading-tight text-white">{userLabel}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">{roleLabel}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-inner transition-smooth hover:-translate-y-0.5 hover:bg-white/10 hover:text-emerald-300"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : isReady ? (
              <Link
                to="/login"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-bold text-white transition-smooth hover:-translate-y-0.5 hover:bg-white/10 hover:text-emerald-300"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            ) : (
              <div className="h-11 w-28 rounded-full border border-white/10 bg-white/5" />
            )}

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
              aria-label="Navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-3 lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto rounded-full border border-white/20 bg-white/55 p-2 shadow-card backdrop-blur-xl">
          {nav.map((item) => {
            const active = location.pathname === item.to || (location.pathname === "/" && item.to === "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-smooth",
                  active ? "gradient-primary text-white shadow-glow" : "bg-white/60 text-slate-600"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 flex flex-col w-full relative z-0 pt-4 sm:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
