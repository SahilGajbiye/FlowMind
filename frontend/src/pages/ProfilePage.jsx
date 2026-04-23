import React, { useState, useEffect } from "react";
import { Workflow, User, CheckCircle, XCircle } from "lucide-react";
import { getDashboardData } from "../services/api"; // Make sure the path is correct
import { useAuth } from "../context/AuthContext";

export default function FlowMindDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, tokens } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // NOTE: You need to get the token from your authentication context or local storage
        const token = tokens.access // Example of getting the token
        if (token) {
          const response = await getDashboardData(token);
          setDashboardData(response.data);
        } else {
            // Handle case where there is no token
            setError("No authorization token found.");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen p-8 text-white bg-brand-dark">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen p-8 text-white bg-brand-dark">Error: {error}</div>;
  }

  if (!dashboardData) {
    return null;
  }

  const { analytics, logs, user_profile } = dashboardData;

  return (
    <div className="min-h-screen p-8 text-white bg-brand-dark">
      {/* Header */}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* User Profile Card */}
        <div className="bg-[#1a1a1a] border border-stroke rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 bg-[#c4ff0d] rounded flex items-center justify-center">
              <User className="w-12 h-12 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-medium">{user_profile.username}</h2>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-xl">✉</span>
                {user_profile.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-stroke rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Workflow className="w-4 h-4" />
              <span className="text-sm font-medium ">No. Of APIs called</span>
            </div>
            <div className="text-6xl font-bold ">{analytics.api_calls || 0}</div>
          </div>

          <div className="bg-[#1a1a1a] border border-stroke  rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Workflow className="w-4 h-4" />
              <span className="text-sm font-medium">
                No. Of Workflows Created
              </span>
            </div>
            <div className="text-6xl font-bold text-white">{analytics.workflows_created || 0}</div>
          </div>

          <div className="bg-[#1a1a1a] border border-stroke rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">
                Success Executions
              </span>
            </div>
            <div className="text-6xl font-bold text-primary">{analytics.success_executions || 0}</div>
          </div>

          <div className="bg-[#1a1a1a] border border-stroke rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">
                Failed Executions
              </span>
            </div>
            <div className="text-6xl font-bold text-red-500">{analytics.failed_executions || 0}</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1a1a] border border-stroke rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-medium">Recent Activity</h3>
          <div className="space-y-4">
            {logs.recent_activity.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ log }) {
  const isInfo = log.log_level === 'INFO';
  const bgColor = isInfo ? 'bg-green-900/30' : 'bg-red-900/30';
  const borderColor = isInfo ? 'border-green-500/50' : 'border-red-500/50';
  
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 flex items-center gap-4`}>
      <div className="flex-grow">
        <div className="font-medium text-sm">{log.log_message}</div>
        <div className="text-xs text-gray-400">
          {new Date(log.created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
