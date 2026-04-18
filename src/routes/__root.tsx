import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { Chatbot } from "@/components/Chatbot";
import { AuthProvider } from "@/contexts/AuthContext";
import { FoodProvider } from "@/contexts/FoodContext";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center glass rounded-3xl p-10 shadow-elegant">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-105 transition-smooth"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ResQMeal — Saving Food, Serving Lives" },
      {
        name: "description",
        content:
          "AI-powered food rescue platform connecting donors with NGOs in real time to fight hunger and reduce waste.",
      },
      { property: "og:title", content: "ResQMeal" },
      { property: "og:description", content: "Intelligent Food Rescue & Redistribution System" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <FoodProvider>
        <AppShell />
        <Chatbot />
        <Toaster />
      </FoodProvider>
    </AuthProvider>
  );
}
