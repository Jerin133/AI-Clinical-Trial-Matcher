import { useState, useRef } from "react";
import { UploadCloud, FileText, User, Activity, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

export default function UploadMedicalData() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [disease, setDisease] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [lab, setLab] = useState("");
  const [summary, setSummary] = useState(""); // Maps to genetic_info for now
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !age || !gender || !disease) {
      setError("Please fill in the required fields (Name, Age, Gender, and Disease)");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const patientPayload = {
        name: name,
        age: parseInt(age, 10),
        gender: gender,
        disease: disease,
        lab_results: lab ? { "Summary": lab } : {},
        genetic_info: summary || "None provided",
        email: email || null,
        phone: phone || null,
        location: location || null,
        dob: dob || null,
        blood_group: bloodGroup || null,
        height: height || null,
        weight: weight || null
      };

      const res = await api.post("/add-patient", patientPayload);
      const patientId = res.data.patient_id;

      // Save ID so the MatchResults page can use it to fetch personalized trial matches
      localStorage.setItem("currentPatientId", patientId);

      // If user uploaded a medical document, parse it and persist it
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        await api.post(`/upload-report/${patientId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate("/patient-dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload medical data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-2xl border border-slate-100 relative">
        {submitted && (
          <div className="absolute inset-0 bg-white/90 rounded-2xl z-10 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Successfully Uploaded</h3>
            <p className="text-slate-500 mt-2">Redirecting to dashboard...</p>
          </div>
        )}
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <UploadCloud size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Upload Data</h2>
              <p className="text-slate-500 text-sm">Submit your medical information for AI matching</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/patient-dashboard")}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Age
              </label>
              <input
                type="number"
                placeholder="e.g. 45"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Gender
              </label>
              <select
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <Activity size={16} className="text-slate-400" /> Disease / Condition
              </label>
              <input
                type="text"
                placeholder="e.g. Type 2 Diabetes"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Date of Birth
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Email
              </label>
              <input
                type="email"
                placeholder="e.g. alex@example.com"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Phone
              </label>
              <input
                type="text"
                placeholder="e.g. +1 234 567 890"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-slate-400" /> Location / City
              </label>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <Activity size={16} className="text-slate-400" /> Blood Group
              </label>
              <select
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-700"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <Activity size={16} className="text-slate-400" /> Height (cm)
              </label>
              <input
                type="number"
                placeholder="e.g. 175"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                <Activity size={16} className="text-slate-400" /> Weight (kg)
              </label>
              <input
                type="number"
                placeholder="e.g. 70"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-slate-400" /> Lab Results
            </label>
            <input
              type="text"
              placeholder="Key lab values (e.g. HbA1c 8.2%)"
              className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              value={lab}
              onChange={(e) => setLab(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" /> Medical Summary
            </label>
            <textarea
              placeholder="Briefly describe your medical history and current condition..."
              rows={4}
              className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Medical Report</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all"
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <UploadCloud className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-sm font-medium text-slate-700">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or Images up to 10MB</p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm shadow-blue-200 disabled:opacity-70"
            >
              {isSubmitting ? "Uploading..." : "Submit Data"}
            </button>
            <button type="button" onClick={() => navigate("/patient-dashboard")} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}