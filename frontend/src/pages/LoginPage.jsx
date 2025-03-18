import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the path the user was trying to access
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    try {
      const success = await login(email, password);

      if (success) {
        // Redirect to the page they were trying to access
        navigate(from, { replace: true });
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            KPI Allocation System
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Sign in to your account
          </p>
        </div>

        <Card>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 rounded bg-red-50">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="relative w-full group"
              >
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </Button>
            </div>

            <div className="text-sm text-center">
              <p className="text-gray-600">
                Demo credentials: admin@example.com / password
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
