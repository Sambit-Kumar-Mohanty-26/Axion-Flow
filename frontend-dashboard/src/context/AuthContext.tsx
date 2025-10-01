import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserPayload {
  userId: string;
  factoryId: string;
  organizationId: string;
  role: 'ORG_ADMIN' | 'FACTORY_MANAGER' | 'WORKER';
  email: string;
}
interface AuthContextType {
  user: UserPayload | null;
  token: string | null;
  setAuthToken: (token: string) => void; 
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const decoded = jwtDecode<UserPayload>(storedToken);
        setUser(decoded);
        setToken(storedToken);
      }
    } catch (error) {
      localStorage.removeItem('token');
      console.error("Failed to decode token on initial load:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAuthToken = (newToken: string) => {
    try {
      const decoded = jwtDecode<UserPayload>(newToken);
      setUser(decoded);
      setToken(newToken);
      localStorage.setItem('token', newToken);
    } catch (error) {
      console.error("Failed to decode new token:", error);
      logout();
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!token;

  const value = { user, token, setAuthToken, logout, isAuthenticated, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};