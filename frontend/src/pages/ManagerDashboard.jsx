import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  Bot,
  Bug,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  FlaskConical,
  Inbox,
  Sparkles,
  UserCheck,
  UserCog,
  Users,
  X,
  Zap,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useBugs } from "../context/BugContext";

const SEVERITY_STYLES = {
  Critical: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  High: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const STATUS_STYLES = {
  New: "bg-slate-100 text-slate-700 ring-slate-200",
  "AI Processing": "bg-violet-50 text-violet-700 ring-violet-200",
  Assigned: "bg-blue-50 text-[#2563EB] ring-blue-600/20",
  "In Progress": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Ready for QA": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "Needs Retest": "bg-purple-50 text-purple-700 ring-purple-600/20",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const DEVELOPERS_BY_TEAM = {
  Frontend: ["Arun Kumar", "Priya Raman", "Kavya Nair"],
  Backend: ["Rahul Verma", "Sanjay Patel", "Ananya Rao"],
  Payments: ["Arun Kumar", "Divya Menon", "Arjun Mehta"],
  Database: ["Neha Iyer", "Rahul Verma"],
  Infrastructure: ["Vikram Singh", "Deepak Sharma"],
};

export default function ManagerDashboard() {
  const { bugs, aiActivity, currentUser, reassignBug, updateBugPriority, updateBugSeverity, updateBugStatus } = useBugs();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const [reassignModalBug, setReassignModalBug] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("Payments");
  const [selectedDev, setSelectedDev] = useState("Arun Kumar");
  const [selectedPriority, setSelectedPriority] = useState("High");
  const [selectedSeverity, setSelectedSeverity] = useState("Critical");
  const [selectedStatus, setSelectedStatus] = useState("Assigned");
  const [reassignReason, setReassignReason] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 4 Top Metrics
  const summary = useMemo(() => {
    const totalBugs = bugs.length;
    const criticalBugs = bugs.filter((b) => b.severity === "Critical").length;
    const aiTriaged = bugs.filter((b) => b.aiStatus === "AI Triaged").length;
    const resolved = bugs.filter((b) => b.status === "Resolved").length;

    return { totalBugs, criticalBugs, aiTriaged, resolved };
  }, [bugs]);

  // Pipeline Stages with dynamic counts
  const pipelineStages = useMemo(() => {
    return [
      { id: "New", label: "New", count: bugs.filter((b) => b.status === "New").length, icon: Inbox, tone: "text-slate-600 bg-slate-100" },
      { id: "AI Processing", label: "AI Processing", count: bugs.filter((b) => b.status === "AI Processing").length, icon: Sparkles, tone: "text-violet-600 bg-violet-50" },
      { id: "Assigned", label: "Assigned", count: bugs.filter((b) => b.status === "Assigned").length, icon: UserCheck, tone: "text-blue-600 bg-blue-50" },
      { id: "In Progress", label: "In Progress", count: bugs.filter((b) => b.status === "In Progress" || b.status === "Needs Retest").length, icon: Zap, tone: "text-amber-600 bg-amber-50" },
      { id: "Ready for QA", label: "QA Verification", count: bugs.filter((b) => b.status === "Ready for QA").length, icon: FlaskConical, tone: "text-sky-600 bg-sky-50" },
      { id: "Resolved", label: "Resolved", count: bugs.filter((b) => b.status === "Resolved").length, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
    ];
  }, [bugs]);

  // Team Workload aggregation
  const teamWorkload = useMemo(() => {
    const teams = ["Frontend", "Backend", "Payments", "Database", "Infrastructure"];
    return teams.map((teamName) => {
      const teamBugs = bugs.filter((b) => b.team === teamName);
      const assigned = teamBugs.length;
      const critical = teamBugs.filter((b) => b.severity === "Critical").length;
      const inProgress = teamBugs.filter((b) => b.status === "In Progress" || b.status === "Assigned").length;
      const resolved = teamBugs.filter((b) => b.status === "Resolved").length;
      return {
        name: teamName,
        assigned,
        critical,
        inProgress,
        resolved,
      };
    });
  }, [bugs]);

  // Filtered bugs for recent table
  const recentBugs = useMemo(() => {
    return bugs.filter((bug) => {
      if (pipelineFilter !== "all") {
        if (pipelineFilter === "In Progress") {
          if (bug.status !== "In Progress" && bug.status !== "Needs Retest") return false;
        } else if (bug.status !== pipelineFilter) {
          return false;
        }
      }

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        bug.id.toLowerCase().includes(q) ||
        bug.title.toLowerCase().includes(q) ||
        bug.team?.toLowerCase().includes(q) ||
        bug.developer?.toLowerCase().includes(q)
      );
    });
  }, [bugs, pipelineFilter, searchQuery]);

  const openReassignModal = (bug) => {
    setReassignModalBug(bug);
    setSelectedTeam(bug.team || "Payments");
    setSelectedDev(bug.developer || "Arun Kumar");
    setSelectedPriority(bug.priority || "High");
    setSelectedSeverity(bug.severity || "Critical");
    setSelectedStatus(bug.status || "Assigned");
    setReassignReason("");
  };

  const handleReassignSubmit = (e) => {
    e.preventDefault();
    if (!reassignModalBug) return;
    
    // Update team and developer
    reassignBug(reassignModalBug.id, selectedTeam, selectedDev, reassignReason);
    
    // Update priority if changed
    if (selectedPriority !== reassignModalBug.priority) {
      updateBugPriority(reassignModalBug.id, selectedPriority);
    }
    
    // Update severity if changed
    if (selectedSeverity !== reassignModalBug.severity) {
      updateBugSeverity(reassignModalBug.id, selectedSeverity);
    }

    // Update status if changed
    if (selectedStatus !== reassignModalBug.status) {
      updateBugStatus(reassignModalBug.id, selectedStatus, `Manager updated status to ${selectedStatus}`);
    }

    showToast(`${reassignModalBug.id} updated: ${selectedDev} (${selectedTeam}), ${selectedSeverity}/${selectedPriority}`);
    setReassignModalBug(null);
  };

  return (
    <MainLayout
      title="Engineering Manager Overview"
      subtitle={`Welcome back, ${currentUser.name}. Live bug triage telemetry, pipeline throughput, and team distribution.`}
      onSearch={setSearchQuery}
    >
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 4 Summary Cards */}
        <section aria-label="Management summary metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Bugs */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Total Bugs
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                <Bug size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {summary.totalBugs}
              </span>
              <span className="text-xs font-medium text-[#667085]">active in workspace</span>
            </div>
          </div>

          {/* Critical Bugs */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Critical Bugs
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertOctagon size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {summary.criticalBugs}
              </span>
              <span className="text-xs font-medium text-red-600 font-semibold">requires attention</span>
            </div>
          </div>

          {/* AI Triaged */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                AI Triaged
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <Bot size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {summary.aiTriaged}
              </span>
              <span className="text-xs font-medium text-violet-700 font-semibold">
                {Math.round((summary.aiTriaged / (summary.totalBugs || 1)) * 100)}% automated
              </span>
            </div>
          </div>

          {/* Resolved */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Resolved
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {summary.resolved}
              </span>
              <span className="text-xs font-medium text-emerald-700 font-semibold">
                {Math.round((summary.resolved / (summary.totalBugs || 1)) * 100)}% resolution rate
              </span>
            </div>
          </div>
        </section>

        {/* Pipeline Progression Stage Flow */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">
                Bug Triage & Resolution Pipeline
              </h2>
              <p className="text-xs text-[#667085]">
                End-to-end bug progression across teams. Click any stage to filter bugs table.
              </p>
            </div>
            {pipelineFilter !== "all" && (
              <button
                type="button"
                onClick={() => setPipelineFilter("all")}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Clear stage filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isSelected = pipelineFilter === stage.id;
              return (
                <div key={stage.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setPipelineFilter(isSelected ? "all" : stage.id)}
                    className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-[#2563EB] bg-blue-50/70 ring-2 ring-[#2563EB]/20 shadow-xs"
                        : "border-[#E5E7EB] bg-[#F7F8FA] hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${stage.tone}`}>
                        <Icon size={15} />
                      </span>
                      <span className="text-xs font-semibold text-[#172033] line-clamp-1">
                        {stage.label}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span className="text-xl font-bold text-[#172033]">
                        {stage.count}
                      </span>
                      <span className="text-[10px] text-[#667085]">
                        {Math.round((stage.count / (summary.totalBugs || 1)) * 100)}%
                      </span>
                    </div>
                  </button>

                  {idx < pipelineStages.length - 1 && (
                    <ChevronRight
                      size={16}
                      className="pointer-events-none absolute -right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hidden lg:block z-10"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 2-Column Section: Team Workload & AI Activity Feed */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Team Workload (7 cols) */}
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                  <Users size={16} />
                </span>
                <h2 className="text-sm font-bold text-[#172033]">
                  Team Workload Distribution
                </h2>
              </div>
              <span className="text-xs text-[#667085]">5 Core Engineering Teams</span>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {teamWorkload.map((team) => (
                <div key={team.name} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#172033]">{team.name}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#667085]">
                        <strong className="text-[#172033]">{team.assigned}</strong> total
                      </span>
                      {team.critical > 0 && (
                        <span className="text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded text-[10px]">
                          {team.critical} critical
                        </span>
                      )}
                      <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                        {team.inProgress} active
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        {team.resolved} done
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min((team.resolved / (team.assigned || 1)) * 100, 100)}%` }}
                      className="bg-emerald-500 h-full"
                      title="Resolved"
                    />
                    <div
                      style={{ width: `${Math.min((team.inProgress / (team.assigned || 1)) * 100, 100)}%` }}
                      className="bg-amber-400 h-full"
                      title="In Progress"
                    />
                    <div
                      style={{ width: `${Math.min((team.critical / (team.assigned || 1)) * 100, 100)}%` }}
                      className="bg-red-500 h-full"
                      title="Critical"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Activity Feed (5 cols) */}
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs lg:col-span-5">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Sparkles size={16} />
                </span>
                <h2 className="text-sm font-bold text-[#172033]">
                  AI Activity Feed
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
              </span>
            </div>

            <div className="flow-root max-h-80 overflow-y-auto pr-1">
              <ul className="-mb-8">
                {aiActivity.map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-6">
                      {idx !== aiActivity.length - 1 && (
                        <span
                          className="absolute left-3.5 top-4 -ml-px h-full w-0.5 bg-slate-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex items-start space-x-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 ring-4 ring-white">
                          <Sparkles size={13} className="text-[#2563EB]" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-xs text-[#172033]">
                            <strong className="text-blue-600 font-bold">{activity.bugId}</strong>{" "}
                            {activity.text}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#667085]">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Recent Bugs Table & Reassign Action */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
          <div className="border-b border-[#E5E7EB] px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#172033]">
                Recent Bugs & Assignments
              </h2>
              <p className="text-xs text-[#667085]">
                Inspect bug status and reassign ownership across teams
              </p>
            </div>
            {pipelineFilter !== "all" && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Filter: {pipelineFilter}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172033]">
              <thead className="border-b border-[#E5E7EB] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Bug ID</th>
                  <th scope="col" className="px-4 py-3.5">Bug</th>
                  <th scope="col" className="px-3 py-3.5">Severity</th>
                  <th scope="col" className="px-3 py-3.5">Priority</th>
                  <th scope="col" className="px-4 py-3.5">Team</th>
                  <th scope="col" className="px-4 py-3.5">Developer</th>
                  <th scope="col" className="px-3 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] bg-white">
                {recentBugs.map((bug) => (
                  <tr
                    key={bug.id}
                    onClick={() => navigate(`/bugs/${bug.id}`)}
                    className="transition-colors hover:bg-slate-50/70 cursor-pointer"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-bold text-[#2563EB]">
                      <span className="flex items-center gap-1 font-bold">
                        {bug.id}
                        <ExternalLink size={12} className="opacity-60" />
                      </span>
                    </td>

                    <td className="max-w-xs px-4 py-3.5">
                      <span className="font-semibold text-[#172033] hover:text-[#2563EB] line-clamp-1 block">
                        {bug.title}
                      </span>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-[#667085]">
                        {bug.aiSummary}
                      </p>
                    </td>

                    {/* Severity dropdown/badge */}
                    <td className="whitespace-nowrap px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={bug.severity}
                        onChange={(e) => {
                          updateBugSeverity(bug.id, e.target.value);
                          showToast(`${bug.id} severity updated to ${e.target.value}`);
                        }}
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold cursor-pointer border-0 ${
                          SEVERITY_STYLES[bug.severity] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>

                    {/* Priority dropdown/badge */}
                    <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-700" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={bug.priority}
                        onChange={(e) => {
                          updateBugPriority(bug.id, e.target.value);
                          showToast(`${bug.id} priority updated to ${e.target.value}`);
                        }}
                        className="rounded-md border border-[#E5E7EB] bg-[#F7F8FA] px-1.5 py-0.5 text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-[#172033]">
                      {bug.team}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#2563EB]">
                          {bug.developer?.split(" ").map(n => n[0]).join("") || "Dev"}
                        </span>
                        <span className="text-xs text-[#172033]">
                          {bug.developer}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                          STATUS_STYLES[bug.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {bug.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openReassignModal(bug)}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-[#172033] shadow-xs hover:bg-[#F7F8FA] hover:border-slate-300 transition-colors"
                        >
                          <UserCog size={13} className="text-[#2563EB]" />
                          <span>Manage</span>
                        </button>

                        <Link
                          to={`/bugs/${bug.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F7F8FA] hover:text-[#2563EB] transition-colors"
                          title="Inspect Details"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Manager Manage & Reassign Modal */}
        {reassignModalBug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#172033]/40 backdrop-blur-xs"
              onClick={() => setReassignModalBug(null)}
            />
            <div className="relative w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <UserCog size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      Manage Bug & Ownership
                    </h3>
                    <p className="text-xs text-[#667085]">
                      {reassignModalBug.id} · {reassignModalBug.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReassignModalBug(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              {/* AI Recommendation Banner */}
              <div className="mt-4 rounded-xl bg-violet-50/80 border border-violet-200 p-3 flex items-start gap-2.5">
                <Sparkles size={16} className="text-violet-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-violet-900">
                    AI Suggested: {reassignModalBug.team} · {reassignModalBug.developer} ({reassignModalBug.aiConfidence || 94}% confidence)
                  </p>
                  <p className="text-violet-700 mt-0.5">
                    {reassignModalBug.aiReason || "Matches code ownership telemetry and past resolution history."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleReassignSubmit} className="mt-4 space-y-4">
                {/* Team & Developer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                      Reassign Team
                    </label>
                    <select
                      value={selectedTeam}
                      onChange={(e) => {
                        const newTeam = e.target.value;
                        setSelectedTeam(newTeam);
                        const devList = DEVELOPERS_BY_TEAM[newTeam] || [];
                        if (devList.length > 0) setSelectedDev(devList[0]);
                      }}
                      className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                    >
                      {Object.keys(DEVELOPERS_BY_TEAM).map((team) => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                      Reassign Developer
                    </label>
                    <select
                      value={selectedDev}
                      onChange={(e) => setSelectedDev(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                    >
                      {(DEVELOPERS_BY_TEAM[selectedTeam] || []).map((dev) => (
                        <option key={dev} value={dev}>{dev}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority & Severity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                      Change Priority
                    </label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                      Change Severity
                    </label>
                    <select
                      value={selectedSeverity}
                      onChange={(e) => setSelectedSeverity(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Status Transition */}
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Pipeline Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="New">New</option>
                    <option value="AI Processing">AI Processing</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready for QA">Ready for QA</option>
                    <option value="Needs Retest">Needs Retest</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Manager Update Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reassignReason}
                    onChange={(e) => setReassignReason(e.target.value)}
                    placeholder="e.g. Prioritized for sprint release; reassigned to Payments team."
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 text-xs text-[#172033] focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setReassignModalBug(null)}
                    className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                  >
                    <UserCheck size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
