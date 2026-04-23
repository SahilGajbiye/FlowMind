import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext"; // 1. Import AuthProvider here

export default function RootLayout() {
  return (
    // 2. Wrap EVERYTHING inside RootLayout with AuthProvider.
    <AuthProvider>
      <div>
        <Navbar />
        <main>
          {/* 
            The <Outlet> is where React Router will render the correct page,
            like LoginPage or SignupPage. Because the Outlet is inside
            AuthProvider, the page it renders will also be inside.
          */}
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}
