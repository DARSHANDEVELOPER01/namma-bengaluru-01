import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, portalRole: Role) => Promise<{ success: boolean; error?: string }>;
  registerCitizen: (data: {
    name: string;
    email: string;
    phone: string;
    ward: string;
    upiId: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  quickLoginDemo: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('namma_blr_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('namma_blr_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('namma_blr_token');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('Session verify failed:', err);
        // Fallback: don't crash
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string, portalRole: Role) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, portalRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('namma_blr_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error connecting to Bengaluru Smart City server' };
    }
  };

  const registerCitizen = async (data: {
    name: string;
    email: string;
    phone: string;
    ward: string;
    upiId: string;
    password: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registration failed' };
      }

      setUser(resData.user);
      setToken(resData.token);
      localStorage.setItem('namma_blr_token', resData.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during citizen registration' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('namma_blr_token');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, ...data }),
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const quickLoginDemo = async (role: Role) => {
    if (role === 'admin') {
      await login('darshankr2026@gmail.com', 'DARSHAN@123', 'admin');
    } else if (role === 'citizen') {
      await login('citizen.darshan@gmail.com', 'Citizen@123', 'citizen');
    } else if (role === 'staff') {
      await login('staff.rajesh@bbmp.gov.in', 'Staff@123', 'staff');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        registerCitizen,
        logout,
        updateUserProfile,
        quickLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
