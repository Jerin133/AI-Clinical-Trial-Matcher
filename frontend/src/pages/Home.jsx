import { useNavigate } from "react-router-dom";
import { Stethoscope, User, Building2, ArrowRight } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-blue-600">
            <Stethoscope size={48} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">
          Clinical Trial Matcher
        </h1>

        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed">
          AI-powered patient trial matching platform connecting individuals to life-saving clinical research seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8">
          
          <button
            onClick={() => navigate("/patient-login")}
            className="group flex items-center justify-between gap-4 px-8 py-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 rounded-2xl transition-all duration-300 text-left w-full sm:w-auto min-w-[240px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <User size={24} />
              </div>
              <div>
                <span className="block text-slate-800 font-semibold">I'm a Patient</span>
                <span className="block text-slate-500 text-sm mt-0.5">Find matching trials</span>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => navigate("/recruiter-login")}
            className="group flex items-center justify-between gap-4 px-8 py-4 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100 rounded-2xl transition-all duration-300 text-left w-full sm:w-auto min-w-[240px]"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Building2 size={24} />
              </div>
              <div>
                <span className="block text-slate-800 font-semibold">I'm a Recruiter</span>
                <span className="block text-slate-500 text-sm mt-0.5">Manage study trials</span>
              </div>
            </div>
             <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors group-hover:translate-x-1" />
          </button>

        </div>
      </div>

    </div>
  );
}