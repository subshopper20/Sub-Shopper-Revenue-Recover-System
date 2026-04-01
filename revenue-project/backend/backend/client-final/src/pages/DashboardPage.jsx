import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useAuth, API } from "../App.jsx";
import axios from "axios";
import { toast } from "sonner";

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${API}/dashboard/stats`, { headers });
        setStats(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-800 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name?.split(" ")[0] || "there"}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-3xl font-bold text-gray-900">{stats?.total_leads || 0}</p>
            <p className="text-sm text-gray-500">Total Leads</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-3xl font-bold text-gray-900">{stats?.new_leads || 0}</p>
            <p className="text-sm text-gray-500">New Leads</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-3xl font-bold text-gray-900">{stats?.hot_leads || 0}</p>
            <p className="text-sm text-gray-500">Hot Leads</p>
          </div>
          <div className="bg-green-800 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold">${stats?.total_revenue || 0}</p>
            <p className="text-sm text-white/70">Revenue Closed</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;