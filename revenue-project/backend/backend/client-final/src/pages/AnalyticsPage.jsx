import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useAuth, API } from "../App.jsx";
import axios from "axios";
import { toast } from "sonner";

const AnalyticsPage = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${API}/analytics/revenue?period=month`, { headers });
        setData(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load analytics");
      }
      setLoading(false);
    };
    fetchAnalytics();
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
        <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-3xl font-bold text-gray-900">${data?.summary?.total_potential || 0}</p>
            <p className="text-sm text-gray-500">Potential Revenue</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-3xl font-bold text-gray-900">${data?.summary?.total_actual || 0}</p>
            <p className="text-sm text-gray-500">Actual Revenue</p>
          </div>
          <div className="bg-green-800 rounded-xl p-6 text-white">
            <p className="text-3xl font-bold">${(data?.summary?.total_potential || 0) - (data?.summary?.total_actual || 0)}</p>
            <p className="text-sm text-white/70">Unrealized Revenue</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-bold mb-4">Revenue Over Time</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will appear here</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;