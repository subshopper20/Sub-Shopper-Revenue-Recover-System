import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { toast } from "sonner";
import { Phone, Eye, EyeSlash } from "@phosphor-icons/react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid credentials");
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      toast.success("Welcome to the demo!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Demo login failed. Please try again.");
    }
    setDemoLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center">
              <Phone size={24} weight="fill" className="text-white" />
            </div>
            <span className="text-xl font-bold text-green-800">SubShopper</span>
          </Link>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Welcome back</h1>
          <p className="text-gray-600 mb-8">Sign in to access your dashboard and manage your leads.</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all outline-none"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 pr-12 focus:border-green-800 focus:ring-1 focus:ring-green-800 transition-all outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-green-800 text-white rounded-full font-semibold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-gray-50 text-gray-500">or</span></div>
            </div>
            <button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full mt-6 h-12 border-2 border-yellow-500 text-green-800 rounded-full font-semibold hover:bg-yellow-50 transition-all flex items-center justify-center gap-2"
            >
              {demoLoading ? "Loading demo..." : "Try Demo Account"}
            </button>
          </div>
          <p className="mt-8 text-center text-gray-600">
            Don't have an account? <Link to="/signup" className="text-green-800 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;