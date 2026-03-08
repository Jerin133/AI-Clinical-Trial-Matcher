import { useNavigate } from "react-router-dom";
import { Users, Search, ArrowLeft, Loader2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function AppliedPatients() {
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        api.get("/recruiter/applied-patients")
            .then(res => {
                setApplicants(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching applied patients:", err);
                // It could fail if nothing exists yet, just set empty
                setApplicants([]);
                setLoading(false);
            });
    }, []);

    const filteredApplicants = applicants.filter(a => {
        if (searchTerm && !a.id.toLowerCase().includes(searchTerm.toLowerCase()) && !a.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate("/recruiter-dashboard")}
                    className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors w-fit font-medium"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                                <Users size={24} />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800">Applied Patients</h1>
                        </div>
                        <p className="text-slate-500 mt-1">Review patients who explicitly applied to your trials.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Patient ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                            <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                            <p>Fetching incoming applications...</p>
                        </div>
                    ) : filteredApplicants.length > 0 ? (
                        filteredApplicants.map(app => (
                            <div
                                key={`${app.trialId}-${app.rawId}`}
                                onClick={() => navigate(`/patient/${app.rawId}`)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                            >
                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center w-full">
                                    <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                                        {app.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-800 text-lg">{app.name}</span>
                                            <span className="font-mono text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{app.id}</span>
                                        </div>
                                        <div className="text-sm text-slate-500 flex items-center gap-3">
                                            <span>{app.age}yo {app.gender}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>Blood: {app.bloodGroup}</span>
                                        </div>
                                        <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block w-fit">
                                            Condition: <span className="font-medium text-slate-800">{app.condition}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                    <div className="text-sm flex items-center gap-2 text-slate-500 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-50">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        Applied to: <span className="font-medium text-blue-800 line-clamp-1 max-w-[200px]" title={app.trialName}>{app.trialName}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar size={12} /> Date: {app.date}
                                    </div>
                                    <div className="text-emerald-600 text-sm font-medium mt-1 flex items-center group-hover:translate-x-1 transition-transform">
                                        View Full Profile &rarr;
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                                <Users size={32} />
                            </div>
                            <p className="text-lg font-medium text-slate-700">No applications found</p>
                            <p className="text-sm mt-1">You don't have any patients who have applied manually yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
