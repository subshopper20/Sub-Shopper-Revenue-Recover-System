import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App.jsx";

const PricingPage = () => {
  const { isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const plans = [
    {
      name: "Starter",
      monthly: 349,
      annual: 3769,
      description: "I don't know how many leads I'm losing.",
      features: ["Call Capture System", "Missed Call Automation", "Lead Dashboard Basics", "30-Minute Training", "Tech Support"]
    },
    {
      name: "Growth",
      monthly: 649,
      annual: 7009,
      popular: true,
      description: "Why am I losing money and how much?",
      features: ["Transcription Engine", "Categorization", "Revenue Loss Estimation", "Missed Call Automation", "1 Optimization Call"]
    },
    {
      name: "Professional",
      monthly: 1299,
      annual: 14029,
      description: "How do I optimize and scale this system?",
      features: ["Website Integration", "CRM Sync Auto-Fill", "Custom Reporting Dash", "2 Strategy Calls mo.", "Priority Support"]
    }
  ];

  const getPrice = (plan) => billingPeriod === "annual" ? Math.round(plan.annual / 12) : plan.monthly;
  const getSavings = (plan) => Math.round((plan.monthly * 12) - plan.annual);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
              <span className="text-xl font-bold text-green-800">SubShopper</span>
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="bg-green-800 text-white px-6 py-2 rounded-full font-semibold">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-green-800 font-medium">Sign In</Link>
                  <Link to="/signup" className="bg-green-800 text-white hover:bg-green-700 px-6 py-2 rounded-full font-semibold transition-all">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-green-800 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-white/80 mb-8">Choose the plan that fits your business. All plans include a 14-day free trial.</p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white/10 rounded-full p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                billingPeriod === "monthly" ? "bg-white text-green-800" : "text-white hover:bg-white/10"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 ${
                billingPeriod === "annual" ? "bg-white text-green-800" : "text-white hover:bg-white/10"
              }`}
            >
              Annual
              <span className="bg-yellow-500 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">Save 10%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 py-20 -mt-10">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-green-800 text-white shadow-2xl scale-105 z-10"
                  : "bg-white border border-gray-200 shadow-md hover:shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-yellow-500 text-green-800 text-sm font-bold px-4 py-1.5 rounded-full">
                    ⭐ Recommended
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "text-white" : "text-green-800"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${plan.popular ? "text-yellow-500" : "text-green-800"}`}>
                    ${getPrice(plan)}
                  </span>
                  <span className={plan.popular ? "text-white/70" : "text-gray-500"}>/month</span>
                </div>
                {billingPeriod === "annual" && (
                  <p className={`text-sm mt-1 ${plan.popular ? "text-yellow-500" : "text-green-600"}`}>
                    Save ${getSavings(plan)}/year
                  </p>
                )}
              </div>

              <div className="mb-8">
                <p className={`text-sm font-semibold mb-4 ${plan.popular ? "text-white" : "text-gray-700"}`}>
                  What's Included:
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={plan.popular ? "text-yellow-500" : "text-green-500"}>✓</span>
                      <span className={plan.popular ? "text-white/90" : "text-gray-600"}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/signup"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5 ${
                  plan.popular
                    ? "bg-yellow-500 text-green-800 hover:bg-yellow-400"
                    : "bg-green-800 text-white hover:bg-green-700"
                }`}
              >
                Get Started →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-900 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-green-800 font-bold text-xl">S</div>
            <span className="text-xl font-bold text-white">SubShopper</span>
          </div>
          <p className="text-white/60 mb-4">Revenue Recovery System</p>
          <div className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Sub Shopper LLC. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;