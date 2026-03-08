import { MapPin, Activity, Calendar, FileText, ArrowLeft, CheckCircle2, Loader2, Percent } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function TrialDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [applied, setApplied] = useState(false);
  const [trial, setTrial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const trialId = location.state?.trialId;
  const matchScore = location.state?.matchScore || 0;
  const color = location.state?.color || "bg-blue-500";
  const reason = location.state?.reason || "Based on your medical profile.";

  useEffect(() => {
    if (!trialId) {
      setError("No trial selected. Please return to your matches.");
      setLoading(false);
      return;
    }

    api.get(`/trial/${trialId}`)
      .then(res => {
        setTrial(res.data);

        // Check if the user has already applied for this trial
        const patientId = localStorage.getItem("currentPatientId") || "current_user";
        if (patientId) {
          api.get(`/trial/${trialId}/check-application/${patientId}`)
            .then(appRes => {
              if (appRes.data.applied) {
                setApplied(true);
              }
              setLoading(false);
            })
            .catch(err => {
              console.error("Failed to check application status", err);
              setLoading(false); // Still show trial details even if application check fails
            });
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setError("Failed to fetch trial details.");
        setLoading(false);
      });
  }, [trialId]);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      const patientId = localStorage.getItem("currentPatientId") || "current_user";
      await api.post(`/trial/${trialId}/apply`, { patient_id: patientId });
      setApplied(true);
    } catch (err) {
      console.error("Failed to apply:", err);
      alert("Failed to apply for the trial. Please try again later.");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading trial details...</p>
      </div>
    );
  }

  if (error || !trial) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-sm border border-slate-100">
          <p className="text-slate-800 font-bold text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate("/match-results")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors w-full"
          >
            Back to matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/match-results")}
          className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors w-fit font-medium"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to matches
        </button>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-10 border-b border-slate-100">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-semibold px-4 py-1.5 rounded-full text-sm mb-4 border border-emerald-100 shadow-sm">
                <Percent size={14} />
                {matchScore}% AI Match
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">{trial.trial_name || trial.name}</h1>
              <div className="flex items-center text-slate-500 font-medium">
                <MapPin size={20} className="mr-2 text-blue-500" /> {trial.location || "None"}
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              {applied ? (
                <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-semibold px-8 py-4 rounded-xl border border-emerald-200 w-full">
                  <CheckCircle2 size={24} /> Application Submitted
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-xl transition-all shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 w-full transform active:scale-95 ${isApplying ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isApplying ? "Applying..." : "Apply for this Trial"}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-10">

            <section className="bg-blue-50/50 p-6 md:p-8 rounded-2xl border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
              <h3 className="font-bold text-slate-800 mb-3 text-lg flex items-center gap-2">
                Why did our AI match you?
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {reason}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={20} /></div> Description
              </h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {trial.description}
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Activity size={20} /></div> Eligibility Criteria
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 font-medium">Condition: {trial.condition}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 font-medium">Genetic Marker: {trial.required_marker || "None"}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 font-medium">Age: {trial.min_age} - {trial.max_age} years</span>
                  </li>
                </ul>
              </section>

              <section className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-3 text-lg">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Calendar size={20} /></div> Trial Details
                </h3>
                <ul className="space-y-4 text-sm">
                  <li className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Phase</span>
                    <span className="font-bold text-slate-800 text-base">{trial.phase || "Phase 3"}</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Duration</span>
                    <span className="font-bold text-slate-800 text-base">12 Months</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium uppercase tracking-wider text-xs">Compensation</span>
                    <span className="font-bold text-slate-800 text-base">Travel Covered</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
