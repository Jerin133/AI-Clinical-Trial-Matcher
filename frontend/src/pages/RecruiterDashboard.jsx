import { Plus, Users, FolderOpen, TrendingUp, ChevronRight, LogOut, Loader2, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [trials, setTrials] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [appliedCount, setAppliedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(true);

  useEffect(() => {
    api.get("/recruiter/trials")
      .then(res => {
        setTrials(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch recruiter trials:", err);
        setLoading(false);
      });

    api.get("/recruiter/applicants")
      .then(res => {
        setApplicants(res.data);
        setLoadingApplicants(false);
      })
      .catch(err => {
        console.error("Failed to fetch applicants:", err);
        setLoadingApplicants(false);
      });
    api.get("/recruiter/applied-patients")
      .then(res => {
        setAppliedCount(res.data.length);
      })
      .catch(err => {
        console.error("Failed to fetch applied patients:", err);
      });
  }, []);

  const applicantsCount = applicants.length;
  const acceptedCount = applicants.filter(a => a.status === 'accepted').length;
  const progressPercent = applicantsCount > 0 ? Math.round((acceptedCount / applicantsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Recruiter Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage trials and monitor patient recruitment</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                navigate("/");
              }}
              className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 font-medium px-4 py-3 rounded-xl shadow-sm transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
            <Link
              to="/create-trial"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-sm shadow-blue-200 transition-colors"
            >
              <Plus size={20} />
              Create New Trial
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FolderOpen size={24} />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Active Trials</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Currently running clinical trials across all registered locations.
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl font-bold text-slate-800">
                {loading ? <Loader2 size={24} className="animate-spin text-slate-400" /> : trials.length}
              </span>
            </div>
          </div>

          <div
            onClick={() => navigate("/trial-applicants")}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 flex-1">Matched Patients</h2>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Review and manage patients identified by AI matching.
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl font-bold text-slate-800">
                {loadingApplicants ? <Loader2 size={24} className="animate-spin text-slate-400" /> : applicantsCount}
              </span>
            </div>
          </div>

          <div
            onClick={() => navigate("/applied-patients")}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 flex-1">Applied Patients</h2>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Review candidates who manually applied.
            </p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl font-bold text-slate-800">
                {loadingApplicants ? <Loader2 size={24} className="animate-spin text-slate-400" /> : appliedCount}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Recruitment Progress</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Average enrollment fill rate across all active trial programs.
            </p>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xl font-bold text-emerald-600">{progressPercent}% Fill Rate</span>
              <span className="text-xs text-slate-500 font-medium">{acceptedCount} of {applicantsCount} Accepted</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading your trials...</div>
            ) : trials.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {trials.map(trial => (
                  <li
                    key={trial._id}
                    onClick={() => navigate(`/edit-trial/${trial._id}`)}
                    className="p-6 hover:bg-slate-50 transition-colors flex justify-between items-center group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Activity size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{trial.trial_name}</h4>
                        <p className="text-sm text-slate-500">{trial.condition} • {trial.min_age}-{trial.max_age} yrs</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500">
                You haven't created any trials yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
