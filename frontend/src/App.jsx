import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BugProvider, useBugs } from "./context/BugContext";
import Login from "./pages/Login";
import DeveloperDashboard from "./pages/DeveloperDashboard";
import QADashboard from "./pages/QADashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import BugInbox from "./pages/BugInbox";
import BugDetails from "./pages/BugDetails";

/**
 * Route protection wrapper requiring an active Supabase authenticated session.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useBugs();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BugProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication screen */}
          <Route path="/login" element={<Login />} />

          {/* Role-based dashboards (Protected) */}
          <Route
            path="/developer"
            element={
              <ProtectedRoute>
                <DeveloperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qa"
            element={
              <ProtectedRoute>
                <QADashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Bug Inbox and Details (Protected) */}
          <Route
            path="/bugs"
            element={
              <ProtectedRoute>
                <BugInbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bugs/:bugId"
            element={
              <ProtectedRoute>
                <BugDetails />
              </ProtectedRoute>
            }
          />

          {/* Fallback for unmatched routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </BugProvider>
  );
}
