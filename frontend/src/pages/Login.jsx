import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useBugs } from "../context/BugContext";

const ROLES = [
  {
    id: "developer",
    title: "Developer",
    subtitle: "Work on assigned bugs, repro steps & resolutions",
    user: "Arun Kumar",
    email: "dev@bugflow.ai",
    icon: Code2,
    route: "/developer",
    badge: "Assigned: 5 bugs",
  },
  {
    id: "qa",
    title: "QA / Tester",
    subtitle: "Run repro bot, verify fixes & triage incoming reports",
    user: "Meera Nair",
    email: "qa@bugflow.ai",
    icon: ClipboardCheck,
    route: "/qa",
    badge: "Testing Queue: 4 bugs",
  },
  {
    id: "manager",
    title: "Manager",
    subtitle: "Pipeline oversight, team workloads & smart routing",
    user: "Rohan Kapoor",
    email: "manager@bugflow.ai",
    icon: Users,
    route: "/manager",
    badge: "Overview: 10 bugs",
  },
];

export default function Login() {
  const { setCurrentRole } = useBugs();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("developer");
  const [email, setEmail] = useState("dev@bugflow.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (role) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setError("");
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);
    setCurrentRole(selectedRole);

    setTimeout(() => {
      const activeRoleConfig = ROLES.find((r) => r.id === selectedRole);
      if (activeRoleConfig) {
        navigate(activeRoleConfig.route);
      } else {
        navigate("/developer");
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Subtle Gradient Accents */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-md shadow-blue-500/20 mb-3">
          <Bug size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          BugFlow AI
        </h1>
        <p className="mt-1 text-sm text-[#667085]">
          Autonomous Bug Triage & Engineering Operations Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#E5E7EB] sm:rounded-2xl sm:px-10">
          <form onSubmit={handleSignIn} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#667085] mb-2.5">
                Select Your Role
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSelectRole(role)}
                      className={`relative flex flex-col p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#2563EB] bg-blue-50/60 ring-2 ring-[#2563EB]/20 shadow-xs"
                          : "border-[#E5E7EB] bg-white hover:border-slate-300 hover:bg-[#F7F8FA]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isSelected
                              ? "bg-[#2563EB] text-white"
                              : "bg-slate-100 text-[#667085]"
                          }`}
                        >
                          <Icon size={16} />
                        </span>
                        {isSelected && (
                          <CheckCircle2
                            size={16}
                            className="text-[#2563EB]"
                          />
                        )}
                      </div>

                      <span className="text-xs font-bold text-[#172033]">
                        {role.title}
                      </span>
                      <span className="text-[11px] text-[#667085] mt-0.5 line-clamp-1">
                        {role.user}
                      </span>
                      <span className="mt-2 inline-flex items-center rounded text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 w-fit">
                        {role.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email & Credentials preview */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-sm text-[#172033] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#172033]">
                    Password
                  </label>
                  <span className="text-[11px] text-[#2563EB] hover:underline cursor-pointer">
                    Mock credentials enabled
                  </span>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] pl-9 pr-3 text-sm text-[#172033] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#2563EB] text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors disabled:opacity-50"
            >
              <span>
                {loading ? "Authenticating..." : `Sign In as ${ROLES.find(r => r.id === selectedRole)?.title}`}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick role dispatch indicators */}
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <p className="text-center text-xs font-medium text-[#667085] mb-3">
              One-click route redirection:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
                <p className="font-semibold text-[#172033]">QA</p>
                <p className="text-[11px] text-[#2563EB]">/qa</p>
              </div>
              <div className="p-2 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
                <p className="font-semibold text-[#172033]">Developer</p>
                <p className="text-[11px] text-[#2563EB]">/developer</p>
              </div>
              <div className="p-2 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
                <p className="font-semibold text-[#172033]">Manager</p>
                <p className="text-[11px] text-[#2563EB]">/manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#2563EB] mb-1.5">
              <Sparkles size={16} />
            </span>
            <h2 className="text-xs font-semibold text-[#172033]">AI Triage Engine</h2>
            <p className="text-[11px] text-[#667085] mt-0.5">Standardized summaries & root-cause</p>
          </div>
          <div className="flex flex-col items-center p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 mb-1.5">
              <ShieldCheck size={16} />
            </span>
            <h2 className="text-xs font-semibold text-[#172033]">Auto Reproduction</h2>
            <p className="text-[11px] text-[#667085] mt-0.5">Step-by-step telemetry validation</p>
          </div>
          <div className="flex flex-col items-center p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 mb-1.5">
              <Users size={16} />
            </span>
            <h2 className="text-xs font-semibold text-[#172033]">Smart Assignment</h2>
            <p className="text-[11px] text-[#667085] mt-0.5">Service ownership routing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
