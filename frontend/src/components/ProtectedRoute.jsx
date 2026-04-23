// src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  // 1. Get the entire auth object from the context.
  const auth = useAuth();

  // 2. Check if the context is still loading or not available.
  //    This can happen on the very first render.
  //    In this case, we don't know if the user is logged in, so we can't show the page.
  //    Redirecting to login is the safest default.
  if (!auth) {
    // This case might happen if the provider hasn't mounted yet.
    // A loading spinner could also go here, but redirecting is safe.
    return <Navigate to="/login" />;
  }

  // 3. Now that we know 'auth' exists, we can safely access its 'tokens' property.
  const { tokens } = auth;

  // 4. Check if the tokens themselves are present.
  if (!tokens) {
    // If the auth context is loaded but there are no tokens, the user is not logged in.
    return <Navigate to="/login" />;
  }

  // 5. If everything is fine, render the actual page component.
  return children;
};

export default ProtectedRoute;
