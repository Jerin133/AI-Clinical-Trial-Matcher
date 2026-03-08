import { useNavigate } from "react-router-dom";
import { Users, Search, CheckCircle2, XCircle, ArrowLeft, Building2, Filter, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function TrialApplicants() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const [applicants, setApplicants] = useState([]);
  const [feedbacks, setFeedbacks] = useState({}); // { patientId: 'up' | 'down' }
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterMaxAge, setFilterMaxAge] = useState("");
  const [filterMinScore, setFilterMinScore] = useState("");

  useEffect(() => {
    api.get("/recruiter/applicants")
      .then(res => {
        setApplicants(res.data);
        setLoading(false);

        // Fetch feedback records for these patients if there's a trial
        const trialIds = [...new Set(res.data.map(a => a.trialId))];
        trialIds.forEach(tId => {
          api.get(`/feedback/recruiter/${tId}`)
            .then(fbRes => {
              setFeedbacks(prev => ({ ...prev, ...fbRes.data }));
            })
            .catch(console.error);
        });
      })
      .catch(err => {
        console.error("Error fetching applicants:", err);
        setLoading(false);
      });
  }, []);

  const handleFeedback = async (rawId, trialId, type) => {
    try {
      // Toggle or set new
      const newType = feedbacks[rawId] === type ? null : type;
      setFeedbacks(prev => ({ ...prev, [rawId]: newType }));

      const feedbackString = newType === "up" ? "positive" : newType === "down" ? "negative" : "neutral";

      await api.post("/feedback", {
        patient_id: rawId,
        trial_id: trialId,
        feedback: feedbackString,
        role: "recruiter"
      });

    } catch (error) {
      console.error("Failed to submit AI feedback", error);
    }
  };

  const handleAction = async (rawId, trialId, newStatus) => {
    try {
      await api.put(`/recruiter/applicants/${trialId}/${rawId}/status`, { status: newStatus });
      setApplicants(applicants.map(app =>
        (app.rawId === rawId && app.trialId === trialId) ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredApplicants = applicants.filter(a => {
    // Tab
    if (activeTab !== "all" && a.status !== activeTab) return false;

    // Search
    if (searchTerm && !a.id.toLowerCase().includes(searchTerm.toLowerCase()) && !a.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    // Filters
    if (filterBloodGroup && a.bloodGroup !== filterBloodGroup) return false;
    if (filterMaxAge && a.age > parseInt(filterMaxAge)) return false;
    if (filterMinScore && a.matchScore < parseFloat(filterMinScore)) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <button
          onClick={() => navigate("/recruiter-dashboard")}
          className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors w-fit"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <Users size={24} />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Applicant Review</h1>
            </div>
            <p className="text-slate-500 mt-1">Review AI-matched candidates for your active clinical trials.</p>
          </div>

          <div className="flex flex-col items-end gap-3 z-10 basis-1/2">
            <div className="flex items-center gap-3 w-full justify-end">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Patient ID or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}`}
              >
                <Filter size={16} /> Filter
              </button>
            </div>
            {showFilters && (
              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-lg flex flex-wrap gap-4 items-end absolute right-10 top-40 z-20">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Blood Group</label>
                  <select
                    value={filterBloodGroup}
                    onChange={(e) => setFilterBloodGroup(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none w-32 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Any</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Max Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 65"
                    value={filterMaxAge}
                    onChange={(e) => setFilterMaxAge(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none w-24 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Min Score (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 80"
                    value={filterMinScore}
                    onChange={(e) => setFilterMinScore(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none w-28 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {(filterBloodGroup || filterMaxAge || filterMinScore) && (
                  <button
                    onClick={() => { setFilterBloodGroup(""); setFilterMaxAge(""); setFilterMinScore(""); }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium ml-2 pb-1.5"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

          <div className="flex border-b border-slate-100 px-6">
            {["all", "pending", "accepted", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-4 font-medium text-sm capitalize border-b-2 transition-colors ${activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Patient ID</th>
                  <th className="p-4 font-semibold">Profile</th>
                  <th className="p-4 font-semibold">AI Match Score</th>
                  <th className="p-4 font-semibold">Relevance</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/patient/${app.rawId}`)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">{app.id}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{app.name} <span className="text-slate-500 font-normal">({app.age}yo {app.gender} • {app.bloodGroup})</span></div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">Matched to: <strong>{app.trialName}</strong></div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{app.condition}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-slate-800">{app.matchScore}%</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${app.matchScore >= 90 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${app.matchScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleFeedback(app.rawId, app.trialId, 'up')}
                          className={`p-2 rounded-lg transition-all ${feedbacks[app.rawId] === 'up' ? 'text-emerald-600 bg-emerald-50 border border-emerald-200 shadow-sm' : 'text-slate-400 border border-transparent hover:text-emerald-500 hover:bg-emerald-50'}`}
                          title="Helpful AI Match"
                        >
                          <ThumbsUp size={18} />
                        </button>
                        <button
                          onClick={() => handleFeedback(app.rawId, app.trialId, 'down')}
                          className={`p-2 rounded-lg transition-all ${feedbacks[app.rawId] === 'down' ? 'text-red-600 bg-red-50 border border-red-200 shadow-sm' : 'text-slate-400 border border-transparent hover:text-red-500 hover:bg-red-50'}`}
                          title="Poor AI Match"
                        >
                          <ThumbsDown size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div onClick={(e) => e.stopPropagation()}>
                        {app.status === "pending" ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleAction(app.rawId, app.trialId, 'accepted')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Accept Patient"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                            <button
                              onClick={() => handleAction(app.rawId, app.trialId, 'rejected')}
                              className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                              title="Reject Patient"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${app.status === "accepted" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}>
                            {app.status}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                <Loader2 size={48} className="mx-auto text-slate-300 mb-4 animate-spin" />
                <p>Analyzing dataset for AI candidates...</p>
              </div>
            ) : filteredApplicants.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <p>No AI-matched candidates found for this category.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
