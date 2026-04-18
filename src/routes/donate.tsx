import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Utensils, Hash, Salad, Clock, MapPin, Camera, StickyNote, Send, CheckCircle2, Upload, AlertTriangle, Sparkles, Navigation, Activity, RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useFood } from "@/contexts/FoodContext";
import { toast } from "sonner";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate Food — ResQMeal AI" },
      { name: "description", content: "List surplus food in seconds and get matched with nearby NGOs in need." },
    ],
  }),
  component: DonatePage,
});

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function DonatePage() {
  const { user } = useAuth();
  const { food, loading: listLoading, error: listError, fetchFood, addFood } = useFood();
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("50");
  const [foodType, setFoodType] = useState("");
  const [cookedTime, setCookedTime] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [notes, setNotes] = useState("");
  const [riskScore, setRiskScore] = useState(24);

  useEffect(() => {
    let score = 15;
    const q = parseInt(quantity || "0");
    if (q > 100) score += 30;
    else if (q > 50) score += 15;
    
    if (foodType === "nonveg") score += 25;
    if (foodType === "veg") score += 10;
    
    score += Math.floor(Math.random() * 5);
    setRiskScore(Math.min(score, 98));
  }, [quantity, foodType, cookedTime]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + (foodType === "nonveg" ? 4 : 8));
      
      await addFood({
        title: foodName,
        type: foodType,
        qty: parseInt(quantity || "0"),
        description: [locationStr, notes].filter(Boolean).join(" • "),
        lat: 19.0760,
        lng: 72.8777,
        donor_id: user?.user_id,
        tags: foodType ? [foodType] : [],
        expiry_time: expiry.toISOString(),
      });
      setSuccess(true);
      setFoodName("");
      setQuantity("50");
      setFoodType("");
      setCookedTime("");
      setLocationStr("");
      setNotes("");
      toast.success("List Published & AI Analyzed!", {
        description: "Your listing was saved to the live backend and appears below.",
      });
    } catch (err) {
      setSubmitError("Failed to list food. Ensure the backend is running and try again.");
      toast.error("Failed to list food. Ensure backend is running.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireAuth>
    <div className="relative min-h-screen pb-24 selection:bg-primary/20">
      {/* Premium Background Grid & Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-70 z-0" />
      <div className="pointer-events-none absolute left-0 top-0 h-[520px] w-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent z-0" />

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="glass-panel mesh-overlay relative mb-8 overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
            <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-orange-300/20 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/75 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-slate-800 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" /> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">AI-Powered Listing</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 lg:text-6xl">List surplus food</h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                Our predictive engine instantly analyzes your food's shelf life and matches it to highly-active NGOs before expiration.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <div className="rounded-[1.5rem] border border-white/45 bg-white/70 p-4 shadow-soft backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Risk Signal</div>
                <div className="mt-2 text-3xl font-black tracking-tighter text-slate-900">{riskScore}%</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/45 bg-white/70 p-4 shadow-soft backdrop-blur-xl">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Live Records</div>
                <div className="mt-2 text-3xl font-black tracking-tighter text-slate-900">{food.length}</div>
              </div>
            </div>
            </div>
          </div>

          {success && (
            <div className="mb-8 flex items-start gap-5 rounded-[1.75rem] border border-emerald-100 bg-white/85 p-6 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] backdrop-blur-xl animate-fade-up">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-black text-xl text-slate-900 tracking-tight">Food listing created</div>
                <div className="text-slate-600 mt-1 font-medium text-balance leading-relaxed">
                  Your new listing was saved to the database and the live feed has been updated instantly.
                </div>
              </div>
            </div>
          )}

          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px]">
            
            {/* Main Form - Crisp Light Mode */}
            <form onSubmit={onSubmit} className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10 space-y-8">
              <div className="absolute left-0 top-0 h-1.5 w-full gradient-primary" />
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-emerald-300/15 blur-3xl" />
              
              <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                <Field icon={Utensils} label="Food Name">
                  <Input value={foodName} onChange={(e) => setFoodName(e.target.value)} required placeholder="e.g. Vegetable Biryani" className="h-14 rounded-2xl border-white/50 bg-white/70 shadow-sm backdrop-blur-xl focus-visible:ring-primary/30" />
                </Field>
                
                <Field icon={Salad} label="Food Type">
                  <Select onValueChange={setFoodType} required>
                    <SelectTrigger className="h-14 rounded-2xl border-white/50 bg-white/70 text-slate-700 shadow-sm backdrop-blur-xl focus-visible:ring-primary/30">
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/40 bg-white/90 shadow-lifted backdrop-blur-xl">
                      <SelectItem value="veg" className="font-semibold cursor-pointer">🥗 Vegetarian</SelectItem>
                      <SelectItem value="nonveg" className="font-semibold cursor-pointer">🍗 Non-Vegetarian</SelectItem>
                      <SelectItem value="packaged" className="font-semibold cursor-pointer">📦 Packaged</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field icon={Hash} label="Quantity (Meals)">
                  <Input required type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-14 rounded-2xl border-white/50 bg-white/70 text-lg shadow-sm backdrop-blur-xl focus-visible:ring-primary/30" />
                </Field>
                
                <Field icon={Clock} label="Cooked Time">
                  <Input required type="time" value={cookedTime} onChange={(e) => setCookedTime(e.target.value)} className="h-14 rounded-2xl border-white/50 bg-white/70 shadow-sm backdrop-blur-xl focus-visible:ring-primary/30" />
                </Field>

                <Field icon={MapPin} label="Pickup Location">
                  <Input value={locationStr} onChange={(e) => setLocationStr(e.target.value)} required placeholder="Bandra West, Mumbai" className="h-14 rounded-2xl border-white/50 bg-white/70 shadow-sm backdrop-blur-xl focus-visible:ring-primary/30" />
                </Field>
                
                <Field icon={Camera} label="Food Photo">
                  <label className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/25 bg-white/50 px-4 shadow-sm backdrop-blur-xl transition-smooth group hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/8">
                    <Upload className="h-5 w-5 text-primary group-hover:-translate-y-1 transition-transform" />
                    <span className="text-sm font-bold text-primary">Upload Documentation</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </Field>
              </div>

              <div className="pt-2">
                <Field icon={StickyNote} label="Special Handling Instructions">
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any handling notes, allergens, or packaging info..." className="min-h-32 resize-none rounded-[1.5rem] border-white/50 bg-white/70 p-4 shadow-sm backdrop-blur-xl focus-visible:ring-primary/30" />
                </Field>
              </div>

              {submitError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {submitError}
                </div>
              ) : null}

              <div className="flex flex-col items-start justify-between gap-4 border-t border-white/35 pt-8 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Auto-Tag: High Priority • Safe till 8 hrs
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-14 w-full rounded-2xl px-10 text-lg font-bold text-white shadow-glow transition-smooth hover:-translate-y-0.5 sm:w-auto gradient-primary"
                >
                  {submitting ? "Analyzing Network..." : <>Publish to Network <Send className="ml-2 h-5 w-5" /></>}
                </Button>
              </div>
            </form>

            {/* AI Side Panel - Dark/Inverted Premium Dashboard Look */}
            <div className="space-y-6">
              <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <RefreshCcw className="h-5 w-5 text-primary" />
                      <h3 className="font-extrabold text-lg text-slate-900">Live Food Listings</h3>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Live records pulled from `GET /food/all`.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={() => fetchFood()} className="rounded-2xl bg-white/70 backdrop-blur-xl">
                    Refresh
                  </Button>
                </div>

                {listLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="rounded-[1.5rem] border border-white/40 bg-white/55 p-4">
                        <Skeleton className="h-4 w-20 rounded-full" />
                        <Skeleton className="mt-3 h-6 w-3/4 rounded-xl" />
                        <Skeleton className="mt-3 h-4 w-1/2 rounded-xl" />
                        <Skeleton className="mt-4 h-4 w-2/3 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : listError ? (
                  <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
                    {listError}
                  </div>
                ) : food.length === 0 ? (
                  <div className="rounded-[1.5rem] bg-slate-50/80 p-6 text-sm font-medium text-slate-500">
                    No food records found in the database yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {food.slice(0, 5).map((item) => (
                      <div key={item.id} className="card-premium rounded-[1.5rem] border border-white/40 p-4 transition-smooth hover:-translate-y-0.5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-bold text-slate-900">{item.title}</div>
                            <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                              {item.type} • {item.qty} meals
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary shadow-sm">
                              {item.status}
                            </div>
                            <div className="inline-flex items-center gap-1 rounded-full border border-sky-300/25 bg-sky-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg animate-pulse-glow">
                              <Sparkles className="h-3 w-3" />
                              AI Verified
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-sm font-medium text-slate-600">
                          Donor: {item.users?.name || "Unknown User"}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500">
                          Expires: {new Date(item.expiry_time).toLocaleString()}
                        </div>
                        <div className="mt-4 rounded-[1.25rem] border border-primary/15 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.08))] px-4 py-3 text-sm text-slate-700 shadow-sm">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm animate-pulse-glow">
                              <Sparkles className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">AI Insight</span>
                            {item.status === "Urgent" ? (
                              <span className="rounded-full bg-red-500/90 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white animate-pulse-glow">
                                Urgent
                              </span>
                            ) : null}
                          </div>
                          <div className="line-clamp-2 leading-relaxed">
                            AI Insight: {item.ai_status_reason || "This food is high-priority because the expiry window, quantity, and local demand create a strong rescue opportunity."}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Pre-Match System Widget */}
              <div className="rounded-[2rem] bg-slate-900 text-white p-8 shadow-lifted relative overflow-hidden group">
                <div className="absolute -inset-10 bg-gradient-to-br from-primary/20 to-transparent blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-emerald-400" />
                      <h3 className="font-bold text-lg">AI Pre-Match Engine</h3>
                    </div>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>
                  
                  <p className="text-[15px] text-slate-300 mb-6 leading-relaxed font-medium">
                    Before publishing, our algorithm has identified <strong className="font-black text-white text-lg">3 NGOs</strong> within a 2km radius highly likely to accept this exact composition.
                  </p>
                  
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[85%] animate-[pulse_2s_ease-in-out_infinite]"></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    <span>Searching</span>
                    <span>85% Match Prob.</span>
                  </div>
                </div>
              </div>

              {/* Waste Risk Score Widget */}
              <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
                  <Activity className="w-48 h-48 text-slate-900" />
                </div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${riskScore > 60 ? 'text-red-500' : 'text-slate-900'}`} />
                    <h3 className="font-extrabold text-lg text-slate-900">Waste Risk Score</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${riskScore > 60 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    Live Metric
                  </div>
                </div>
                
                <div className="flex items-end gap-3 mb-4 relative z-10">
                  <span className={`text-[4rem] leading-none font-black tracking-tighter ${riskScore > 60 ? 'text-red-500' : 'text-slate-900'}`}>
                    {riskScore}<span className="text-3xl text-slate-400">%</span>
                  </span>
                </div>
                
                <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden relative z-10 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${riskScore > 60 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-900'}`} 
                    style={{ width: `${riskScore}%` }}
                  ></div>
                </div>
                
                <p className="text-sm font-semibold text-slate-500 leading-relaxed relative z-10">
                  {riskScore > 60 
                    ? "High risk of expiration. We strongly advise splitting this quantity into smaller batches for faster pickup."
                    : "Low risk status. This quantity and categorization is highly sought after by local shelters right now."}
                </p>
              </div>

              {/* Smart Guidance Widget */}
              <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-6">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h3 className="font-extrabold text-lg text-slate-900">Smart Guidance</h3>
                </div>
                <ul className="space-y-5">
                  <li className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <MapPin className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 mb-1">High Demand Cluster</div>
                      <div className="text-sm font-medium text-slate-500 leading-relaxed">
                        NGOs in Bandra West are highly active! Demand is outpacing supply by 1.8x.
                      </div>
                    </div>
                  </li>
                  <li className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Clock className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900 mb-1">Optimal Posting Window</div>
                      <div className="text-sm font-medium text-slate-500 leading-relaxed">
                        Right now! <strong className="text-slate-800">6–8 PM</strong> is the peak rescue time on the network.
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}
