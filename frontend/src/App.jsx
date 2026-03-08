import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import PatientLogin from "./pages/PatientLogin"
import PatientSignup from "./pages/PatientSignup"
import RecruiterLogin from "./pages/RecruiterLogin"
import RecruiterSignup from "./pages/RecruiterSignup"
import PatientDashboard from "./pages/PatientDashboard"
import UploadMedicalData from "./pages/UploadMedicalData"
import MatchResults from "./pages/MatchResults"
import TrialDetails from "./pages/TrialDetails"
import MyApplications from "./pages/MyApplications"
import PatientProfile from "./pages/PatientProfile"

import RecruiterDashboard from "./pages/RecruiterDashboard"
import CreateTrial from "./pages/CreateTrial"
import TrialApplicants from "./pages/TrialApplicants"
import PatientDetails from "./pages/PatientDetails"
import AppliedPatients from "./pages/AppliedPatients"

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-signup" element={<PatientSignup />} />

        <Route path="/recruiter-login" element={<RecruiterLogin />} />
        <Route path="/recruiter-signup" element={<RecruiterSignup />} />

        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/patient-profile" element={<PatientProfile />} />
        <Route path="/my-applications" element={<MyApplications />} />

        <Route path="/upload-medical-data" element={<UploadMedicalData />} />
        <Route path="/match-results" element={<MatchResults />} />
        <Route path="/trial-details" element={<TrialDetails />} />

        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/create-trial" element={<CreateTrial />} />
        <Route path="/edit-trial/:trialId" element={<CreateTrial />} />
        <Route path="/trial-applicants" element={<TrialApplicants />} />
        <Route path="/applied-patients" element={<AppliedPatients />} />
        <Route path="/patient/:patientId" element={<PatientDetails />} />

      </Routes>

    </BrowserRouter>

  )

}