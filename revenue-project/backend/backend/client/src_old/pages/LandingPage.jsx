import { Link } from "react-router-dom";
import { useAuth } from "../App";
import Marquee from "react-fast-marquee";
import { Phone, ChartLineUp, Users, Lightning, ArrowRight, Headset, Leaf, Wrench, Drop, TreeEvergreen, House } from "@phosphor-icons/react";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: <Phone size={32} weight="duotone" />, title: "Call Capture", description: "Never miss a lead. Capture every call and voicemail automatically." },
    { icon: <ChartLineUp size={32} weight="duotone" />, title: "Revenue Tracking", description: "See exactly how much revenue you're recovering in real-time." },
    { icon: <Lightning size={32} weight="duotone" />, title: "AI Transcription", description: "Automatically transcribe voicemails and extract lead information." },
    { icon: <Users size={32} weight="duotone" />, title: "Lead Management", description: "Track every lead from first contact to completed job." }
  ];

  const industries = [
    { icon: <Leaf size={24} weight="duotone" />, name: "Lawn Care" },
    { icon: <Wrench size={24} weight="duotone" />, name: "Plumbing" },
    { icon: <Drop size={24} weight="duotone" />, name: "HVAC" },
    { icon: <TreeEvergreen size={24} weight="duotone" />, name: "Tree Service" },
    { icon: <House size={24} weight="duotone" />, name: "Home Repair" },
    { icon: <Headset size={24} weight="duotone" />, name: "IT Services" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center">
                <Phone size={24} weight="fill" className="text-white" />
              </div>
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

      <section className="relative overflow-hidden bg-green-800 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-yellow-500 text-green-800 text-sm font-bold px-4 py-1.5 rounded-full mb-6">Revenue Recovery System</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
                Stop Losing Money on <span className="text-yellow-500">Missed Calls</span>
              </h1>
              <p className="text-lg text-white/80 mb-8">Every missed call is lost revenue. Our AI-powered system captures, transcribes, and helps you follow up on every potential customer—automatically.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="bg-yellow-500 text-green-800 hover:bg-yellow-400 rounded-full px-8 py-3.5 font-bold text-lg text-center">Start Free Trial</Link>
                <Link to="/pricing" className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-3.5 font-semibold text-lg text-center">View Pricing</Link>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-2xl shadow-2xl p-6">
                <img src="https://images.pexels.com/photos/7820322/pexels-photo-7820322.jpeg" alt="Receptionist using the system" className="rounded-xl w-full h-64 object-cover" />
                <div className="mt-4 flex items-center justify-between">
                  <div><p className="text-sm text-gray-500">New Lead Captured</p><p className="font-bold text-green-800">John Smith - Lawn Mowing</p></div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">+$85.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50 border-y border-gray-200">
        <div className="text-center mb-4"><p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Trusted by Service Businesses</p></div>
        <Marquee gradient={false} speed={30} pauseOnHover>
          {[...industries, ...industries].map((industry, idx) => (
            <div key={idx} className="flex items-center gap-2 mx-8 text-gray-600">{industry.icon}<span className="font-medium">{industry.name}</span></div>
          ))}
        </Marquee>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-green-800 tracking-tight mb-4">Everything You Need to Recover Lost Revenue</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our comprehensive platform helps you capture, track, and convert every lead into paying customers.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md hover:shadow-xl transition-all">
                <div className="w-14 h-14 bg-green-800/10 rounded-xl flex items-center justify-center text-green-800 mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-green-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-green-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4"><div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center"><Phone size={24} weight="fill" className="text-green-800" /></div><span className="text-xl font-bold text-white">SubShopper</span></div>
              <p className="text-white/60 max-w-sm">Revenue Recovery System designed for service businesses. Never miss another opportunity.</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-sm">&copy; {new Date().getFullYear()} Sub Shopper LLC. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;