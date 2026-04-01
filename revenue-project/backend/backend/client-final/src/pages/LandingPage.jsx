import { Link } from "react-router-dom";
import { useAuth } from "../App.jsx";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { emoji: "📞", title: "Call Capture", description: "Never miss a lead. Capture every call and voicemail automatically." },
    { emoji: "💰", title: "Revenue Tracking", description: "See exactly how much revenue you're recovering in real-time." },
    { emoji: "🤖", title: "AI Transcription", description: "Automatically transcribe voicemails and extract lead information." },
    { emoji: "📊", title: "Lead Management", description: "Track every lead from first contact to completed job." }
  ];

  const industries = ["🌿 Lawn Care", "🔧 Plumbing", "❄️ HVAC", "🌳 Tree Service", "🏠 Home Repair", "💻 IT Services"];

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
            <div className="hidden md:flex items-center gap-8">
              <Link to="/pricing" className="text-gray-600 hover:text-green-800 transition-colors font-medium">Pricing</Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="bg-green-800 text-white hover:bg-green-700 rounded-full px-6 py-2.5 font-semibold">Dashboard</Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-600 hover:text-green-800 transition-colors font-medium">Sign In</Link>
                  <Link to="/signup" className="bg-green-800 text-white hover:bg-green-700 rounded-full px-6 py-2.5 font-semibold">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-green-800 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block bg-yellow-500 text-green-800 text-sm font-bold px-4 py-1.5 rounded-full mb-6">Revenue Recovery System</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
            Stop Losing Money on <span className="text-yellow-500">Missed Calls</span>
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Every missed call is lost revenue. Our AI-powered system captures, transcribes, and helps you follow up on every potential customer—automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-yellow-500 text-green-800 hover:bg-yellow-400 rounded-full px-8 py-3.5 font-bold text-lg transition-all">Start Free Trial</Link>
            <Link to="/pricing" className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-3.5 font-semibold text-lg transition-all">View Pricing</Link>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-8 bg-white border-y border-gray-200">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Trusted by Service Businesses</p>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8">
            {industries.map((industry, idx) => (
              <div key={idx} className="text-gray-600 font-medium">{industry}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-green-800 mb-4">Everything You Need to Recover Lost Revenue</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our comprehensive platform helps you capture, track, and convert every lead into paying customers.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md hover:shadow-lg transition-all text-center">
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold text-green-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div><p className="text-5xl font-black text-yellow-500 mb-2">$2,000+</p><p className="text-white/80">Average Monthly Revenue Recovered</p></div>
            <div className="border-y md:border-y-0 md:border-x border-white/20"><p className="text-5xl font-black text-yellow-500 mb-2">85%</p><p className="text-white/80">Lead Conversion Rate Improvement</p></div>
            <div><p className="text-5xl font-black text-yellow-500 mb-2">24/7</p><p className="text-white/80">Automated Call Capture</p></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-green-800 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Stop Losing Money?</h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Join hundreds of service businesses already recovering thousands in lost revenue.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-yellow-500 text-green-800 hover:bg-yellow-400 rounded-full px-8 py-4 font-bold text-lg transition-all">Start Your Free Trial →</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 py-16">
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

export default LandingPage;