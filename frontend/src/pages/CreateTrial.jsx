import { FlaskConical, MapPin, AlignLeft, Users, Dna, FileCheck, X, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../services/api";

export default function CreateTrial() {
  const [formData, setFormData] = useState({
    name: "",
    disease: "",
    minAge: "",
    maxAge: "",
    labResults: "",
    geneticMarker: "",
    location: "",
    description: ""
  });
  const [created, setCreated] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const navigate = useNavigate();
  const { trialId } = useParams();
  const isEditing = !!trialId;

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      api.get(`/trial/${trialId}`)
        .then(res => {
          const t = res.data;
          // Extract lab requirements from description string (format: description | Lab requirements: labs)
          let desc = t.description || "";
          let labs = "";
          if (desc.includes(" | Lab requirements: ")) {
            const parts = desc.split(" | Lab requirements: ");
            desc = parts[0];
            labs = parts[1];
          }

          setFormData({
            name: t.trial_name || "",
            disease: t.condition || "",
            minAge: t.min_age || "",
            maxAge: t.max_age || "",
            labResults: labs || "",
            geneticMarker: t.required_marker === "none" ? "" : (t.required_marker || ""),
            location: t.location || "",
            description: desc
          });
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("Failed to load trial details.");
          setIsLoading(false);
        });
    }
  }, [trialId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.disease) {
      setError("Trial Name and Disease are required");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const payload = {
        trial_name: formData.name,
        min_age: formData.minAge ? parseInt(formData.minAge) : 0,
        max_age: formData.maxAge ? parseInt(formData.maxAge) : 100,
        condition: formData.disease,
        required_marker: formData.geneticMarker || "none",
        description: formData.description + (formData.labResults ? ` | Lab requirements: ${formData.labResults}` : "")
      };

      if (isEditing) {
        await api.put(`/trial/${trialId}`, payload);
      } else {
        await api.post("/create-trial", payload);
      }

      setCreated(true);
      setTimeout(() => {
        navigate("/recruiter-dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} trial.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading trial details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex justify-center items-start">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 w-full max-w-3xl mt-4 relative">

        {created && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl z-10 flex flex-col items-center justify-center">
            <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
            <h3 className="text-2xl font-bold text-slate-800">Trial {isEditing ? "Updated" : "Created"} Successfully</h3>
            <p className="text-slate-500 mt-2">Publishing trial parameters and returning to dashboard...</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FlaskConical size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{isEditing ? "Edit Trial" : "Create New Trial"}</h1>
              <p className="text-slate-500 text-sm mt-1">{isEditing ? "Update trial parameters for AI matching" : "Define parameters for AI patient matching"}</p>
            </div>
          </div>
          <Link to="/recruiter-dashboard" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <X size={24} />
          </Link>
        </div>

        <form className="space-y-6" onSubmit={handleCreate}>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Trial Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Phase 3 Lung Cancer Target Therapy"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Disease / Condition
              </label>
              <input
                type="text"
                name="disease"
                placeholder="e.g. Non-small cell lung cancer"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={formData.disease}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" /> Trial Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Boston Medical Center, MA"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Users size={16} className="text-slate-400" /> Age Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="minAge"
                  placeholder="Min"
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  value={formData.minAge}
                  onChange={handleChange}
                />
                <span className="text-slate-400 font-medium">to</span>
                <input
                  type="number"
                  name="maxAge"
                  placeholder="Max"
                  className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  value={formData.maxAge}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Dna size={16} className="text-slate-400" /> Genetic Marker (Optional)
              </label>
              <input
                type="text"
                name="geneticMarker"
                placeholder="e.g. EGFR mutation"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={formData.geneticMarker}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FileCheck size={16} className="text-slate-400" /> Required Lab Results
              </label>
              <input
                type="text"
                name="labResults"
                placeholder="e.g. Platelet count > 100,000/mcL"
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={formData.labResults}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <AlignLeft size={16} className="text-slate-400" /> Trial Description
              </label>
              <textarea
                name="description"
                placeholder="Detail the objectives, methodology, and patient requirements..."
                rows={5}
                className="w-full border border-slate-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 resize-none"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <UploadCloud size={16} className="text-slate-400" /> Upload Trial Protocol
              </label>
              <div className={`border-2 border-dashed ${uploadedFileName ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'} rounded-xl p-6 text-center hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer`}>
                <input type="file" className="hidden" id="trial-upload" onChange={handleFileChange} />
                <label htmlFor="trial-upload" className="cursor-pointer w-full flex flex-col items-center">
                  {uploadedFileName ? (
                    <>
                      <FileCheck className="mx-auto text-emerald-500 mb-2" size={28} />
                      <p className="text-sm font-medium text-emerald-700">
                        {uploadedFileName}
                      </p>
                      <p className="text-xs text-emerald-600/70 mt-1">Ready to upload</p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mx-auto text-slate-400 mb-2" size={28} />
                      <p className="text-sm font-medium text-slate-700">
                        Click to upload document
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PDF, DOCX up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 disabled:opacity-70"
            >
              {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Trial" : "Create Trial")}
            </button>
            <Link
              to="/recruiter-dashboard"
              className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}
