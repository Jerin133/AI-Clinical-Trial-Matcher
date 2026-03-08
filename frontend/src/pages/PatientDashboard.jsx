import { useNavigate } from "react-router-dom";
import { UploadCloud, Activity, ChevronRight, User, LogOut } from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Patient Dashboard
              </h1>
              <p className="text-slate-500 mt-1">
                Upload your medical data to find matching clinical trials.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("currentPatientId");
              navigate("/");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-medium text-sm shadow-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Upload Medical Data Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <UploadCloud size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Upload Medical Data
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Securely upload your medical records and health profile to find clinical trials that match your condition.
              </p>
            </div>

            <div className="mt-auto pt-4">
              <button
                onClick={() => navigate("/upload-medical-data")}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Start Upload
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* View Match Results Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="mb-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Activity size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                View Match Results
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Review clinical trials that our AI has identified as potential matches based on your medical profile.
              </p>
            </div>

            <div className="mt-auto pt-4">
              <button
                onClick={() => navigate("/match-results")}
                className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium py-3 px-4 rounded-xl transition-colors"
              >
                View Results
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}