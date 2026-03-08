import { useNavigate } from "react-router-dom";
import { User, Activity, FileSpreadsheet, Lock, Settings } from "lucide-react";

export default function PatientProfile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
            <p className="text-slate-500 mt-1">Manage your health data for accurate AI matching</p>
          </div>
          <button
            onClick={() => navigate("/patient-dashboard")}
            className="text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <User size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Alex Morgan</h2>
              <p className="text-slate-500 text-sm">alex.morgan@example.com</p>

              <div className="w-full h-px bg-slate-100 my-4"></div>

              <div className="w-full flex justify-between text-sm">
                <span className="text-slate-500">Match Score Avg</span>
                <span className="font-semibold text-emerald-600">84%</span>
              </div>
              <div className="w-full flex justify-between text-sm mt-2">
                <span className="text-slate-500">Active Applications</span>
                <span className="font-semibold text-blue-600">2</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
              <button className="w-full flex items-center justify-between p-3 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm">
                <div className="flex items-center gap-3"><Settings size={18} /> Account Settings</div>
              </button>
              <button className="w-full flex items-center justify-between p-3 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm">
                <div className="flex items-center gap-3"><Lock size={18} /> Privacy & Security</div>
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" /> Basic Health Info
                </h3>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700">Edit</button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Age</label>
                  <p className="text-slate-800 font-medium">45</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Primary Condition</label>
                  <p className="text-slate-800 font-medium">Non-small cell lung cancer</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Genetic Markers</label>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">EGFR Positive</span>
                    <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-sm font-medium border border-slate-200">ALK Negative</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-blue-600" /> Medical Documents
                </h3>
                <button
                  onClick={() => navigate("/upload-medical-data")}
                  className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                >
                  Upload New
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">Lab Results - Oct 2023.pdf</p>
                      <p className="text-xs text-slate-500">Uploaded 2 months ago • 2.4 MB</p>
                    </div>
                  </div>
                  <button className="text-sm text-slate-400 hover:text-red-500 font-medium">Remove</button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">Clinical Summary.docx</p>
                      <p className="text-xs text-slate-500">Uploaded 1 year ago • 1.1 MB</p>
                    </div>
                  </div>
                  <button className="text-sm text-slate-400 hover:text-red-500 font-medium">Remove</button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="text-sm text-red-500 hover:text-red-600 font-medium hover:underline">
                Request Data Deletion
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
