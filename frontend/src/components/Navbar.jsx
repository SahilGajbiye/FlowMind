import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User } from "lucide-react"; // Import the icon
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="px-4 py-4 bg-brand-dark">
      <nav className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo and Brand Name */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="FlowMind Logo" className="w-auto h-8" />
          <p className="text-2xl font-bold text-white">
            Flow<span className="text-primary">Mind</span>
          </p>
        </Link>

        {/* Conditional Buttons */}
        <div className="flex items-center gap-4 font-bold">
          {user ? (
            // If user is logged in:
            <>
              {/* Clickable Profile Icon */}
              <Link
                to="/profile"
                className="p-2 transition-colors rounded-full hover:bg-stroke"
                title="View Profile"
              >
                <User className="text-slate-300" />
              </Link>
              <button
                onClick={logout}
                className="px-6 py-2 text-white transition-colors border-2 rounded-lg border-stroke hover:bg-stroke"
              >
                Logout
              </button>
            </>
          ) : (
            // If user is logged out:
            <>
              <Link
                to="/login"
                className="px-6 py-2 text-white transition-colors border-2 rounded-lg border-stroke hover:bg-stroke"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 transition-colors bg-white rounded-lg text-brand-dark hover:bg-slate-200"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
