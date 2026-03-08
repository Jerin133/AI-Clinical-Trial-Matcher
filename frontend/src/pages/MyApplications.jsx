import { useNavigate } from "react-router-dom";
import { FileText, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function MyApplications() {
  const navigate = useNavigate();

  const applications = [];

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium border border-amber-100"><Clock size={16} /> Under Review</span>;
      case "accepted":
        return <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100"><CheckCircle2 size={16} /> Accepted</span>;
      case "rejected":
        return <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium border border-slate-200"><AlertCircle size={16} /> Not Selected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">My Applications</h1>
              <p className="text-slate-500 mt-1">Track the status of your clinical trial applications</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/patient-dashboard")}
            className="text-slate-500 hover:text-blue-600 font-medium transition-colors hidden md:block"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{app.name}</h2>
                    {getStatusDisplay(app.status)}
                  </div>
                  <p className="text-slate-500 text-sm mb-4">{app.location}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">Applied: <span className="font-medium text-slate-800">{app.date}</span></span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600">AI Match Score: <span className="font-medium text-blue-600">{app.score}%</span></span>
                  </div>
                </div>

                <div className="flex md:flex-col justify-end">
                  <button className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-colors border border-slate-200">
                    View Details
                    <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            </div>
          ))}

          {applications.length === 0 && (
            <div className="text-center p-12 bg-white rounded-2xl border border-slate-100">
              <FileText size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No applications yet</h3>
              <p className="text-slate-500 mt-2">When you apply for a trial, it will appear here.</p>
              <button
                onClick={() => navigate("/match-results")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
              >
                Find Matches
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
