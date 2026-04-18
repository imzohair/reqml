import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export type FoodItem = {
  id: string;
  title: string;
  description?: string;
  qty: number;
  type: string;
  expiry_time: string;
  donor_id: string;
  lat?: number;
  lng?: number;
  tags?: string[];
  image?: string;
  status: "Urgent" | "Available" | "Claimed" | "Picked Up" | "Expired";
  ai_status_reason?: string;
  created_at?: string;
  users?: {
    name?: string;
  };
};

type CreateFoodInput = {
  title: string;
  description?: string;
  qty: number;
  type: string;
  expiry_time: string;
  donor_id?: string;
  lat: number;
  lng: number;
  tags?: string[];
  image?: string;
  is_urgent?: boolean;
};

type FoodContextType = {
  food: FoodItem[];
  loading: boolean;
  error: string;
  hasLoaded: boolean;
  fetchFood: (options?: { silent?: boolean }) => Promise<void>;
  addFood: (input: CreateFoodInput) => Promise<FoodItem>;
};

const FoodContext = createContext<FoodContextType>({
  food: [],
  loading: false,
  error: "",
  hasLoaded: false,
  fetchFood: async () => {},
  addFood: async () => {
    throw new Error("FoodContext not initialized");
  },
});

export function FoodProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [food, setFood] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchFood = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    setError("");

    try {
      const { data } = await api.get("/food/all");
      setFood(data);
      setHasLoaded(true);
    } catch (err) {
      console.error("Failed to fetch food", err);
      setError("We couldn't load food listings from the backend.");
      setHasLoaded(true);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const addFood = async (input: CreateFoodInput) => {
    const { data } = await api.post("/food/create", input);
    const nextItem: FoodItem = {
      ...data,
      users: data.users ?? { name: user?.name || "Unknown User" },
    };
    setFood((current) => [nextItem, ...current]);
    return nextItem;
  };

  useEffect(() => {
    fetchFood();
  }, []);

  return (
    <FoodContext.Provider value={{ food, loading, error, hasLoaded, fetchFood, addFood }}>
      {children}
    </FoodContext.Provider>
  );
}

export function useFood() {
  return useContext(FoodContext);
}
