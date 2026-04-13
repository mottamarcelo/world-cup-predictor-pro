import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, LayoutGrid, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data/mockData";

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Jogos", path: "/", icon: LayoutGrid },
  { label: "Ligas", path: "/leagues", icon: Users },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy text-navy-foreground border-b border-border/10">
        <div className="container flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <span className="font-bold text-sm">Bolão Copa 2026</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "nav-item flex items-center gap-1.5 text-navy-foreground/70",
                    isActive && "bg-navy-foreground/10 text-navy-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
              {currentUser.avatarInitials}
            </div>
            <Link to="/auth" className="text-navy-foreground/50 hover:text-navy-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border sm:hidden">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="container py-6 pb-20 sm:pb-6">
        {children}
      </main>
    </div>
  );
}
