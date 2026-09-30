import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Eye,
  FileQuestion,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  X,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useBugs } from "../context/BugContext";

const SEVERITY_STYLES = {
  Critical: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  High: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  Low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
};

const PRIORITY_STYLES = {
  P0: "bg-slate-900 text-white",
  P1: "bg-slate-700 text-white",
  P2: "bg-slate-200 text-slate-800",
  P3: "bg-slate-100 text-slate-600",
};

const STATUS_STYLES = {
  New: "bg-slate-100 text-slate-700 ring-slate-200",
  Assigned: "bg-blue-50 text-[#2563EB] ring-blue-600/20",
  "In Progress": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Ready for QA": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "Needs Retest": "bg-purple-50 text-purple-700 ring-purple-600/20",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

export default function DeveloperDashboard() {
  const { bugs, currentUser, updateBugStatus, addBugNote } = useBugs();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [infoModalBug, setInfoModalBug] = useState(null);
  const [infoNote, setInfoNote] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter ONLY bugs assigned to this developer
  const developerBugs = useMemo(() => {
    return bugs.filter(
      (b) =>
        b.developer?.toLowerCase().includes("arun") ||
        b.developer?.toLowerCase() === currentUser.name?.toLowerCase() ||
        b.developer === "Arun Kumar"
    );
  }, [bugs, currentUser]);

  // Metric counts
  const stats = useMemo(() => {
    const totalAssigned = developerBugs.length;
    const criticalHigh = developerBugs.filter(
      (b) => b.severity === "Critical" || b.severity === "High"
    ).length;
    const inProgress = developerBugs.filter((b) => b.status === "In Progress").length;
    const readyForQA = developerBugs.filter((b) => b.status === "Ready for QA").length;
    const resolved = developerBugs.filter((b) => b.status === "Resolved").length;

    return { totalAssigned, criticalHigh, inProgress, readyForQA, resolved };
  }, [developerBugs]);

  // Tab & search filtering
  const filteredBugs = useMemo(() => {
    return developerBugs.filter((bug) => {
      // Tab filter
      if (activeTab === "in-progress" && bug.status !== "In Progress") return false;
      if (activeTab === "ready-qa" && bug.status !== "Ready for QA") return false;
      if (activeTab === "critical-high" && bug.severity !== "Critical" && bug.severity !== "High") return false;
      if (activeTab === "resolved" && bug.status !== "Resolved") return false;

      // Search query
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        bug.id.toLowerCase().includes(q) ||
        bug.title.toLowerCase().includes(q) ||
        bug.aiSummary?.toLowerCase().includes(q) ||
        bug.team?.toLowerCase().includes(q)
      );
    });
  }, [developerBugs, activeTab, searchQuery]);

  const handleStartWork = (bug) => {
    updateBugStatus(bug.id, "In Progress", "Developer started active debugging and investigation.");
    showToast(`Started work on ${bug.id}`);
  };

  const handleReadyForQA = (bug) => {
    updateBugStatus(bug.id, "Ready for QA", "Fix deployed to staging environment. Ready for QA verification.");
    showToast(`${bug.id} marked Ready for QA`);
  };

  const handleResolve = (bug) => {
    updateBugStatus(bug.id, "Resolved", "Bug resolved by developer. Hotfix merged.");
    showToast(`${bug.id} marked as Resolved`);
  };

  const handleRequestInfoSubmit = (e) => {
    e.preventDefault();
    if (!infoNote.trim() || !infoModalBug) return;
    addBugNote(infoModalBug.id, `Information Requested: ${infoNote}`);
    showToast(`Information request sent for ${infoModalBug.id}`);
    setInfoNote("");
    setInfoModalBug(null);
  };

  return (
    <MainLayout
      title="Developer Workspace"
      subtitle={`Welcome back, ${currentUser.name}. Review and resolve your assigned bugs.`}
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

        {/* 4 Metric Cards */}
        <section aria-label="Developer summary metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Assigned Bugs */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Assigned Bugs
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                <Code2 size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {stats.totalAssigned}
              </span>
              <span className="text-xs font-medium text-[#667085]">total assigned to you</span>
            </div>
          </div>

          {/* Critical / High */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Critical / High
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <ShieldAlert size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {stats.criticalHigh}
              </span>
              <span className="text-xs font-medium text-red-600 font-semibold">needs immediate attention</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                In Progress
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Clock size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {stats.inProgress}
              </span>
              <span className="text-xs font-medium text-[#667085]">under active investigation</span>
            </div>
          </div>

          {/* Ready for QA */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Ready for QA
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {stats.readyForQA}
              </span>
              <span className="text-xs font-medium text-[#667085]">waiting for verification</span>
            </div>
          </div>
        </section>

        {/* Assigned Bugs Table Card */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
          {/* Card Header & Tabs */}
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#172033]">
                  Assigned Bugs Queue
                </h2>
                <p className="text-xs text-[#667085]">
                  Showing only bugs assigned to {currentUser.name}
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: `All (${developerBugs.length})` },
                  { id: "in-progress", label: `In Progress (${stats.inProgress})` },
                  { id: "ready-qa", label: `Ready for QA (${stats.readyForQA})` },
                  { id: "critical-high", label: `Critical/High (${stats.criticalHigh})` },
                  { id: "resolved", label: `Resolved (${stats.resolved})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "bg-[#F7F8FA] text-[#667085] hover:bg-slate-200/70 hover:text-[#172033]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#172033]">
              <thead className="border-b border-[#E5E7EB] bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Bug ID</th>
                  <th scope="col" className="px-4 py-3.5">Bug</th>
                  <th scope="col" className="px-3 py-3.5">Severity</th>
                  <th scope="col" className="px-3 py-3.5">Priority</th>
                  <th scope="col" className="px-4 py-3.5">AI Reproduction</th>
                  <th scope="col" className="px-3 py-3.5">Status</th>
                  <th scope="col" className="px-4 py-3.5">Assigned</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] bg-white">
                {filteredBugs.length > 0 ? (
                  filteredBugs.map((bug) => (
                    <tr
                      key={bug.id}
                      onClick={() => navigate(`/bugs/${bug.id}`)}
                      className="transition-colors hover:bg-slate-50/70 cursor-pointer"
                    >
                      {/* Bug ID */}
                      <td className="whitespace-nowrap px-5 py-3.5 font-bold text-[#2563EB]">
                        <span className="hover:underline flex items-center gap-1">
                          {bug.id}
                          <ExternalLink size={12} className="opacity-60" />
                        </span>
                      </td>

                      {/* Bug Title & standardized summary */}
                      <td className="max-w-xs px-4 py-3.5">
                        <span className="font-semibold text-[#172033] hover:text-[#2563EB] line-clamp-1 block">
                          {bug.title}
                        </span>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-[#667085]">
                          {bug.aiSummary || bug.description || bug.originalReport}
                        </p>
                      </td>

                      {/* Severity */}
                      <td className="whitespace-nowrap px-3 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            SEVERITY_STYLES[bug.severity] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {bug.severity}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="whitespace-nowrap px-3 py-3.5">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                            PRIORITY_STYLES[bug.priority] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {bug.priority}
                        </span>
                      </td>

                      {/* AI Reproduction */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`flex h-2 w-2 rounded-full ${
                              bug.reproductionStatus === "Passed"
                                ? "bg-emerald-500"
                                : bug.reproductionStatus === "Failed"
                                ? "bg-red-500"
                                : bug.reproductionStatus === "Reproduced"
                                ? "bg-indigo-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span className="font-medium text-[#172033]">
                            {bug.reproductionStatus || bug.reproStatus || "Reproduced"}
                          </span>
                          <span className="text-[10px] text-[#667085]">
                            ({bug.reproductionSteps?.filter(s => s.status === 'pass').length || 4}/5 steps)
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-3 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                            STATUS_STYLES[bug.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {bug.status}
                        </span>
                      </td>

                      {/* Assigned */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#2563EB]">
                            {bug.developer?.split(" ").map(n => n[0]).join("") || "AK"}
                          </span>
                          <span className="text-xs text-[#172033] font-medium">
                            {bug.developer}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons for developer */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {bug.status === "Assigned" && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleStartWork(bug); }}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#2563EB] px-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
                            >
                              <Play size={12} />
                              <span>Start Work</span>
                            </button>
                          )}

                          {bug.status === "In Progress" && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleReadyForQA(bug); }}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                              >
                                <CheckCircle2 size={12} />
                                <span>Ready for QA</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleResolve(bug); }}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                              >
                                <CheckCircle2 size={12} />
                                <span>Resolve</span>
                              </button>
                            </>
                          )}

                          {bug.status === "Needs Retest" && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleStartWork(bug); }}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-purple-600 px-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors"
                            >
                              <RotateCcw size={12} />
                              <span>Rework</span>
                            </button>
                          )}

                          {bug.status === "Ready for QA" && (
                            <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              Waiting QA
                            </span>
                          )}

                          {bug.status === "Resolved" && (
                            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                              <CheckCircle2 size={12} /> Resolved
                            </span>
                          )}

                          {/* Request More Info */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setInfoModalBug(bug); }}
                            title="Request More Info from QA or Reporter"
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs font-medium text-[#667085] hover:bg-[#F7F8FA] hover:text-[#172033] transition-colors"
                          >
                            <FileQuestion size={13} />
                            <span className="hidden sm:inline">Info</span>
                          </button>

                          {/* View Details */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); navigate(`/bugs/${bug.id}`); }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F7F8FA] hover:text-[#2563EB] transition-colors"
                            title="View Full Bug Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-sm font-semibold text-[#172033]">
                        No bugs found matching this filter
                      </p>
                      <p className="text-xs text-[#667085] mt-1">
                        Try switching tabs or resetting your search query.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Request More Info Dialog Modal */}
        {infoModalBug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#172033]/40 backdrop-blur-xs"
              onClick={() => setInfoModalBug(null)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <FileQuestion size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      Request More Info
                    </h3>
                    <p className="text-xs text-[#667085]">
                      {infoModalBug.id} · {infoModalBug.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoModalBug(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRequestInfoSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    What details or logs do you need?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={infoNote}
                    onChange={(e) => setInfoNote(e.target.value)}
                    placeholder="e.g. Please capture the network payload from /payments/authorize and confirm if customer was using saved card."
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 text-xs text-[#172033] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInfoModalBug(null)}
                    className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                  >
                    <Send size={13} />
                    <span>Send Request</span>
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
