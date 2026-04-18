import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearStoredSession, readStoredSession, storeSession, type AuthSession } from "@/lib/auth";

type AuthContextType = {
  user: AuthSession | null;
  isReady: boolean;
  login: (user: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isReady: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(readStoredSession());
    setIsReady(true);
  }, []);

  const login = (userData: AuthSession) => {
    setUser(userData);
    storeSession(userData);
  };

  const logout = () => {
    setUser(null);
    clearStoredSession();
  };

  return (
    <AuthContext.Provider value={{ user, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
