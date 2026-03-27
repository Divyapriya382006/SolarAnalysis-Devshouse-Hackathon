import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type Role = 'customer' | 'seller' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  login: (type: 'customer' | 'seller') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('sunwise_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (type: 'customer' | 'seller') => {
    // Hardcoded credentials for simulation as requested
    const mockUser: User = type === 'customer' 
      ? { id: 'c1', name: 'Raj Kumar', email: 'raj@example.com', role: 'customer' }
      : { id: 's1', name: 'Tata Power Solar', email: 'sales@tatasolar.com', role: 'seller' };
    
    setUser(mockUser);
    localStorage.setItem('sunwise_user', JSON.stringify(mockUser));
    
    // Redirect based on role
    if (type === 'seller') {
      navigate('/seller-dashboard');
    } else {
      navigate('/');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sunwise_user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, login, logout }}>
      {children}
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
