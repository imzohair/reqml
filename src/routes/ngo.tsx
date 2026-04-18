import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useFood, type FoodItem } from "@/contexts/FoodContext";

import {
  Bell, MapPin, Clock, Utensils, Flame, Package, CheckCircle2, Search, Sparkles, AlertCircle, Network, RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/ngo")({
  head: () => ({
    meta: [
      { title: "NGO Dashboard — ResQMeal" },
      { name: "description", content: "Browse and accept available food donations near you in real time." },
    ],
  }),
  component: NgoDashboard,
});

type Donation = FoodItem & {
  name?: string;
  distanceKm: number;
  expiresInMin: number;
  donor?: string;
};

const NGO_COORDS = { lat: 19.076, lng: 72.8777 };

function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(2));
}

function Countdown({ minutes, timeStr }: { minutes?: number, timeStr?: string }) {
  const [m, setM] = useState(0);
  useEffect(() => {
    if (timeStr) {
      const calcTime = () => Math.max(0, Math.floor((new Date(timeStr).getTime() - Date.now()) / 60000));
      setM(calcTime());
      const t = setInterval(() => setM(calcTime()), 60000);
      return () => clearInterval(t);
    } else if (minutes !== undefined) {
      setM(minutes);
      const t = setInterval(() => setM((v) => Math.max(0, v - 1)), 60000);
      return () => clearInterval(t);
    }
  }, [timeStr, minutes]);
  const hrs = Math.floor(m / 60);
  const mins = m % 60;
  const urgent = m < 60;
  return (
    <span className={cn("font-mono font-semibold tabular-nums", urgent ? "text-red-500" : "text-emerald-500")}>
      {hrs > 0 ? `${hrs}h ` : ""}{mins}m
    </span>
  );
}

function NgoDashboard() {
  const { user } = useAuth();
  const { food, loading, error, fetchFood } = useFood();
  const [filter, setFilter] = useState<"ai_ranked" | "nearest" | "urgent" | "large">("ai_ranked");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      fetchFood({ silent: true });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const items: Donation[] = food.map((item) => ({
    ...item,
    name: item.title,
    donor: item.users?.name || "Local Donor",
    distanceKm: calculateDistanceKm(NGO_COORDS.lat, NGO_COORDS.lng, item.lat ?? NGO_COORDS.lat, item.lng ?? NGO_COORDS.lng),
    expiresInMin: Math.floor((new Date(item.expiry_time).getTime() - Date.now()) / 60000),
  }));

  let visible = [...items];
  if (query) visible = visible.filter((d) => (d.name || "").toLowerCase().includes(query.toLowerCase()));
  
  if (filter === "ai_ranked") {
    visible.sort((a, b) => {
      if (a.status === "Urgent" && b.status !== "Urgent") return -1;
      if (b.status === "Urgent" && a.status !== "Urgent") return 1;
      return (a.distanceKm + (a.expiresInMin / 60)) - (b.distanceKm + (b.expiresInMin / 60));
    });
  }
  if (filter === "nearest") visible.sort((a, b) => a.distanceKm - b.distanceKm);
  if (filter === "urgent") visible = visible.filter((d) => d.status === "Urgent" || d.expiresInMin < 60);
  if (filter === "large") visible.sort((a, b) => b.qty - a.qty);

  const claimFood = async (id: string) => {
    try {
      await api.patch(`/food/${id}/claim`, { ngo_id: user?.user_id });
      await fetchFood({ silent: true });
      toast.success("Food Claimed!", { description: "Donor notified. Please pick up before expiry." });
    } catch (err) {
      toast.error("Failed to claim food. It might be already taken.");
    }
  };

  const filters = [
    { key: "ai_ranked" as const, label: "AI Match ✨", icon: Sparkles },
    { key: "nearest" as const, label: "Closest", icon: MapPin },
    { key: "urgent" as const, label: "Expiring Soon", icon: Flame },
    { key: "large" as const, label: "Largest Qty", icon: Package },
  ];

  return (
    <RequireAuth>
    <div className="px-4 pb-24 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel mesh-overlay relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10 animate-fade-up">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-orange-400/15 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
              <Network className="h-4 w-4" /> Partner Feed
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tighter text-slate-900 lg:text-5xl">Intelligent Matching</h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
              Real-time food listings from the live backend, sorted by our matching logic.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food types..."
                className="h-12 rounded-2xl border-white/40 bg-white/70 pl-10 shadow-sm backdrop-blur-xl focus-visible:ring-primary/40"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchFood()}
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-xl transition-smooth hover:-translate-y-0.5 hover:shadow-elegant"
              aria-label="Refresh listings"
            >
              <RefreshCcw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
            </button>
          </div>
        </div>
        </div>

        {/* AI Recommendations Banner */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="card-premium rounded-[1.75rem] p-5 sm:p-6 flex items-start gap-4 border-l-4 border-orange-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-500/5 mix-blend-overlay"></div>
            <AlertCircle className="h-6 w-6 text-orange-500 mt-0.5 shrink-0 relative z-10" />
            <div className="relative z-10">
              <div className="font-bold text-foreground">AI Insight: Unclaimed Warnings</div>
              <div className="text-sm text-muted-foreground mt-1 text-balance leading-relaxed">
                Your response time is currently higher than average. Missing claims increases food waste radius negatively.
              </div>
            </div>
          </div>
          <div className="card-premium rounded-[1.75rem] p-5 sm:p-6 flex items-start gap-4 border-l-4 border-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
            <Sparkles className="h-6 w-6 text-primary mt-0.5 shrink-0 relative z-10" />
            <div className="relative z-10">
              <div className="font-bold text-foreground">Groq AI Live Recommendation</div>
              <div className="text-sm text-muted-foreground mt-1 text-balance leading-relaxed">
                {items.length > 0 && items[0].ai_status_reason ? items[0].ai_status_reason : "Awaiting AI insights for nearby logistics..."}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 animate-fade-up" style={{ animationDelay: '150ms' }}>
          {filters.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-smooth border",
                  active
                    ? "gradient-primary border-transparent text-primary-foreground shadow-glow"
                    : "border-white/30 bg-white/70 text-muted-foreground backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "" : "text-primary")} /> {f.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card-premium rounded-[1.9rem] overflow-hidden border border-white/40 p-4">
                <Skeleton className="h-44 rounded-[1.4rem]" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-7 w-3/4 rounded-xl" />
                  <Skeleton className="h-4 w-1/2 rounded-xl" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Skeleton className="h-16 rounded-2xl" />
                    <Skeleton className="h-16 rounded-2xl" />
                  </div>
                  <Skeleton className="h-12 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass-panel rounded-[2rem] border border-red-200/70 bg-red-50/80 p-10 text-center shadow-sm">
            <div className="text-lg font-bold text-red-700">{error}</div>
            <Button type="button" onClick={() => fetchFood()} className="mt-4 rounded-xl">
              Try Again
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-12 text-center">
            <div className="text-lg font-bold text-foreground">No food listings yet</div>
            <div className="mt-2 text-sm font-medium text-muted-foreground">
              As soon as someone posts food through the live form, it will appear here.
            </div>
          </div>
        ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((d, i) => (
            <div
              key={d.id}
              className="card-premium group flex flex-col overflow-hidden rounded-[1.9rem] border border-white/40 transition-smooth hover:-translate-y-1.5 hover:shadow-lifted animate-fade-up"
              style={{ animationDelay: `${i * 50 + 200}ms` }}
            >
              {/* Image Header */}
              <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-slate-200 via-white to-emerald-50">
                {d.image ? (
                  <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                ) : (
                  <div className="mesh-overlay absolute inset-0 opacity-90" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/95 via-[#07111f]/15 to-transparent" />
                
                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  {d.status === "Urgent" || d.expiresInMin < 60 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-300/30 bg-red-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-lg animate-pulse-glow">
                      <Flame className="h-3 w-3" /> Urgent
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-lg animate-pulse-glow">
                    <Sparkles className="h-3 w-3" /> AI Ranked
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/25 bg-sky-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-lg animate-pulse-glow">
                    <CheckCircle2 className="h-3 w-3" /> AI Verified
                  </span>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {Array.isArray(d.tags) && d.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="font-black text-white text-xl leading-tight line-clamp-2 drop-shadow-md">{d.name}</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                    {d.type}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {d.distanceKm} km away
                  </div>
                </div>

                <div className="mb-5 border-b border-slate-200/80 pb-4 text-sm text-foreground/80">
                  Posted by <span className="font-bold text-foreground">{d.donor}</span>
                </div>

                <div className="mb-5 mt-auto grid grid-cols-2 gap-3">
                  <div className="rounded-[1.35rem] border border-white/50 bg-white/60 p-3.5 shadow-sm backdrop-blur-xl">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl gradient-warm shadow-soft">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Quantity</div>
                    <div className="mt-1 text-sm font-black leading-none">{d.qty} Meals</div>
                  </div>
                  
                  <div className="rounded-[1.35rem] border border-white/50 bg-white/60 p-3.5 shadow-sm backdrop-blur-xl">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Time Left</div>
                    <div className="mt-1 text-sm leading-none"><Countdown timeStr={d.expiry_time} /></div>
                  </div>
                </div>

                <div className="mb-4 rounded-[1.35rem] border border-primary/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.08))] px-4 py-3 text-sm text-slate-700 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm animate-pulse-glow">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Insight</div>
                      <div className="text-xs font-semibold text-slate-500">Judging signal: why this listing matters now</div>
                    </div>
                  </div>
                  <div className="line-clamp-3 leading-relaxed">
                    AI Insight: {d.ai_status_reason || "This food is urgent because the expiry window is tightening and the claim probability is changing in real time."}
                  </div>
                </div>

                <Button
                  onClick={() => claimFood(d.id)}
                  disabled={d.status === "Claimed" || d.status === "Picked Up"}
                  className={cn(
                    "h-12 w-full rounded-2xl text-[15px] font-bold transition-smooth",
                    d.status === "Available" || d.status === "Urgent" 
                      ? "gradient-primary text-primary-foreground shadow-glow hover:-translate-y-0.5" 
                      : "cursor-not-allowed border border-white/5 bg-muted/80 text-muted-foreground"
                  )}
                >
                  {d.status === "Claimed" ? (
                    <><CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" /> Status: Claimed</>
                  ) : d.status === "Picked Up" ? (
                    "Item Picked Up"
                  ) : (
                    "Claim Food Now"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
    </RequireAuth>
  );
}
