import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BugProvider } from "./context/BugContext";
import Login from "./pages/Login";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import QADashboard from "./pages/QADashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import BugInbox from "./pages/BugInbox";
import BugDetails from "./pages/BugDetails";

export default function App() {
  return (
    <BugProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication screen */}
          <Route path="/login" element={<Login />} />

          {/* Role-based dashboards */}
          <Route path="/developer" element={<DeveloperDashboard />} />
          <Route path="/qa" element={<QADashboard />} />
          <Route path="/manager" element={<ManagerDashboard />} />

          {/* Bug Inbox and Details */}
          <Route path="/bugs" element={<BugInbox />} />
          <Route path="/bugs/:bugId" element={<BugDetails />} />

          {/* Fallback for unmatched routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </BugProvider>
  );
}
