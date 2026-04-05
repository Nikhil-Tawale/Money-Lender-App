import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";
import { AuthContextType } from "../types";
import { dataService } from "../services/DataServiceFactory";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const loadSession = async () => {
      const userData = await dataService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setToken(userData.token);
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await dataService.login(email, password);
      if (!data.success) {
        toast.error(data?.error || "Login failed");
        return { success: false, error: data.error };
      }
      const userData = data.userData;
      setUser(userData);
      setToken(userData.token);
      toast.success("Login successful!");
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
      return { success: false, error: error.message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await dataService.register(name, email, password);
      if (!data.success) {
        toast.error(data?.error || "Registration failed");
        return { success: false, error: data.error };
      }
      const userData = (data as any).userData;
      await dataService.setCurrentUser(userData);
      setUser(userData);
      setToken(userData.token);
      toast.success("Registration successful!");
      return { success: true };
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await dataService.clearCurrentUser();
    setUser(null);
    setToken(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
