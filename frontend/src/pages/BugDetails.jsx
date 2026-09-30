import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertOctagon,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  FileQuestion,
  Flag,
  FlaskConical,
  Globe,
  Lightbulb,
  MessageSquare,
  Monitor,
  Play,
  RotateCcw,
  Send,
  Server,
  ShieldAlert,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useBugs } from "../context/BugContext";

const STAGES = ["Reported", "Triaged", "Assigned", "In Progress", "QA", "Resolved"];

const SEVERITY_STYLES = {
  Critical: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  High: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const PRIORITY_STYLES = {
  P0: "bg-slate-900 text-white",
  P1: "bg-slate-700 text-white",
  P2: "bg-slate-200 text-slate-800",
  P3: "bg-slate-100 text-slate-600",
};

const STATUS_MAP_TO_STAGE = {
  New: 0,
  "AI Processing": 1,
  Assigned: 2,
  "In Progress": 3,
  "Needs Retest": 3,
  "Ready for QA": 4,
  QA: 4,
  Resolved: 5,
};

const DEVELOPERS_BY_TEAM = {
  Payments: ["Arun Kumar", "Divya Menon", "Arjun Mehta"],
  Frontend: ["Arun Kumar", "Priya", "Kavya Nair"],
  Backend: ["Rahul", "Priya", "Sanjay Patel"],
  Database: ["Neha Iyer", "Rahul"],
  Infrastructure: ["Rahul", "Deepak Sharma"],
};

export default function BugDetails() {
  const { bugId } = useParams();
  const navigate = useNavigate();
  const {
    bugs,
    currentRole,
    currentUser,
    updateBugStatus,
    assignBug,
    updateBugPriority,
    addBugComment,
    updateBugRepro,
  } = useBugs();

  // Find active bug or fallback
  const bug = useMemo(() => {
    return bugs.find((b) => b.id.toLowerCase() === bugId?.toLowerCase()) || bugs[0];
  }, [bugs, bugId]);

  const [commentText, setCommentText] = useState("");
  const [reproRunning, setReproRunning] = useState(false);
  const [reproProgress, setReproProgress] = useState(100);
  const [reproActiveStep, setReproActiveStep] = useState(5);
  const [reproResultText, setReproResultText] = useState(
    bug.id === "BUG-104" || bug.id === "BUG-119" || bug.reproductionStatus === "Failed"
      ? "Reproduction Failed (Error captured at Step 4)"
      : "Reproduction Successful"
  );
  const [toastMessage, setToastMessage] = useState(null);

  // Manager assignment state
  const [showReassignPanel, setShowReassignPanel] = useState(false);
  const [tempTeam, setTempTeam] = useState(bug.team || "Payments");
  const [tempDev, setTempDev] = useState(bug.developer || "Arun Kumar");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentStageIndex = STATUS_MAP_TO_STAGE[bug.status] ?? 3;

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addBugComment(bug.id, commentText.trim());
    setCommentText("");
    showToast("Update posted to timeline");
  };

  const handleRunRepro = () => {
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
      const isFailed = bug.id === "BUG-104" || bug.id === "BUG-119" || bug.reproductionStatus === "Failed";
      const finalMsg = isFailed ? "Reproduction Failed (Error captured at Step 4)" : "Reproduction Successful";
      setReproResultText(finalMsg);
      updateBugRepro(bug.id, isFailed ? "Reproduced" : "Passed");
      showToast(`${bug.id}: ${finalMsg}`);
    }, 1450);
  };

  // Role action handlers
  const handleStartWork = () => {
    updateBugStatus(bug.id, "In Progress", "Developer initiated investigation.");
    showToast(`${bug.id} marked as In Progress`);
  };

  const handleReadyForQA = () => {
    updateBugStatus(bug.id, "Ready for QA", "Fix deployed to staging. Handing off to QA.");
    showToast(`${bug.id} marked as Ready for QA`);
  };

  const handleVerify = () => {
    updateBugStatus(bug.id, "Resolved", "QA verified fix against test criteria.");
    showToast(`${bug.id} verified and resolved!`);
  };

  const handleReopen = () => {
    updateBugStatus(bug.id, "Needs Retest", "QA reopened bug for further retesting.");
    showToast(`${bug.id} reopened.`);
  };

  const handleApplyReassign = (e) => {
    e?.preventDefault();
    assignBug(bug.id, tempTeam, tempDev);
    setShowReassignPanel(false);
    showToast(`${bug.id} assigned to ${tempDev} (${tempTeam})`);
  };

  return (
    <MainLayout
      title={`Bug Details · ${bug.id}`}
      subtitle={bug.title}
    >
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Back Button & Top Meta Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#172033] shadow-xs hover:bg-[#F7F8FA] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#2563EB]">{bug.id}</span>
                <span className="text-xs text-[#667085]">·</span>
                <span className="text-xs text-[#667085]">Source: {bug.source}</span>
                <span className="text-xs text-[#667085]">·</span>
                <span className="text-xs text-[#667085]">Reported {bug.reportedDate}</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#172033] mt-0.5">
                {bug.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${SEVERITY_STYLES[bug.severity]}`}>
              <ShieldAlert size={13} className="mr-1" />
              {bug.severity}
            </span>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${PRIORITY_STYLES[bug.priority]}`}>
              <Flag size={12} className="mr-1" />
              {bug.priority}
            </span>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2563EB] ring-1 ring-inset ring-blue-600/20">
              {bug.status}
            </span>
          </div>
        </div>

        {/* Status Pipeline: Reported → Triaged → Assigned → In Progress → QA → Resolved */}
        <section aria-label="Bug status pipeline" className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-4">
            Resolution Pipeline Progression
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={stage}
                  className={`flex flex-col p-3 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? "border-[#2563EB] bg-blue-50/70 ring-1 ring-[#2563EB]"
                      : isPast
                      ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
                      : "border-[#E5E7EB] bg-[#F7F8FA] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isPast ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                        ✓
                      </span>
                    ) : isCurrent ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white text-[10px] font-bold animate-pulse">
                        ●
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${isCurrent ? "text-[#2563EB]" : "text-[#172033]"}`}>
                    {stage}
                  </span>
                  <span className="text-[10px] text-[#667085] mt-0.5">
                    {isCurrent ? "Active Stage" : isPast ? "Completed" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column (8 cols): Reports, Expected/Actual, Environment, Reproduction, AI Finding, Duplicates */}
          <div className="space-y-6 lg:col-span-8">
            {/* Original Report */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[#667085]">
                  <MessageSquare size={16} />
                </span>
                <h2 className="text-sm font-bold text-[#172033]">
                  Original Report
                </h2>
                <span className="text-xs text-[#667085]">· Submitted via {bug.source}</span>
              </div>
              <div className="rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] p-3.5">
                <p className="font-mono text-xs text-[#172033] leading-relaxed">
                  "{bug.originalReport || bug.title}"
                </p>
              </div>
            </section>

            {/* AI Standardized Summary */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <Sparkles size={16} />
                  </span>
                  <h2 className="text-sm font-bold text-[#172033]">
                    AI Standardized Summary
                  </h2>
                </div>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Normalized & Cleaned
                </span>
              </div>
              <p className="text-xs font-semibold text-[#172033] leading-relaxed">
                {bug.aiSummary}
              </p>
            </section>

            {/* Expected vs Actual Behavior */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-[#172033] border-b border-[#E5E7EB] pb-3 mb-4">
                Behavior Specification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1.5">
                    <CheckCircle2 size={15} />
                    <span>Expected Behavior</span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    {bug.expectedBehavior || "Feature functions as expected without error."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-800 mb-1.5">
                    <AlertOctagon size={15} />
                    <span>Actual Behavior</span>
                  </div>
                  <p className="text-xs text-red-950 leading-relaxed">
                    {bug.actualBehavior || "System returned an unexpected failure state."}
                  </p>
                </div>
              </div>
            </section>

            {/* Environment Telemetry */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <h2 className="text-sm font-bold text-[#172033] border-b border-[#E5E7EB] pb-3 mb-4">
                Captured Environment Telemetry
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA]">
                  <span className="text-[11px] text-[#667085] flex items-center gap-1">
                    <Cpu size={12} /> OS
                  </span>
                  <p className="mt-1 text-xs font-bold text-[#172033]">
                    {bug.environment?.os || "Windows 11"}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA]">
                  <span className="text-[11px] text-[#667085] flex items-center gap-1">
                    <Globe size={12} /> Browser
                  </span>
                  <p className="mt-1 text-xs font-bold text-[#172033]">
                    {bug.environment?.browser || "Chrome 126"}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA]">
                  <span className="text-[11px] text-[#667085] flex items-center gap-1">
                    <Monitor size={12} /> Device
                  </span>
                  <p className="mt-1 text-xs font-bold text-[#172033]">
                    {bug.environment?.device || "Desktop"}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA]">
                  <span className="text-[11px] text-[#667085] flex items-center gap-1">
                    <Server size={12} /> Target Env
                  </span>
                  <p className="mt-1 text-xs font-bold text-[#172033]">
                    {bug.environment?.environment || "Production"}
                  </p>
                </div>
              </div>
            </section>

            {/* Reproduction Steps (Interactive Step-by-Step with Pass/Fail) */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FlaskConical size={16} />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-[#172033]">
                      Automated Reproduction Bot Telemetry
                    </h2>
                    <p className="text-xs text-[#667085]">
                      Simulate headless browser reproduction and error capture
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunRepro}
                  disabled={reproRunning}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Play size={12} className={reproRunning ? "animate-spin" : ""} />
                  <span>{reproRunning ? "Running..." : "Run Reproduction"}</span>
                </button>
              </div>

              {/* Progress and status display */}
              <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-3.5">
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

              {/* Steps list */}
              <div className="space-y-2.5">
                {[
                  { step: 1, label: "Open Application", isError: false },
                  { step: 2, label: "Login", isError: false },
                  { step: 3, label: "Navigate to Checkout", isError: false },
                  { step: 4, label: "Click Pay", isError: bug.id === "BUG-104" || bug.id === "BUG-119" || bug.reproductionStatus === "Failed" },
                  { step: 5, label: "Capture Error", isError: false },
                ].map((step, idx) => {
                  const isExecuted = reproActiveStep >= step.step;
                  const isCurrent = reproRunning && reproActiveStep === idx;
                  const hasFailed = isExecuted && step.isError;
                  return (
                    <div
                      key={step.step}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        hasFailed
                          ? "border-red-200 bg-red-50/50"
                          : isExecuted
                          ? "border-emerald-100 bg-emerald-50/30"
                          : isCurrent
                          ? "border-blue-300 bg-blue-50/30"
                          : "border-[#E5E7EB] bg-[#F7F8FA]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
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
                        <div>
                          <p className="text-xs font-semibold text-[#172033]">
                            Step {step.step}: {step.label}
                          </p>
                          {hasFailed && (
                            <p className="text-[11px] font-semibold text-red-600 mt-0.5">
                              Failure triggered here: 502 Bad Gateway response received.
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          hasFailed
                            ? "bg-red-100 text-red-700"
                            : isExecuted
                            ? "bg-emerald-100 text-emerald-700"
                            : isCurrent
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {hasFailed ? "Failed ✕" : isExecuted ? "Passed ✓" : isCurrent ? "Executing..." : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* AI Finding & Duplicates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* AI Finding */}
              <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Lightbulb size={16} />
                  </span>
                  <h2 className="text-sm font-bold text-[#172033]">
                    AI Root Cause Finding
                  </h2>
                </div>
                <p className="text-xs text-[#172033] leading-relaxed">
                  {bug.aiFinding || "Automated telemetry analysis pinpointed root-cause in service payload handling."}
                </p>
              </section>

              {/* Duplicate Bugs */}
              <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3 mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Copy size={16} />
                  </span>
                  <h2 className="text-sm font-bold text-[#172033]">
                    Duplicate Match Detection
                  </h2>
                </div>
                {bug.duplicates && bug.duplicates.length > 0 ? (
                  <div className="space-y-2">
                    {bug.duplicates.map((dup) => (
                      <div
                        key={dup.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#2563EB]">{dup.id}</span>
                          <p className="text-[#667085] mt-0.5 line-clamp-1">{dup.title}</p>
                        </div>
                        <span className="text-[11px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">
                          {dup.similarity}% match
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#667085]">
                    No duplicate bug reports detected across workspace repositories.
                  </p>
                )}
              </section>
            </div>
          </div>

          {/* Right Column (4 cols): AI Confidence & Reason, Assignment, Role Actions, Timeline */}
          <div className="space-y-6 lg:col-span-4">
            {/* AI Confidence & Reason Card */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#2563EB]" /> AI Triage Assessment
                </h2>
                <span className="text-xs font-bold text-[#2563EB]">
                  {bug.aiConfidence || 94}% Confidence
                </span>
              </div>

              {/* Confidence progress bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  style={{ width: `${bug.aiConfidence || 94}%` }}
                  className="h-full bg-[#2563EB] rounded-full"
                />
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[#667085] font-medium">Classification Reason:</span>
                  <p className="text-[#172033] font-semibold mt-0.5">
                    {bug.aiReason || "Payment failure blocks a core transaction workflow with revenue impact."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]">
                  <div>
                    <span className="text-[11px] text-[#667085]">Suggested Team</span>
                    <p className="font-bold text-[#172033]">{bug.team}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#667085]">Suggested Dev</span>
                    <p className="font-bold text-[#172033]">{bug.developer}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ownership Assignment Card */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Ownership Assignment
                  </h2>
                  <p className="text-[11px] text-[#667085]">
                    AI Suggested: <strong className="text-violet-700">{bug.team} · {bug.developer}</strong>
                  </p>
                </div>
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  {bug.team}
                </span>
              </div>

              {/* Current Assignee Display */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] mb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#2563EB]">
                  {bug.developer?.split(" ").map(n => n[0]).join("") || "AK"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#172033]">{bug.developer}</p>
                  <p className="text-[11px] text-[#667085]">{bug.team} Team</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {bug.status}
                </span>
              </div>

              {/* Manager Assignment Controls */}
              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#172033] mb-1">
                      Team
                    </label>
                    <select
                      value={tempTeam}
                      onChange={(e) => {
                        const newTeam = e.target.value;
                        setTempTeam(newTeam);
                        const devList = DEVELOPERS_BY_TEAM[newTeam] || [];
                        if (devList.length > 0) setTempDev(devList[0]);
                      }}
                      className="w-full h-8 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                    >
                      {Object.keys(DEVELOPERS_BY_TEAM).map((team) => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#172033] mb-1">
                      Developer
                    </label>
                    <select
                      value={tempDev}
                      onChange={(e) => setTempDev(e.target.value)}
                      className="w-full h-8 rounded-lg border border-[#E5E7EB] bg-white px-2 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                    >
                      {(DEVELOPERS_BY_TEAM[tempTeam] || [tempDev]).map((dev) => (
                        <option key={dev} value={dev}>{dev}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyReassign}
                  className="w-full inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
                >
                  <UserCheck size={13} />
                  <span>Assign Bug</span>
                </button>
              </div>
            </section>

            {/* Role-Specific Quick Actions */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                  Role Actions ({currentRole})
                </h2>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                  {currentUser.roleLabel}
                </span>
              </div>

              <div className="space-y-2">
                {/* Developer Actions */}
                {currentRole === "developer" && (
                  <>
                    {bug.status === "Assigned" && (
                      <button
                        type="button"
                        onClick={handleStartWork}
                        className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#2563EB] text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
                      >
                        <Play size={13} />
                        <span>Start Work (In Progress)</span>
                      </button>
                    )}

                    {(bug.status === "In Progress" || bug.status === "Needs Retest") && (
                      <>
                        <button
                          type="button"
                          onClick={handleReadyForQA}
                          className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-indigo-600 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Ready for QA</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleVerify}
                          className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle2 size={13} />
                          <span>Resolve Bug</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => addBugComment(bug.id, "Developer requested additional telemetry logs.")}
                      className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#172033] hover:bg-[#F7F8FA] transition-colors"
                    >
                      <FileQuestion size={13} />
                      <span>Request More Info</span>
                    </button>
                  </>
                )}

                {/* QA Actions */}
                {currentRole === "qa" && (
                  <>
                    <button
                      type="button"
                      onClick={handleVerify}
                      className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 size={13} />
                      <span>Verify & Resolve Bug</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReopen}
                      className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <RotateCcw size={13} />
                      <span>Reopen Bug (Needs Retest)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => addBugComment(bug.id, "QA requested clarification on test steps.")}
                      className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#172033] hover:bg-[#F7F8FA] transition-colors"
                    >
                      <FileQuestion size={13} />
                      <span>Request More Info</span>
                    </button>
                  </>
                )}

                {/* Manager Actions */}
                {currentRole === "manager" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowReassignPanel(true)}
                      className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#2563EB] text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
                    >
                      <UserCheck size={13} />
                      <span>Reassign Team / Developer</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => updateBugPriority(bug.id, "Critical")}
                        className="h-8 rounded-lg border border-slate-300 bg-white text-[11px] font-semibold text-slate-900 hover:bg-slate-100"
                      >
                        Escalate to Critical
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify()}
                        className="h-8 rounded-lg border border-emerald-300 bg-emerald-50 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
                      >
                        Force Resolve
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Activity & Comment Timeline */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-3">
                Activity & Discussion ({(bug.activities || bug.notes || []).length})
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
                {(bug.activities || bug.notes || []).length > 0 ? (
                  (bug.activities || bug.notes || []).map((activity, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#172033]">{activity.user || activity.author || "Team Member"}</span>
                          <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-semibold">{activity.role || "Engineering"}</span>
                        </div>
                        <span className="text-[10px] text-[#667085]">{activity.time}</span>
                      </div>
                      <p className="text-[#172033] leading-relaxed">{activity.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#667085] italic">No updates posted yet.</p>
                )}
              </div>

              {/* Comment submission form */}
              <form onSubmit={handlePostComment} className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post an engineering update or comment..."
                  className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-2.5 text-xs text-[#172033] focus:border-[#2563EB] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#2563EB] text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-40"
                >
                  <Send size={12} />
                  <span>Post Update</span>
                </button>
              </form>
            </section>
          </div>
        </div>

        {/* Manager Reassign Modal */}
        {showReassignPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#172033]/40 backdrop-blur-xs"
              onClick={() => setShowReassignPanel(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-bold text-[#172033]">
                  Reassign {bug.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReassignPanel(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleApplyReassign} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Target Team
                  </label>
                  <select
                    value={tempTeam}
                    onChange={(e) => setTempTeam(e.target.value)}
                    className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="Payments">Payments</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Target Developer
                  </label>
                  <input
                    type="text"
                    required
                    value={tempDev}
                    onChange={(e) => setTempDev(e.target.value)}
                    className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setShowReassignPanel(false)}
                    className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                  >
                    <Check size={14} />
                    <span>Apply Reassignment</span>
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
