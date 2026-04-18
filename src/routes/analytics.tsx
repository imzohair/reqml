import { createFileRoute } from "@tanstack/react-router";
import {
  Utensils,
  Trash2,
  Cloud,
  Truck,
  TrendingUp,
  TrendingDown,
  BrainCircuit,
  Trophy,
  Award,
  AlertTriangle,
  FileQuestion,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { RequireAuth } from "@/components/RequireAuth";
import { useFood } from "@/contexts/FoodContext";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Impact & Intelligence — ResQMeal" },
      { name: "description", content: "Track meals saved, AI insights, and leaderboard." },
    ],
  }),
  component: Analytics,
});

const monthly = [
  { m: "Jan", meals: 4200, waste: 1100 },
  { m: "Feb", meals: 5100, waste: 1320 },
  { m: "Mar", meals: 6300, waste: 1680 },
  { m: "Apr", meals: 7200, waste: 1900 },
  { m: "May", meals: 8400, waste: 2240 },
  { m: "Jun", meals: 9800, waste: 2620 },
  { m: "Jul", meals: 11200, waste: 2980 },
  { m: "Aug", meals: 12540, waste: 3340 },
];

const co2 = [
  { d: "Mon", v: 180 },
  { d: "Tue", v: 220 },
  { d: "Wed", v: 260 },
  { d: "Thu", v: 240 },
  { d: "Fri", v: 320 },
  { d: "Sat", v: 380 },
  { d: "Sun", v: 290 },
];

const types = [
  { name: "Vegetarian", value: 58, color: "oklch(0.62 0.17 145)" },
  { name: "Non-Veg", value: 22, color: "oklch(0.78 0.16 70)" },
  { name: "Packaged", value: 20, color: "oklch(0.6 0.18 240)" },
];

function KPI({ icon: Icon, label, value, delta, positive = true }: any) {
  return (
    <div className="glass rounded-3xl p-6 shadow-elegant hover:shadow-glow hover:-translate-y-1 transition-smooth border border-white/5 relative overflow-hidden">
      <div className="flex items-start justify-between relative z-10">
        <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
          <Icon className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${positive ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {delta}
        </div>
      </div>
      <div className="mt-5 text-3xl font-black tracking-tighter relative z-10">{value}</div>
      <div className="text-sm font-semibold text-muted-foreground mt-1 relative z-10">{label}</div>
    </div>
  );
}

function Analytics() {
  const { food, loading, error } = useFood();

  let mealsSaved = 0;
  let activeListings = 0;
  let tVeg = 0;
  let tNon = 0;
  let tPack = 0;

  food.forEach((d) => {
    if (d.status === "Claimed" || d.status === "Picked Up") {
      mealsSaved += d.qty;
    }
    if (d.status === "Available" || d.status === "Urgent") {
      activeListings += 1;
    }
    if (d.type === "veg") tVeg += d.qty;
    else if (d.type === "nonveg") tNon += d.qty;
    else tPack += d.qty;
  });

  if (tVeg === 0 && tNon === 0 && tPack === 0) {
    tVeg = 1;
    tNon = 1;
    tPack = 1;
  }

  const wasteReducedKg = Math.round(mealsSaved * 0.4);
  const stats = {
    mealsSaved,
    wasteReducedKg,
    activeListings,
    types: [
      { name: "Vegetarian", value: tVeg, color: "oklch(0.62 0.17 145)" },
      { name: "Non-Veg", value: tNon, color: "oklch(0.78 0.16 70)" },
      { name: "Packaged", value: tPack, color: "oklch(0.6 0.18 240)" },
    ],
  };

  return (
    <RequireAuth>
    <div className="px-6 lg:px-12 py-10 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <div className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" /> AI Diagnostics & Impact
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mt-2">Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Real-time analytics, ResQ scores, and AI insights across the network.
          </p>
        </div>

        {loading ? (
          <div className="mb-8 rounded-3xl border border-border/50 bg-background/70 p-8 text-center shadow-sm">
            <div className="text-lg font-bold text-foreground">Loading shared food data...</div>
            <div className="mt-2 text-sm font-medium text-muted-foreground">Analytics will update as soon as the global food state is ready.</div>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mb-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <div className="text-lg font-bold text-red-700">{error}</div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-fade-up">
          <KPI icon={Utensils} label="Total Meals Saved (Live)" value={stats.mealsSaved.toLocaleString()} delta="+Now" />
          <KPI icon={Trash2} label="Food Waste Reduced (Live)" value={`${stats.wasteReducedKg.toLocaleString()} kg`} delta="+Now" />
          <KPI icon={Cloud} label="CO₂ Prevented" value={`${(stats.wasteReducedKg * 2.5).toLocaleString()} tons`} delta="+Now" />
          <KPI icon={Truck} label="Active Listings" value={stats.activeListings.toLocaleString()} delta="+Now" positive={true} />
        </div>

        {/* AI INSIGHTS & LEADERBOARD ROW */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
          
          {/* Expiry Intelligence Engine */}
          <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-elegant border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
            
            <div className="relative z-10 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="h-5 w-5 text-orange-500" />
                <h3 className="font-bold text-lg text-foreground">Expiry Intelligence Engine</h3>
              </div>
              <p className="text-xs font-medium text-muted-foreground">AI analysis of why 12% of food went unclaimed last week.</p>
            </div>
            
            <div className="relative z-10 grid sm:grid-cols-3 gap-4">
              <div className="bg-background/40 rounded-2xl p-4 border border-white/10 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <div className="flex items-center gap-2 mb-2 text-muted-foreground"><AlertTriangle className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Distance</span></div>
                <div className="text-2xl font-black text-foreground">45%</div>
                <div className="text-xs font-semibold text-muted-foreground mt-1">Found &gt;8km from nearest available NGO.</div>
              </div>
              <div className="bg-background/40 rounded-2xl p-4 border border-white/10 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400"></div>
                <div className="flex items-center gap-2 mb-2 text-muted-foreground"><Clock className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Timing</span></div>
                <div className="text-2xl font-black text-foreground">35%</div>
                <div className="text-xs font-semibold text-muted-foreground mt-1">Posted between 11PM-6AM. Low visibility.</div>
              </div>
              <div className="bg-background/40 rounded-2xl p-4 border border-white/10 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                <div className="flex items-center gap-2 mb-2 text-muted-foreground"><FileQuestion className="h-4 w-4" /> <span className="text-xs font-bold uppercase tracking-wider">Quantity</span></div>
                <div className="text-2xl font-black text-foreground">20%</div>
                <div className="text-xs font-semibold text-muted-foreground mt-1">Quantity too large for single pickup.</div>
              </div>
            </div>
          </div>

          {/* ResQ Score Leaderboard */}
          <div className="glass rounded-3xl p-6 shadow-elegant border border-primary/20 relative overflow-hidden">
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
             
             <div className="flex items-center justify-between mb-6 relative z-10">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <Trophy className="h-5 w-5 text-primary" />
                   <h3 className="font-bold text-lg">ResQ Score</h3>
                 </div>
                 <p className="text-xs font-medium text-muted-foreground">Top Donors This Week</p>
               </div>
               <Award className="h-8 w-8 text-primary/40" />
             </div>

             <div className="space-y-4 relative z-10">
               <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-2xl p-3">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-black flex items-center justify-center text-sm shadow-glow">1</div>
                   <div className="font-bold text-sm">Saffron Restaurant</div>
                 </div>
                 <div className="text-primary font-black">9,420 <span className="text-[10px] uppercase font-bold tracking-wider">Pts</span></div>
               </div>
               <div className="flex items-center justify-between bg-background/50 rounded-2xl p-3 border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-muted-foreground/20 text-muted-foreground font-bold flex items-center justify-center text-sm">2</div>
                   <div className="font-semibold text-sm">Cafe Mocha</div>
                 </div>
                 <div className="text-foreground font-bold">8,100 <span className="text-[10px] text-muted-foreground">Pts</span></div>
               </div>
               <div className="flex items-center justify-between bg-background/50 rounded-2xl p-3 border border-white/5">
                 <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-muted-foreground/20 text-muted-foreground font-bold flex items-center justify-center text-sm">3</div>
                   <div className="font-semibold text-sm">Sunrise Bakery</div>
                 </div>
                 <div className="text-foreground font-bold">7,850 <span className="text-[10px] text-muted-foreground">Pts</span></div>
               </div>
             </div>
          </div>
          
        </div>

        {/* Existing Charts Grid */}
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <div className="lg:col-span-2 glass rounded-3xl p-6 shadow-elegant border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Meals saved vs. Waste reduced</h3>
                <p className="text-xs font-semibold text-muted-foreground">Last 8 months trends</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.62_0.17_145)] shadow-sm" /> Meals Saved</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.78_0.16_70)] shadow-sm" /> Waste (kg)</span>
              </div>
            </div>
            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 145)" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="m" stroke="oklch(0.5 0.03 260)" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.5 0.03 260)" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'oklch(0.95 0.02 240 / 0.5)'}} contentStyle={{ borderRadius: 16, border: "1px solid oklch(0.92 0.01 145)", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)", fontWeight: "bold" }} />
                  <Bar dataKey="meals" fill="oklch(0.62 0.17 145)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="waste" fill="oklch(0.78 0.16 70)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 shadow-elegant border border-white/5 flex flex-col">
            <h3 className="font-bold text-lg">Donations by Type</h3>
            <p className="text-xs font-semibold text-muted-foreground">Current month distribution</p>
            <div className="h-64 flex-1 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.types} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} stroke="none">
                    {stats.types.map((t, i) => <Cell key={i} fill={t.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)", fontWeight: "bold" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
    </RequireAuth>
  );
}
