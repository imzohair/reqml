import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer, Marker } from '@react-google-maps/api';
import {
  MapPin, Truck, Clock, Navigation, User, Phone, CheckCircle2, Circle, Route as RouteIcon, Activity, Flame, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/tracking")({
  head: () => ({
    meta: [
      { title: "Live Logistics & Heatmaps — ResQMeal" },
      { name: "description", content: "Track food rescue deliveries in real time with optimized routing and demand heatmaps." },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  const [activeTab, setActiveTab] = useState<"live" | "heatmap">("live");

  const stages = [
    { label: "Donation listed", time: "10:24 AM", done: true },
    { label: "AI Pre-Match & Volunteer dispatched", time: "10:31 AM", done: true },
    { label: "Pickup completed", time: "10:48 AM", done: true },
    { label: "En route to NGO", time: "Now", done: false, active: true },
    { label: "Delivered", time: "ETA 11:00 AM", done: false },
  ];

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_KEY_HERE"
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const mockOrigin = { lat: 19.0760, lng: 72.8777 }; 
  const mockDestination = { lat: 19.0522, lng: 72.9005 };

  const directionsCallback = useCallback((result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (status === 'OK' && result) {
      setDirections(result);
    }
  }, []);

  return (
    <RequireAuth>
    <div className="px-6 lg:px-12 py-10 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-up">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-4 w-4" /> Operations Control
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mt-2">Logistics & Prediction</h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Real-time delivery routing and AI-driven demand heatmaps.
            </p>
          </div>
          
          <div className="p-1 glass rounded-xl inline-flex shadow-sm lg:ml-auto whitespace-nowrap overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("live")}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
                activeTab === "live" ? "bg-primary text-primary-foreground shadow-elegant" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Live Tracking
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              className={cn(
                "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                activeTab === "heatmap" ? "bg-orange-500 text-white shadow-glow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Flame className="h-4 w-4" /> Demand Heatmap
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Map Area */}
          <div className="lg:col-span-2 glass rounded-3xl p-2 shadow-elegant overflow-hidden animate-fade-up relative">
            
            {activeTab === "live" && (
              <div className="absolute top-6 left-6 z-20">
                <div className="glass gradient-primary text-white rounded-2xl p-4 shadow-glow flex flex-col gap-1 border border-white/20">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5 border-b border-white/10 pb-2 mb-1">
                    <Zap className="h-3.5 w-3.5" /> AI Route Optimizer
                  </div>
                  <div className="text-sm font-semibold leading-tight mt-1">Suggested fastest route isolated.</div>
                  <div className="text-2xl font-black tracking-tighter mt-1 drop-shadow-md">12 mins <span className="text-sm font-medium opacity-80">(Saved 8 mins)</span></div>
                </div>
              </div>
            )}

            {activeTab === "heatmap" && (
               <div className="absolute top-6 left-6 z-20">
                 <div className="glass bg-background/80 backdrop-blur-xl rounded-2xl p-4 shadow-card flex flex-col gap-3 border border-white/10">
                   <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Smart Demand Prediction</div>
                   <div className="flex items-center gap-3"><div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-background"></div> <span className="text-sm font-semibold">High Demand (Low Supply)</span></div>
                   <div className="flex items-center gap-3"><div className="w-3.5 h-3.5 rounded-full bg-orange-400 border border-background"></div> <span className="text-sm font-semibold">Medium Demand</span></div>
                   <div className="flex items-center gap-3"><div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-background"></div> <span className="text-sm font-semibold">Sufficient Supply</span></div>
                 </div>
               </div>
            )}

            <div className="relative h-[600px] rounded-[1.3rem] overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
              {/* Decorative Map Grid */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.15]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-foreground/50" transform="translate(20,20) scale(0.5)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {activeTab === "live" && isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mockOrigin}
                  zoom={12}
                  options={{
                    disableDefaultUI: true,
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                    ] // Simple dark theme
                  }}
                >
                  <Marker position={mockOrigin} label="Pickup" />
                  <Marker position={mockDestination} label="Dropoff" />
                  
                  {directions === null && (
                    <DirectionsService
                      options={{
                        destination: mockDestination,
                        origin: mockOrigin,
                        travelMode: 'DRIVING' as any
                      }}
                      callback={directionsCallback}
                    />
                  )}

                  {directions && (
                    <DirectionsRenderer
                      options={{
                        directions: directions,
                        suppressMarkers: true,
                        polylineOptions: {
                          strokeColor: "#10b981",
                          strokeWeight: 5
                        }
                      }}
                    />
                  )}
                </GoogleMap>
              ) : activeTab === "live" ? (
                 <div className="absolute inset-0 flex items-center justify-center font-bold text-muted-foreground">Loading Map...</div>
              ) : (
                <>
                  {/* Heatmap Overlays */}
                  <div className="absolute z-10 w-96 h-96 bg-red-500/25 rounded-full blur-[80px] mix-blend-multiply dark:mix-blend-screen" style={{ top: "10%", left: "10%" }}></div>
                  <div className="absolute z-10 w-80 h-80 bg-orange-400/25 rounded-full blur-[60px] mix-blend-multiply dark:mix-blend-screen" style={{ top: "40%", left: "50%" }}></div>
                  <div className="absolute z-10 w-[500px] h-[500px] bg-emerald-400/15 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" style={{ bottom: "-10%", right: "-10%" }}></div>
                  
                  {/* Faux map pins representing NGOs with varied needs */}
                  <div className="absolute z-20" style={{ top: "25%", left: "25%" }}>
                    <div className="relative group cursor-pointer">
                      <div className="w-5 h-5 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] border-2 border-background animate-pulse"></div>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 glass bg-black/90 text-white p-4 rounded-2xl text-xs z-30 pointer-events-none shadow-elegant border border-white/10">
                        <strong className="text-sm">Bandra West Cluster</strong><br/>
                        <div className="mt-1 pb-1 border-b border-white/10"><span className="text-red-400 font-bold">Critical Shortage:</span> 150 meals needed today.</div>
                        <div className="mt-1 text-white/70">High density of Active NGOs in this zone.</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute z-20" style={{ top: "55%", left: "65%" }}>
                    <div className="relative group cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)] border-2 border-background"></div>
                      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 glass bg-black/90 text-white p-4 rounded-2xl text-xs z-30 pointer-events-none shadow-elegant border border-white/10">
                        <strong className="text-sm">Andheri East Hub</strong><br/>
                        <div className="mt-1 pb-1 border-b border-white/10"><span className="text-orange-400 font-bold">Warming Up:</span> Supply dropping.</div>
                        <div className="mt-1 text-white/70">80 meals requested in last hour.</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass rounded-3xl p-6 shadow-elegant animate-fade-up border border-white/5 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/10 blur-2xl rounded-full"></div>
              
              <div className="flex items-center gap-4">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&q=80" alt="Driver" className="h-16 w-16 rounded-2xl object-cover shadow-sm border-2 border-background" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg leading-none mb-1">Rahul Kumar</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium"><User className="h-3.5 w-3.5 text-primary" /> Verified Volunteer</div>
                </div>
                <Button size="icon" className="rounded-xl glass bg-primary/5 text-primary hover:bg-primary/20 hover:scale-105 transition-smooth h-12 w-12 shadow-sm shrink-0">
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="rounded-2xl bg-background/50 p-3.5 text-center border border-white/5 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Pickup Time</div>
                  <div className="font-black text-foreground">10:48 AM</div>
                </div>
                <div className="rounded-2xl bg-background/50 p-3.5 text-center border border-white/5 shadow-sm">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Status</div>
                  <div className="font-black text-emerald-500">In Transit</div>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 shadow-elegant animate-fade-up border border-white/5" style={{ animationDelay: '100ms' }}>
              <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Delivery Timeline
              </h3>
              <ol className="space-y-5">
                {stages.map((s, i) => (
                  <li key={i} className="flex items-start gap-4 relative">
                    {/* Connecting line */}
                    {i !== stages.length - 1 && (
                      <div className={`absolute left-[11px] top-6 bottom-[-20px] w-[2px] ${s.done ? "bg-primary" : "bg-border/50"}`} />
                    )}
                    
                    <div className="mt-0.5 relative z-10 bg-background rounded-full">
                      {s.done ? (
                        <CheckCircle2 className="h-[22px] w-[22px] text-primary drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                      ) : s.active ? (
                        <div className="h-[22px] w-[22px] rounded-full gradient-primary animate-pulse shadow-glow border-2 border-background flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      ) : (
                        <div className="h-[22px] w-[22px] rounded-full border-2 border-muted-foreground/30 bg-muted/40" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className={cn(
                        "text-[15px] leading-tight mb-1.5",
                        s.active ? "font-bold text-foreground" : s.done ? "font-semibold text-foreground/80" : "font-medium text-muted-foreground"
                      )}>{s.label}</div>
                      <div className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        s.active ? "text-primary" : "text-muted-foreground/60"
                      )}>{s.time}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
