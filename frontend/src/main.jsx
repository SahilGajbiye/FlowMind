import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import ProtectedRoute from "./components/ProtectedRoute";

// Import all pages and the main layout
import RootLayout from "./pages/RootLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WorkflowPage from "./pages/WorkflowPage";
import CanvasPage from "./pages/CanvasPage";
import ProfilePage from "./pages/ProfilePage"; // Import the new ProfilePage

// Define the application routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "workflow",
        element: (
          <ProtectedRoute>
            <WorkflowPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "workflow/:id",
        element: (
          <ProtectedRoute>
            <CanvasPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

// Note: AuthProvider is correctly placed in RootLayout.jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
