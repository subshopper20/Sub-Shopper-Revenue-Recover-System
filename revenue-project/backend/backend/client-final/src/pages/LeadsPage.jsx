import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import { useAuth, API } from "../App.jsx";
import axios from "axios";
import { toast } from "sonner";

const LeadsPage = () => {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${API}/leads?limit=10`, { headers });
        setLeads(response.data.leads || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load leads");
      }
      setLoading(false);
    };
    fetchLeads();
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
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Service</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Value</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{lead.customer_name}</p>
                      <p className="text-sm text-gray-500">{lead.customer_phone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">{lead.service_requested}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">${lead.estimated_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;