import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../App.jsx";
import { Phone, House, Users, ChartLineUp, SignOut, List, X, Bell, MagnifyingGlass } from "@phosphor-icons/react";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };
  const navItems = [
    { path: "/dashboard", icon: House, label: "Dashboard" },
    { path: "/leads", icon: Users, label: "Leads" },
    { path: "/analytics", icon: ChartLineUp, label: "Analytics" }
  ];
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center">
                  <Phone size={24} weight="fill" className="text-white" />
                </div>
                <span className="text-lg font-bold text-green-800">SubShopper</span>
              </Link>
              <button className="lg:hidden p-1 hover:bg-gray-100 rounded" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? "bg-green-50 text-green-800 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-green-800"
                }`}
              >
                <item.icon size={22} weight={isActive(item.path) ? "fill" : "regular"} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.business_name || "My Business"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                {user?.plan_tier?.charAt(0).toUpperCase() + user?.plan_tier?.slice(1) || "Starter"} Plan
              </span>
              {user?.is_demo && <span className="inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Demo</span>}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <SignOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 h-16">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
                <List size={24} />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                {navItems.find((item) => isActive(item.path))?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  className="h-10 w-64 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-green-800 pl-10 pr-4 transition-all outline-none text-sm"
                />
              </div>
              <button className="relative p-2 hover:bg-gray-100 rounded-full">
                <Bell size={22} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-9 h-9 bg-green-800 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.full_name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;