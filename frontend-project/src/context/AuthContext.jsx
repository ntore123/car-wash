import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getCurrentUser();
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (err) {
        // User is not logged in, that's okay
        console.log('User not authenticated', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(username, password);

      if (response.data.success) {
        setUser(response.data.data);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.changePassword(currentPassword, newPassword);

      if (response.data.success) {
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
