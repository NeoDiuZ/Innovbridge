'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token in localStorage
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          // Clear invalid token
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
  
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) return null;
  
    const data = await response.json();
    return data.user;
  };  

  const signUp = async ({ username, email, password, phoneNumber }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token
      localStorage.setItem('authToken', data.token);
      setUser(data.user);
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      
      // Set user in state
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    
    // Set a flag to indicate user just logged out
    localStorage.setItem('just_logged_out', 'true');
    
    // Clear the cookie by calling a logout endpoint
    await fetch('/api/auth/logout', { method: 'POST' });
    
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    signUp,
    signIn: login,
    login,
    signOut,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};