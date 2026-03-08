import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Activity, FileText, Calendar, AlertCircle, CheckCircle2, Loader2, Thermometer, UserSquare2 } from "lucide-react";
import api from "../services/api";

export default function PatientDetails() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Note: React Router captures the full ID like "P-dcf12" or "65d...". 
        // We should send the pure Mongo ID back to the server if `patientId` is just a short ID, 
        // or we can adjust the backend route to accept both.
        let idToFetch = patientId;
        if (patientId.startsWith("P-")) {
            idToFetch = patientId.replace("P-", ""); // this might not be right, the short ID is just the last 5 chars. Wait, the backend needs the full 24-char ObjectID.
        }

        // Actually, TrialApplicants.jsx was passing "P-xxxxx" to app.id, but the backend stripped it!
        // We need to pass the real Mongo ID. I'll need to update TrialApplicants to store the real MongoDB ID in app.rawId.

        api.get(`/patient/${patientId}`)
            .then((res) => {
                setPatient(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch patient details:", err);
                setError("Could not load patient details. The patient may have been removed.");
                setLoading(false);
            });
    }, [patientId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading patient profile...</p>
            </div>
        );
    }

    if (error || !patient) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="max-w-4xl mx-auto text-center mt-20">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Patient Not Found</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors w-fit"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Applicants
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <div className="bg-indigo-600/5 border-b border-indigo-100 p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="h-24 w-24 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <UserSquare2 size={48} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-slate-800">{patient.name || "Unknown Patient"}</h1>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                    <User size={16} className="text-slate-400" />
                                    {patient.age} years old
                                </div>
                                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                    <User size={16} className="text-slate-400" />
                                    {patient.gender || "Unknown"}
                                </div>
                                <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 font-medium">
                                    <Activity size={16} />
                                    {patient.disease}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <MapPin className="text-indigo-500" size={20} />
                                Contact Details
                            </h3>
                            <div className="space-y-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Email Address</p>
                                        <p className="text-slate-700">{patient.email || "No email provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Phone Number</p>
                                        <p className="text-slate-700">{patient.phone || "No phone provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Location</p>
                                        <p className="text-slate-700">{patient.location || patient.city || "Location not specified"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medical Highlights */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="text-indigo-500" size={20} />
                                Medical Profile
                            </h3>
                            <div className="space-y-4 bg-slate-50 rounded-xl p-5 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <Activity className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Primary Condition</p>
                                        <p className="text-slate-700 font-medium">{patient.disease || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Thermometer className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Genetic Marker</p>
                                        <p className="text-slate-700">{patient.genetic_info || "None recorded"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Activity className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Blood Group</p>
                                        <p className="text-slate-700">{patient.blood_group || "Not specified"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Activity className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Height & Weight</p>
                                        <p className="text-slate-700">
                                            {patient.height ? `${patient.height} cm` : "--"} / {patient.weight ? `${patient.weight} kg` : "--"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Date of Birth</p>
                                        <p className="text-slate-700">{patient.dob || "Not specified"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FileText className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Medical Report</p>
                                        {patient.report_id ? (
                                            <a
                                                href={`${api.defaults.baseURL || 'http://localhost:8000'}/report/${patient.report_id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                            >
                                                {patient.report_name || "View Report"}
                                            </a>
                                        ) : (
                                            <p className="text-slate-700">None</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lab Results / Additional Info */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Activity className="text-indigo-500" size={24} />
                            Lab Results & Vitals
                        </h3>

                        {patient.lab_results && Object.keys(patient.lab_results).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(patient.lab_results).map(([key, value]) => (
                                    <div key={key} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <p className="text-sm font-medium text-slate-500 uppercase mb-1">{key.replace(/_/g, ' ')}</p>
                                        <p className="text-lg font-semibold text-slate-800 flex items-baseline gap-1">
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 bg-slate-50 border border-slate-100 rounded-xl text-center">
                                <p className="text-slate-500">No structured lab results available for this patient.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
