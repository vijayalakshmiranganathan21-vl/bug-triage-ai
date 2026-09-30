import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Eye,
  FileQuestion,
  FlaskConical,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  X,
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

export default function QADashboard() {
  const { bugs, currentUser, updateBugStatus, addBugNote, updateBugRepro } = useBugs();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReproBug, setSelectedReproBug] = useState(null);
  const [reopenModalBug, setReopenModalBug] = useState(null);
  const [reopenReason, setReopenReason] = useState("");
  const [infoModalBug, setInfoModalBug] = useState(null);
  const [infoNote, setInfoNote] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [reproRunning, setReproRunning] = useState(false);
  const [reproProgress, setReproProgress] = useState(100);
  const [reproActiveStep, setReproActiveStep] = useState(5);
  const [reproResultText, setReproResultText] = useState("Reproduction Completed");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startReproSimulation = (bugToRun) => {
    const targetBug = bugToRun || selectedReproBug;
    if (!targetBug) return;

    setReproRunning(true);
    setReproProgress(0);
    setReproActiveStep(0);
    setReproResultText("Running automated reproduction bot...");

    setTimeout(() => {
      setReproProgress(25);
      setReproActiveStep(1);
    }, 350);

    setTimeout(() => {
      setReproProgress(50);
      setReproActiveStep(2);
    }, 700);

    setTimeout(() => {
      setReproProgress(75);
      setReproActiveStep(3);
    }, 1050);

    setTimeout(() => {
      setReproProgress(100);
      setReproActiveStep(5);
      setReproRunning(false);
      const isFailed = targetBug.id === "BUG-104" || targetBug.id === "BUG-119" || targetBug.reproStatus === "Failed";
      const finalStatus = isFailed ? "Reproduction Failed" : "Reproduction Successful";
      setReproResultText(finalStatus);
      updateBugRepro(targetBug.id, isFailed ? "Reproduced" : "Passed");
      showToast(`${targetBug.id}: ${finalStatus}`);
    }, 1450);
  };

  // 4 Top Metrics
  const stats = useMemo(() => {
    const newBugs = bugs.filter((b) => b.status === "New" || b.status === "AI Processing").length;
    const aiTriaged = bugs.filter((b) => b.aiStatus === "AI Triaged" || b.aiStatus === "Analyzed").length;
    const waitingForVerification = bugs.filter((b) => b.status === "Ready for QA").length;
    const reopened = bugs.filter((b) => b.status === "Needs Retest").length;

    return { newBugs, aiTriaged, waitingForVerification, reopened };
  }, [bugs]);

  // Tab & search filtering
  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      if (activeTab === "waiting-qa" && bug.status !== "Ready for QA") return false;
      if (activeTab === "reopened" && bug.status !== "Needs Retest") return false;
      if (activeTab === "new" && bug.status !== "New" && bug.status !== "AI Processing") return false;
      if (activeTab === "resolved" && bug.status !== "Resolved") return false;

      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        bug.id.toLowerCase().includes(q) ||
        bug.title.toLowerCase().includes(q) ||
        bug.developer?.toLowerCase().includes(q) ||
        bug.aiSummary?.toLowerCase().includes(q)
      );
    });
  }, [bugs, activeTab, searchQuery]);

  // QA Actions
  const handleVerify = (bug) => {
    updateBugStatus(bug.id, "Resolved", "QA verified fix in staging. All reproduction steps passed.");
    showToast(`${bug.id} verified and resolved!`);
  };

  const handleReopenSubmit = (e) => {
    e.preventDefault();
    if (!reopenReason.trim() || !reopenModalBug) return;
    updateBugStatus(
      reopenModalBug.id,
      "Needs Retest",
      `QA Reopened Issue: ${reopenReason}`
    );
    showToast(`${reopenModalBug.id} reopened for developer retest.`);
    setReopenReason("");
    setReopenModalBug(null);
  };

  const handleRequestInfoSubmit = (e) => {
    e.preventDefault();
    if (!infoNote.trim() || !infoModalBug) return;
    addBugNote(infoModalBug.id, `QA Info Request: ${infoNote}`);
    showToast(`Request sent for ${infoModalBug.id}`);
    setInfoNote("");
    setInfoModalBug(null);
  };

  return (
    <MainLayout
      title="QA Workspace"
      subtitle={`Welcome back, ${currentUser.name}. Review testing queue, automated reproduction runs, and verify bug fixes.`}
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
        <section aria-label="QA summary metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* New Bugs */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                New Bugs
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                <ClipboardCheck size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {stats.newBugs}
              </span>
              <span className="text-xs font-medium text-[#667085]">fresh reports ingested</span>
            </div>
          </div>

          {/* AI Triaged */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                AI Triaged
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <Sparkles size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {stats.aiTriaged}
              </span>
              <span className="text-xs font-medium text-violet-700 font-semibold">reproduction validated</span>
            </div>
          </div>

          {/* Waiting for Verification */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Waiting for Verification
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <FlaskConical size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {stats.waitingForVerification}
              </span>
              <span className="text-xs font-medium text-amber-700 font-semibold">ready for QA sign-off</span>
            </div>
          </div>

          {/* Reopened */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                Reopened
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <RotateCcw size={18} />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-[#172033]">
                {stats.reopened}
              </span>
              <span className="text-xs font-medium text-[#667085]">needs dev retest</span>
            </div>
          </div>
        </section>

        {/* Testing Queue Card */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#172033]">
                  QA Testing Queue
                </h2>
                <p className="text-xs text-[#667085]">
                  Validate automated reproduction steps and certify fixes
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: `All Queue (${bugs.length})` },
                  { id: "waiting-qa", label: `Waiting Verification (${stats.waitingForVerification})` },
                  { id: "reopened", label: `Needs Retest (${stats.reopened})` },
                  { id: "new", label: `New Ingested (${stats.newBugs})` },
                  { id: "resolved", label: "Verified / Resolved" },
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
                  <th scope="col" className="px-4 py-3.5">AI Reproduction</th>
                  <th scope="col" className="px-4 py-3.5">Developer</th>
                  <th scope="col" className="px-3 py-3.5">Status</th>
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
                        <span className="flex items-center gap-1 font-bold">
                          {bug.id}
                          <ExternalLink size={12} className="opacity-60" />
                        </span>
                      </td>

                      {/* Bug */}
                      <td className="max-w-xs px-4 py-3.5">
                        <span className="font-semibold text-[#172033] hover:text-[#2563EB] line-clamp-1 block">
                          {bug.title}
                        </span>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-[#667085]">
                          {bug.aiSummary}
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

                      {/* AI Reproduction */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReproBug(bug);
                            startReproSimulation(bug);
                          }}
                          title="Click to run reproduction simulation"
                          className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 border border-[#E5E7EB] hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                        >
                          <FlaskConical
                            size={13}
                            className={
                              bug.reproductionStatus === "Passed" || bug.reproStatus === "Passed"
                                ? "text-emerald-600"
                                : bug.reproductionStatus === "Failed" || bug.reproStatus === "Failed"
                                ? "text-red-600"
                                : "text-indigo-600"
                            }
                          />
                          <span className="font-semibold text-xs text-[#172033]">
                            {bug.reproductionStatus || bug.reproStatus || "Reproduced"}
                          </span>
                          <span className="text-[10px] text-[#667085]">
                            ({bug.reproductionSteps?.filter(s => s.status === 'pass').length || 4}/5 steps)
                          </span>
                        </button>
                      </td>

                      {/* Developer */}
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#2563EB]">
                            {bug.developer?.split(" ").map(n => n[0]).join("") || "Dev"}
                          </span>
                          <span className="text-xs text-[#172033] font-medium">
                            {bug.developer || "Unassigned"}
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

                      {/* QA Actions */}
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Verify Bug action */}
                          <button
                            type="button"
                            onClick={() => handleVerify(bug)}
                            title="Verify and Mark Resolved"
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            <span>Verify</span>
                          </button>

                          {/* Reopen Bug action */}
                          <button
                            type="button"
                            onClick={() => setReopenModalBug(bug)}
                            title="Reopen Bug with failure note"
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                          >
                            <RotateCcw size={12} />
                            <span>Reopen</span>
                          </button>

                          {/* Request More Information action */}
                          <button
                            type="button"
                            onClick={() => setInfoModalBug(bug)}
                            title="Request More Information"
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs font-medium text-[#667085] hover:bg-[#F7F8FA] hover:text-[#172033] transition-colors"
                          >
                            <FileQuestion size={13} />
                            <span className="hidden sm:inline">Info</span>
                          </button>

                          {/* Inspect Bug Details */}
                          <Link
                            to={`/bugs/${bug.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F7F8FA] hover:text-[#2563EB] transition-colors"
                            title="View Full Bug Details"
                          >
                            <Eye size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-sm font-semibold text-[#172033]">
                        No bugs found in this queue view
                      </p>
                      <p className="text-xs text-[#667085] mt-1">
                        Try switching tabs or adjusting search query.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Reproduction Step Inspector Modal */}
        {selectedReproBug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#172033]/40 backdrop-blur-xs"
              onClick={() => setSelectedReproBug(null)}
            />
            <div className="relative w-full max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FlaskConical size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      Automated Reproduction Bot Telemetry
                    </h3>
                    <p className="text-xs text-[#667085]">
                      {selectedReproBug.id} · {selectedReproBug.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startReproSimulation(selectedReproBug)}
                    disabled={reproRunning}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Play size={12} className={reproRunning ? "animate-spin" : ""} />
                    <span>{reproRunning ? "Running..." : "Run Reproduction"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedReproBug(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {/* Reproduction Progress Bar */}
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-[#172033]">
                      Status:{" "}
                      <span className={reproRunning ? "text-blue-600 animate-pulse" : reproResultText.includes("Failed") ? "text-red-600" : "text-emerald-600"}>
                        {reproRunning ? "Running..." : reproResultText}
                      </span>
                    </span>
                    <span className="font-mono text-[#2563EB]">{reproProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      style={{ width: `${reproProgress}%` }}
                      className={`h-full transition-all duration-300 ${
                        reproRunning
                          ? "bg-[#2563EB]"
                          : reproResultText.includes("Failed")
                          ? "bg-red-500"
                          : "bg-emerald-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 border border-[#E5E7EB] p-3 text-xs">
                  <span className="font-semibold text-[#172033]">AI Finding:</span>{" "}
                  <span className="text-[#667085]">{selectedReproBug.aiFinding || selectedReproBug.aiReason}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                    Step-by-Step Execution Log
                  </h4>
                  <div className="space-y-2">
                    {[
                      { step: 1, label: "Open Application", isError: false },
                      { step: 2, label: "Login", isError: false },
                      { step: 3, label: "Navigate to Checkout", isError: false },
                      { step: 4, label: "Click Pay", isError: selectedReproBug.id === "BUG-104" || selectedReproBug.id === "BUG-119" },
                      { step: 5, label: "Capture Error", isError: false },
                    ].map((step, idx) => {
                      const isExecuted = reproActiveStep >= step.step;
                      const isCurrent = reproRunning && reproActiveStep === idx;
                      const hasFailed = isExecuted && step.isError;
                      return (
                        <div
                          key={step.step}
                          className={`flex items-start gap-3 rounded-lg border p-2.5 text-xs transition-all ${
                            hasFailed
                              ? "border-red-200 bg-red-50/40 text-red-900"
                              : isExecuted
                              ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
                              : isCurrent
                              ? "border-blue-300 bg-blue-50/40 text-blue-900"
                              : "border-[#E5E7EB] bg-slate-50/40 text-[#667085]"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                              hasFailed
                                ? "bg-red-600 text-white"
                                : isExecuted
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-[#2563EB] text-white animate-spin"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {hasFailed ? "✕" : isExecuted ? "✓" : isCurrent ? "⋯" : step.step}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">
                              Step {step.step}: {step.label}
                            </p>
                            {hasFailed && (
                              <p className="text-[11px] font-semibold text-red-600 mt-0.5">
                                Failure observed here: 502 Bad Gateway response received.
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-bold uppercase">
                            {hasFailed ? "Failed ✕" : isExecuted ? "Passed ✓" : isCurrent ? "Executing..." : "Pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                  <span className="text-[11px] text-[#667085]">
                    Environment: {selectedReproBug.environment?.os}, {selectedReproBug.environment?.browser}
                  </span>
                  <Link
                    to={`/bugs/${selectedReproBug.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    <span>Open full bug report</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reopen Bug Dialog Modal */}
        {reopenModalBug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#172033]/40 backdrop-blur-xs"
              onClick={() => setReopenModalBug(null)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <RotateCcw size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      Reopen Bug
                    </h3>
                    <p className="text-xs text-[#667085]">
                      {reopenModalBug.id} · {reopenModalBug.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReopenModalBug(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleReopenSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Reason for reopening / failure details:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="e.g. Issue still reproduced in Safari 17.5 staging build 2.14.3. Session still drops at 5 minute mark."
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 text-xs text-[#172033] focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReopenModalBug(null)}
                    className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
                  >
                    <RotateCcw size={13} />
                    <span>Reopen Bug</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Request More Information Modal */}
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
                      Request More Information
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
                    Note for reporter / developer:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={infoNote}
                    onChange={(e) => setInfoNote(e.target.value)}
                    placeholder="e.g. Could you confirm which browser version and user account ID were used when this was observed?"
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
                    <span>Submit Request</span>
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
