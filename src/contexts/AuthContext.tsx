
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For demo purposes, we'll use localStorage. In a real app, this would verify with a backend
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - in a real app, this would call an API
      const mockUser: User = {
        id: "user-123",
        email,
        name: email.split('@')[0],
        role: email.includes("admin") ? "admin" : "user",
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      // Redirect to dashboard or the page they were trying to access
      const origin = location.state?.from?.pathname || "/dashboard";
      navigate(origin);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Mock registration - in a real app, this would call an API
      const mockUser: User = {
        id: "user-" + Date.now(),
        email,
        name,
        role: "user",
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      navigate("/auth/verify");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
