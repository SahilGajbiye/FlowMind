// src/pages/LoginPage.jsx

import { Link } from "react-router-dom";
import { useState } from "react"; // 1. Import useState
import { useAuth } from "../context/AuthContext"; // 2. Import our auth hook
import logo from "../assets/logo.png";

export default function LoginPage() {
  // 3. Create state variables for the form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth(); // 4. Get the login function from our context

  // 5. Create a function to handle form submission
  const handleSubmit = (event) => {
    event.preventDefault(); // Stop the browser from reloading
    // Call the login function from the context
    login({ username, password });
  };

  return (
    <div className="flex flex-col justify-center flex-1 min-h-full px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="w-auto h-12 mx-auto" src={logo} alt="FlowMind Logo" />
        <h1 className="text-2xl font-semibold text-center">
          Flow<span className="text-primary">Mind</span>
        </h1>
        <h2 className="mt-6 text-3xl font-bold leading-9 tracking-tight text-center text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* 6. Update the <form> tag to use our handleSubmit function */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium leading-6 text-slate-300"
            >
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username} // 7. Connect input value to state
                onChange={(e) => setUsername(e.target.value)} // 8. Update state on change
                className="block w-full px-3 py-2 text-white border-0 rounded-md shadow-sm bg-white/5 ring-1 ring-inset ring-stroke focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-slate-300"
              >
                Password
              </label>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-thin text-accent hover:text-opacity-80 text-primary "
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password} // Connect input value to state
                onChange={(e) => setPassword(e.target.value)} // Update state on change
                className="block w-full px-3 py-2 text-white border-0 rounded-md shadow-sm bg-white/5 ring-1 ring-inset ring-stroke focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex justify-center w-full px-3 py-2 text-sm font-semibold leading-6 text-black transition-colors rounded-md shadow-sm bg-primary bg-accent hover:bg-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-10 text-sm text-center text-slate-400">
          Not a member?{" "}
          <Link
            to="/signup"
            className="font-semibold leading-6 transition-colors text-accent hover:text-opacity-80 text-primary"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
