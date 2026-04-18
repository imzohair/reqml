import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isReady && !user) {
      navigate({
        to: "/login",
        search: {
          redirect: location.pathname,
        },
        replace: true,
      });
    }
  }, [isReady, location.pathname, navigate, user]);

  if (!isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="rounded-3xl border border-border/60 bg-background/70 px-8 py-6 shadow-sm backdrop-blur">
          <div className="text-sm font-semibold text-muted-foreground">Checking session...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
