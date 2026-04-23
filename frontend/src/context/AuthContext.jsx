// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api"; // Import our API functions

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    // On initial load, try to get tokens from localStorage
    const savedTokens = localStorage.getItem("authTokens");
    return savedTokens ? JSON.parse(savedTokens) : null;
  });
  const navigate = useNavigate();

  // If we have tokens on initial load, try to set the user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (tokens && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []); // The empty dependency array means this runs only once on mount

  // --- Core Functions ---

  const handleLogin = async (credentials) => {
    try {
      const response = await loginUser(credentials);
      localStorage.setItem("token", response.data.access_token);
      const { access_token, refresh_token, user } = response.data;

      const newTokens = { access: access_token, refresh: refresh_token };
      setTokens(newTokens);
      setUser(user);

      // Store in localStorage to persist login across page refreshes
      localStorage.setItem("authTokens", JSON.stringify(newTokens));
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login successful, navigating to /workflow");
      navigate("/workflow"); // Redirect user to the main app page
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message,
      );
      alert("Login failed. Please check your username and password.");
    }
  };

  const handleSignup = async (userData) => {
    try {
      console.log(userData);
      const response = await registerUser(userData);
      const { access_token, refresh_token, user } = response.data;

      const newTokens = { access: access_token, refresh: refresh_token };
      setTokens(newTokens);
      setUser(user);

      localStorage.setItem("authTokens", JSON.stringify(newTokens));
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Signup successful, navigating to /workflow");
      navigate("/workflow"); // Redirect user to the main app page
    } catch (error) {
      console.error(
        "Signup failed:",
        error.response?.data?.message || error.message,
      );
      alert("Signup failed. Please try again.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // The value that will be available to all children components
  const value = {
    user,
    tokens,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};
