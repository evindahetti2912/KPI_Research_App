import React, { createContext, useState, useContext, useEffect } from "react";

// Create context
const AuthContext = createContext(null);

// Hook for using the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for token in localStorage when component mounts
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");

        if (token) {
          // In a real app, validate the token with your API
          // For now, we'll just assume it's valid if it exists
          setIsAuthenticated(true);

          // You could fetch user data here
          setCurrentUser({
            id: "admin-user",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
          });
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setError("Failed to authenticate user");
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem("auth_token");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // In a real application, you would call your API here
      // For demo purposes, we'll use a mock login
      if (email === "admin@example.com" && password === "password") {
        const mockToken = "mock-jwt-token-" + Date.now();
        localStorage.setItem("auth_token", mockToken);

        setCurrentUser({
          id: "admin-user",
          name: "Admin User",
          email: email,
          role: "admin",
        });

        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("auth_token");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
