import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  FlaskConical,
  Inbox,
  Layers,
  Mail,
  MessageSquare,
  Plus,
  Radio,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Star,
  UserCheck,
  X,
} from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { useBugs } from "../context/BugContext";

const SOURCE_ICONS = {
  "Customer Feedback": MessageSquare,
  Email: Mail,
  "QA Report": ClipboardCheck,
  "App Review": Star,
  "Manual Report": FileText,
  "External Bug Tracker": Radio,
};

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

const TRIAGE_FLOW_STEPS = [
  { label: "Incoming Source", desc: "Customer, Email, QA", icon: Inbox },
  { label: "AI Analysis", desc: "Standardize & NLP", icon: Sparkles },
  { label: "Duplicate Detection", desc: "Vector similarity", icon: Copy },
  { label: "Reproduction", desc: "Headless step runner", icon: FlaskConical },
  { label: "Severity / Priority", desc: "P0-P3 & Impact", icon: ShieldAlert },
  { label: "Team", desc: "Service ownership", icon: Layers },
  { label: "Developer", desc: "Smart assignment", icon: UserCheck },
];

const AI_SIMULATION_STEPS = [
  "Analyzing report...",
  "Extracting information...",
  "Checking duplicates...",
  "Preparing reproduction...",
  "Determining severity...",
  "Suggesting owner...",
];

export default function BugInbox() {
  const { bugs, createBug, completeAiTriage, assignBug } = useBugs();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All Sources");
  const [selectedAiStatus, setSelectedAiStatus] = useState("All");
  const [selectedTriageBug, setSelectedTriageBug] = useState(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // AI Triage 6-stage simulation state
  const [triageSimulating, setTriageSimulating] = useState(false);
  const [triageStepIndex, setTriageStepIndex] = useState(6);

  // New bug simulation form state
  const [newTitle, setNewTitle] = useState("Payment button gives an error.");
  const [newSource, setNewSource] = useState("Customer Feedback");
  const [newSeverity, setNewSeverity] = useState("Critical");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const runAiTriageSimulation = (bugToTriage) => {
    const target = bugToTriage || selectedTriageBug;
    if (!target) return;
    setTriageSimulating(true);
    setTriageStepIndex(0);

    const stepInterval = 250;
    AI_SIMULATION_STEPS.forEach((step, idx) => {
      setTimeout(() => {
        setTriageStepIndex(idx);
        if (idx === AI_SIMULATION_STEPS.length - 1) {
          setTimeout(() => {
            setTriageSimulating(false);
            setTriageStepIndex(AI_SIMULATION_STEPS.length);
            const isPayment = target.title.toLowerCase().includes("pay");
            completeAiTriage(target.id, {
              standardizedTitle: isPayment ? "Payment Transaction Failure" : target.title,
              aiSummary: isPayment ? "Payment transaction fails during checkout. Gateway returns 502 Bad Gateway from /payments/authorize." : target.aiSummary,
              severity: isPayment ? "Critical" : target.severity || "High",
              priority: isPayment ? "High" : target.priority || "Medium",
              confidence: 94,
              reason: isPayment ? "Payment failure blocks a core transaction workflow." : "Issue impacts active users in core journey.",
              team: isPayment ? "Payments" : target.team || "Frontend",
              developer: isPayment ? "Arun Kumar" : target.developer || "Priya",
              duplicates: [
                { id: "BUG-098", title: "Payment API 502 on Checkout", similarity: 92 },
              ],
            });
            showToast(`${target.id} AI Triage Complete!`);
          }, 300);
        }
      }, (idx + 1) * stepInterval);
    });
  };

  // Filtered bugs
  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      // Tab filter
      if (activeTab === "new" && bug.status !== "New") return false;
      if (activeTab === "ai-processing" && bug.status !== "AI Processing") return false;
      if (activeTab === "ready-assign" && (bug.status !== "New" && bug.status !== "AI Processing" && bug.status === "Assigned")) return false;
      if (activeTab === "assigned" && bug.status !== "Assigned" && bug.status !== "In Progress") return false;

      // Severity filter
      if (selectedSeverity !== "All" && bug.severity !== selectedSeverity) return false;

      // Source filter
      if (selectedSource !== "All Sources" && selectedSource !== "all" && bug.source !== selectedSource) return false;

      // AI Status filter
      if (selectedAiStatus !== "All") {
        if (selectedAiStatus === "Processing" && bug.aiStatus !== "Processing" && bug.status !== "AI Processing") return false;
        if (selectedAiStatus === "Analyzed" && bug.aiStatus !== "Analyzed" && bug.aiStatus !== "AI Triaged") return false;
        if (selectedAiStatus === "Needs Review" && bug.aiStatus !== "Needs Review") return false;
      }

      // Multi-field Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          bug.id?.toLowerCase().includes(q) ||
          bug.title?.toLowerCase().includes(q) ||
          bug.description?.toLowerCase().includes(q) ||
          bug.aiSummary?.toLowerCase().includes(q) ||
          bug.originalReport?.toLowerCase().includes(q) ||
          bug.source?.toLowerCase().includes(q) ||
          bug.team?.toLowerCase().includes(q) ||
          bug.developer?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [bugs, activeTab, selectedSeverity, selectedSource, selectedAiStatus, searchQuery]);

  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    const created = createBug({
      title: newTitle,
      source: newSource,
      severity: newSeverity,
      originalReport: newTitle,
      aiSummary:
        newTitle.includes("Payment")
          ? "Payment transaction fails during checkout after the Pay button is clicked. 502 Bad Gateway observed on authorization payload."
          : `Standardized AI summary: ${newTitle} affecting primary user workflow.`,
      team: newTitle.includes("Payment") ? "Payments" : "Frontend",
      developer: newTitle.includes("Payment") ? "Arun Kumar" : "Priya Raman",
    });

    setShowSimulateModal(false);
    showToast(`New bug ${created.id} simulated! Starting AI Triage...`);
    setSelectedTriageBug(created);
    runAiTriageSimulation(created);
  };

  const handleQuickAssign = (bug) => {
    const targetTeam = bug.team || "Payments";
    const targetDev = bug.developer || "Arun Kumar";
    assignBug(bug.id, targetTeam, targetDev);
    showToast(`${bug.id} assigned to ${targetDev} (${targetTeam})`);
    setSelectedTriageBug((prev) => (prev ? { ...prev, status: "Assigned" } : null));
  };

  return (
    <MainLayout
      title="Bug Inbox"
      subtitle="Central incoming bug intake, multi-source ingestion, and automated AI triage flow"
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

        {/* Visual AI Triage Flow Banner */}
        <section aria-label="AI triage flow" className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E7EB] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                <Sparkles size={16} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#172033]">
                  BugFlow AI Ingestion & Triage Pipeline
                </h2>
                <p className="text-xs text-[#667085]">
                  Automated routing from raw report to assigned engineer in under 30 seconds
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              <span>Simulate New Report</span>
            </button>
          </div>

          {/* Visual Step-by-Step Flow */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {TRIAGE_FLOW_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="relative flex flex-col items-center text-center p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-[#2563EB] shadow-xs mb-1.5">
                    <Icon size={16} />
                  </span>
                  <span className="text-xs font-bold text-[#172033] line-clamp-1">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-[#667085] mt-0.5 line-clamp-1">
                    {step.desc}
                  </span>

                  {idx < TRIAGE_FLOW_STEPS.length - 1 && (
                    <ChevronRight
                      size={14}
                      className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 text-slate-400 hidden lg:block z-10"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Central Incoming Bug Table Card */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden">
          {/* Card Filter Bar */}
          <div className="border-b border-[#E5E7EB] px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Tabs: New Reports, AI Processing, Ready for Assignment, Assigned */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {[
                  { id: "all", label: `All Ingested (${bugs.length})` },
                  { id: "new", label: `New Reports (${bugs.filter(b => b.status === 'New').length})` },
                  { id: "ai-processing", label: `AI Processing (${bugs.filter(b => b.status === 'AI Processing').length})` },
                  { id: "ready-assign", label: `Ready for Assignment` },
                  { id: "assigned", label: `Assigned (${bugs.filter(b => b.status === 'Assigned' || b.status === 'In Progress').length})` },
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

              {/* Multi-filter controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Severity Filter */}
                <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                  <span className="font-semibold">Severity:</span>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="h-8 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-2 text-xs font-semibold text-[#172033] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="All">All</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                  <span className="font-semibold flex items-center gap-1">
                    <Filter size={12} /> Source:
                  </span>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="h-8 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-2 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="All Sources">All Sources</option>
                    <option value="Email">Email</option>
                    <option value="Customer Feedback">Customer Feedback</option>
                    <option value="QA Report">QA Report</option>
                    <option value="App Review">App Review</option>
                    <option value="Manual Report">Manual Report</option>
                    <option value="External Bug Tracker">External Bug Tracker</option>
                  </select>
                </div>

                {/* AI Status Filter */}
                <div className="flex items-center gap-1.5 text-xs text-[#667085]">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles size={12} /> AI Status:
                  </span>
                  <select
                    value={selectedAiStatus}
                    onChange={(e) => setSelectedAiStatus(e.target.value)}
                    className="h-8 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-2 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="All">All</option>
                    <option value="Processing">Processing</option>
                    <option value="Analyzed">Analyzed</option>
                    <option value="Needs Review">Needs Review</option>
                  </select>
                </div>

                {(selectedSeverity !== "All" || selectedSource !== "All Sources" || selectedAiStatus !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSeverity("All");
                      setSelectedSource("All Sources");
                      setSelectedAiStatus("All");
                    }}
                    className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
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
                  <th scope="col" className="px-3 py-3.5">Source</th>
                  <th scope="col" className="px-3 py-3.5">AI Status</th>
                  <th scope="col" className="px-3 py-3.5">Severity</th>
                  <th scope="col" className="px-3 py-3.5">Priority</th>
                  <th scope="col" className="px-4 py-3.5">Suggested Team</th>
                  <th scope="col" className="px-3 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] bg-white">
                {filteredBugs.length > 0 ? (
                  filteredBugs.map((bug) => {
                    const SourceIcon = SOURCE_ICONS[bug.source] || MessageSquare;
                    return (
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

                        {/* Bug Title & Snippet */}
                        <td className="max-w-xs px-4 py-3.5">
                          <span className="font-semibold text-[#172033] hover:text-[#2563EB] line-clamp-1 text-left block">
                            {bug.title}
                          </span>
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-[#667085]">
                            {bug.aiSummary || bug.originalReport}
                          </p>
                        </td>

                        {/* Source with Badge */}
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            <SourceIcon size={12} className="text-[#667085]" />
                            {bug.source}
                          </span>
                        </td>

                        {/* AI Status */}
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">
                            <Sparkles size={11} className="text-violet-600" />
                            {bug.aiStatus || "AI Triaged"}
                          </span>
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
                        <td className="whitespace-nowrap px-3 py-3.5 font-bold text-slate-700">
                          {bug.priority}
                        </td>

                        {/* Suggested Team */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#172033]">{bug.team}</span>
                            <span className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded font-medium">
                              AI Suggested
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

                        {/* Action: Inspect AI Triage */}
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTriageBug(bug);
                                if (bug.status === "AI Processing" || bug.aiStatus === "Processing") {
                                  runAiTriageSimulation(bug);
                                }
                              }}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-[#172033] shadow-xs hover:bg-[#F7F8FA] hover:border-slate-300 transition-colors"
                            >
                              <Sparkles size={12} className="text-[#2563EB]" />
                              <span>Inspect AI Triage</span>
                            </button>

                            <Link
                              to={`/bugs/${bug.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#667085] hover:bg-[#F7F8FA] hover:text-[#2563EB] transition-colors"
                              title="View Full Details"
                            >
                              <Eye size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center">
                      <Inbox size={24} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-sm font-semibold text-[#172033]">
                        No incoming reports found matching this filter
                      </p>
                      <p className="text-xs text-[#667085] mt-1">
                        Try resetting filters or click "Simulate New Report" above.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Triage Simulation & Information Modal */}
        {selectedTriageBug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#172033]/40 backdrop-blur-xs"
              onClick={() => setSelectedTriageBug(null)}
            />
            <div className="relative w-full max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      AI Triage Summary & Telemetry
                    </h3>
                    <p className="text-xs text-[#667085]">
                      {selectedTriageBug.id} · Source: {selectedTriageBug.source}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => runAiTriageSimulation(selectedTriageBug)}
                    disabled={triageSimulating}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-[#172033] hover:bg-[#F7F8FA] disabled:opacity-50"
                  >
                    <Sparkles size={12} className="text-[#2563EB]" />
                    <span>{triageSimulating ? "Analyzing..." : "Re-run Triage"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTriageBug(null)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Triage Simulation Progress Display */}
              {triageSimulating ? (
                <div className="mt-4 p-5 rounded-xl border border-violet-200 bg-violet-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-900 flex items-center gap-2">
                      <Sparkles size={14} className="animate-spin text-[#2563EB]" />
                      Simulating Autonomous AI Triage...
                    </span>
                    <span className="font-mono text-xs font-bold text-[#2563EB]">
                      {Math.round(((triageStepIndex + 1) / AI_SIMULATION_STEPS.length) * 100)}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    {AI_SIMULATION_STEPS.map((stepText, idx) => {
                      const isDone = triageStepIndex > idx;
                      const isCurrent = triageStepIndex === idx;
                      return (
                        <div
                          key={stepText}
                          className={`flex items-center gap-2.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${
                            isDone
                              ? "bg-white text-emerald-800 border border-emerald-200"
                              : isCurrent
                              ? "bg-blue-100 text-[#2563EB] font-bold border border-blue-300 animate-pulse"
                              : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                              isDone
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-[#2563EB] text-white"
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {isDone ? "✓" : isCurrent ? "●" : idx + 1}
                          </span>
                          <span>{stepText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 space-y-4 text-xs">
                {/* Raw Report */}
                <div className="rounded-xl bg-slate-50 border border-[#E5E7EB] p-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#667085]">
                    Raw Ingested Report:
                  </span>
                  <p className="mt-1 font-mono text-xs text-[#172033]">
                    "{selectedTriageBug.originalReport || selectedTriageBug.title}"
                  </p>
                </div>

                {/* AI Standardized */}
                <div className="rounded-xl bg-blue-50/50 border border-blue-200 p-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
                    <Sparkles size={13} /> AI Standardized Summary:
                  </span>
                  <p className="mt-1 text-xs font-semibold text-[#172033]">
                    {selectedTriageBug.aiSummary}
                  </p>
                </div>

                {/* Severity, Priority, Confidence */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-[#E5E7EB] bg-white">
                    <span className="text-[11px] text-[#667085]">Severity</span>
                    <p className="text-sm font-bold text-[#172033] mt-0.5">
                      {selectedTriageBug.severity}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-[#E5E7EB] bg-white">
                    <span className="text-[11px] text-[#667085]">Priority</span>
                    <p className="text-sm font-bold text-[#172033] mt-0.5">
                      {selectedTriageBug.priority}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-[#E5E7EB] bg-white">
                    <span className="text-[11px] text-[#667085]">AI Confidence</span>
                    <p className="text-sm font-bold text-[#2563EB] mt-0.5">
                      {selectedTriageBug.aiConfidence || 94}%
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-3 rounded-lg border border-[#E5E7EB] bg-slate-50">
                  <span className="font-semibold text-[#172033]">AI Justification:</span>
                  <p className="text-[#667085] mt-0.5">
                    {selectedTriageBug.aiReason}
                  </p>
                </div>

                {/* Suggested Team & Developer */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-[#E5E7EB] bg-white">
                  <div>
                    <span className="text-[11px] text-[#667085]">Suggested Team</span>
                    <p className="text-xs font-bold text-[#172033] mt-0.5">
                      {selectedTriageBug.team}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#667085]">Suggested Developer</span>
                    <p className="text-xs font-bold text-[#172033] mt-0.5">
                      {selectedTriageBug.developer}
                    </p>
                  </div>
                </div>

                {/* Duplicate Detection */}
                {selectedTriageBug.duplicates && selectedTriageBug.duplicates.length > 0 && (
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60">
                    <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <Copy size={13} /> Duplicate Match Detected:
                    </span>
                    {selectedTriageBug.duplicates.map((dup) => (
                      <p key={dup.id} className="mt-1 text-amber-800">
                        <strong>{dup.id}</strong> — {dup.title} ({dup.similarity}% similarity)
                      </p>
                    ))}
                  </div>
                )}

                {/* Modal footer actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                  <Link
                    to={`/bugs/${selectedTriageBug.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    <span>Open full details page</span>
                    <ExternalLink size={12} />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTriageBug(null)}
                      className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA]"
                    >
                      Close
                    </button>
                    {selectedTriageBug.status !== "Assigned" && selectedTriageBug.status !== "In Progress" && (
                      <button
                        type="button"
                        onClick={() => handleQuickAssign(selectedTriageBug)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                      >
                        <UserCheck size={14} />
                        <span>Confirm & Assign</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simulate New Report Modal */}
        {showSimulateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#172033]/40 backdrop-blur-xs"
              onClick={() => setShowSimulateModal(false)}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <Plus size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#172033]">
                      Simulate Incoming Bug Report
                    </h3>
                    <p className="text-xs text-[#667085]">
                      Test automated AI triage ingestion pipeline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSimulateSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Raw User / Tester Report
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Payment button gives an error on checkout."
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-3 text-xs text-[#172033] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                      Ingestion Source
                    </label>
                    <select
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                    >
                      <option value="Customer Feedback">Customer Feedback</option>
                      <option value="Email">Email</option>
                      <option value="QA Report">QA Report</option>
                      <option value="App Review">App Review</option>
                      <option value="Manual Report">Manual Report</option>
                      <option value="External Bug Tracker">External Bug Tracker</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                      Initial Severity
                    </label>
                    <select
                      value={newSeverity}
                      onChange={(e) => setNewSeverity(e.target.value)}
                      className="w-full h-10 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] px-3 text-xs font-medium text-[#172033] focus:border-[#2563EB] focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setShowSimulateModal(false)}
                    className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-xs font-semibold text-[#667085] hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                  >
                    <Sparkles size={14} />
                    <span>Run AI Triage</span>
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
