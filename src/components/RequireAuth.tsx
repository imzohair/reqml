import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardRoute, type UserRole } from "@/lib/auth";

export function RequireAuth({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
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

  useEffect(() => {
    if (isReady && user && allowedRoles && !allowedRoles.includes(user.role)) {
      navigate({
        to: getDashboardRoute(user.role),
        replace: true,
      });
    }
  }, [allowedRoles, isReady, navigate, user]);

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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
