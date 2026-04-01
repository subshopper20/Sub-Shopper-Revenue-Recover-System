import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App.jsx";
import { toast } from "sonner";
import { Phone, Eye, EyeSlash } from "@phosphor-icons/react";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ fullName: "", businessName: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.businessName || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.businessName, formData.fullName);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create account");
    }
    setLoading(false);
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
          <h1 className="text-3xl font-bold text-green-800 mb-2">Create your account</h1>
          <p className="text-gray-600 mb-8">Start your 14-day free trial. No credit card required.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none" placeholder="John Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none" placeholder="Smith Lawn Care" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full h-12 rounded-lg border border-gray-300 px-4 pr-12 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none" placeholder="Create a password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:border-green-800 focus:ring-1 focus:ring-green-800 outline-none" placeholder="Confirm your password" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-green-800 text-white rounded-full font-semibold hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">{loading ? "Creating account..." : "Create Account"}</button>
          </form>
          <p className="mt-6 text-center text-gray-600">Already have an account? <Link to="/login" className="text-green-800 font-semibold hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;