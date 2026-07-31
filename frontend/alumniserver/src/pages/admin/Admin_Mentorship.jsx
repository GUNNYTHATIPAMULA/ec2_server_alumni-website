import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { GraduationCap, Loader2, User, Eye } from "lucide-react";

const Admin_Mentorship = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/mentorship");
      setRequests(res.data);
    } catch (err) {
      console.error("Error loading mentorship requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <GraduationCap className="text-blue-600" /> Mentorship Requests
      </h1>
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <Eye size={15} className="text-blue-600 shrink-0" />
        Mentorship requests are accepted or declined by the alumni mentors themselves. This is a read-only overview.
      </div>

      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-lg shadow p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    <User size={14} className="text-blue-600" />
                    {req.mentor_name || req.mentor_id}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                    <User size={14} className="text-amber-600" />
                    {req.mentee_name || req.mentee_id}
                  </span>
                </div>
                {req.message && <p className="text-sm text-gray-600 mb-2">{req.message}</p>}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    req.status === "accepted" ? "bg-green-100 text-green-700" :
                    req.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                  }`}>{req.status}</span>
                  <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center py-12 text-gray-400">No mentorship requests yet</div>
        )}
      </div>
    </div>
  );
};

export default Admin_Mentorship;
