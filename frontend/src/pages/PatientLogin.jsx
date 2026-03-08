import { useNavigate, Link } from "react-router-dom";
import { UserCircle, Mail, Lock, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";

import api from "../services/api";

export default function PatientLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("userRole", res.data.role);

      if (res.data.patient_id) {
        localStorage.setItem("currentPatientId", res.data.patient_id);
      }

      navigate("/patient-dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Login failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4 relative group cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-blue-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out rounded-2xl"></div>
            <Plus size={36} className="relative z-10 group-hover:rotate-180 transition-transform duration-500 ease-in-out" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            Patient Login
          </h2>
          <p className="text-slate-500 text-sm mt-2 text-center">
            Access your medical dashboard and trial matches
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm shadow-blue-200 group disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Login to Dashboard"}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link to="/patient-signup" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Sign up today
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}