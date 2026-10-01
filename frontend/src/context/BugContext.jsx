import { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_BUGS, INITIAL_AI_ACTIVITY, USERS_BY_ROLE } from "../data/mockData";

const BugContext = createContext(null);

export function BugProvider({ children }) {
  const [bugs, setBugs] = useState(INITIAL_BUGS);
  const [aiActivity, setAiActivity] = useState(INITIAL_AI_ACTIVITY);

  // Auth state persisted in localStorage
  const [authSession, setAuthSession] = useState(() => {
    try {
      const stored = localStorage.getItem("bugflow_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem("bugflow_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const stored = localStorage.getItem("bugflow_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.role) return u.role;
      }
    } catch {
      // Fallback
    }
    return "developer";
  });

  const [authLoading, setAuthLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      if (!authSession?.access_token) {
        if (isMounted) setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${authSession.access_token}`,
          },
        });
        const data = await res.json();
        if (!isMounted) return;

        if (data.success && data.user) {
          setAuthUser(data.user);
          if (data.user.role) {
            setCurrentRole(data.user.role);
          }
        } else {
          // Token expired or invalid
          setAuthSession(null);
          setAuthUser(null);
          localStorage.removeItem("bugflow_session");
          localStorage.removeItem("bugflow_user");
        }
      } catch {
        // Network failure; keep cached credentials
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [authSession?.access_token]);

  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || "Authentication failed" };
      }
      setAuthSession(data.session);
      setAuthUser(data.user);
      if (data.user?.role) {
        setCurrentRole(data.user.role);
      }
      localStorage.setItem("bugflow_session", JSON.stringify(data.session));
      localStorage.setItem("bugflow_user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const register = async (email, password, name, role) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json();
      if (!data.success) {
        return { success: false, error: data.error || "Registration failed" };
      }
      if (data.session) {
        setAuthSession(data.session);
        setAuthUser(data.user);
        if (data.user?.role) {
          setCurrentRole(data.user.role);
        }
        localStorage.setItem("bugflow_session", JSON.stringify(data.session));
        localStorage.setItem("bugflow_user", JSON.stringify(data.user));
      }
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    setAuthSession(null);
    setAuthUser(null);
    localStorage.removeItem("bugflow_session");
    localStorage.removeItem("bugflow_user");
  };

  const roleConfig = USERS_BY_ROLE[currentRole] || USERS_BY_ROLE.developer;
  const currentUser = authUser
    ? {
        role: authUser.role || currentRole,
        name: authUser.name || roleConfig.name,
        roleLabel: roleConfig.roleLabel || `${(authUser.role || "developer").toUpperCase()} Engineer`,
        email: authUser.email,
        team: roleConfig.team || "Core Engineering",
        avatar: authUser.name
          ? authUser.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : roleConfig.avatar,
      }
    : roleConfig;

  const updateBugStatus = (bugId, newStatus, noteText = null) => {
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        const newActivity = {
          user: currentUser.name,
          role: currentUser.roleLabel,
          time: "Just now",
          text: noteText || `Status transitioned to "${newStatus}"`,
        };
        const currentActivities = bug.activities || bug.notes || [];
        const updatedActivities = [newActivity, ...currentActivities];

        return {
          ...bug,
          status: newStatus,
          activities: updatedActivities,
          notes: updatedActivities,
        };
      })
    );

    setAiActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        bugId,
        text: `status changed to "${newStatus}" by ${currentUser.name}`,
        icon: newStatus === "Resolved" ? "CheckCircle2" : "RotateCcw",
        time: "Just now",
        tone: newStatus === "Resolved" ? "emerald" : "blue",
      },
      ...prev,
    ]);
  };

  const reassignBug = (bugId, newTeam, newDeveloper, reason = null) => {
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        const newActivity = {
          user: currentUser.name,
          role: currentUser.roleLabel,
          time: "Just now",
          text: `Reassigned to ${newDeveloper} (${newTeam})${reason ? `: ${reason}` : ""}`,
        };
        const currentActivities = bug.activities || bug.notes || [];
        const updatedActivities = [newActivity, ...currentActivities];

        return {
          ...bug,
          team: newTeam,
          developer: newDeveloper,
          status: bug.status === "New" || bug.status === "AI Processing" ? "Assigned" : bug.status,
          activities: updatedActivities,
          notes: updatedActivities,
        };
      })
    );

    setAiActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        bugId,
        text: `reassigned to ${newDeveloper} (${newTeam}) by ${currentUser.name}`,
        icon: "Users",
        time: "Just now",
        tone: "blue",
      },
      ...prev,
    ]);
  };

  const assignBug = (bugId, team, developer) => {
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        const newActivity = {
          user: currentUser.name,
          role: currentUser.roleLabel,
          time: "Just now",
          text: `Assigned to ${developer} (${team})`,
        };
        const currentActivities = bug.activities || bug.notes || [];
        const updatedActivities = [newActivity, ...currentActivities];

        return {
          ...bug,
          team,
          developer,
          status: "Assigned",
          activities: updatedActivities,
          notes: updatedActivities,
        };
      })
    );

    setAiActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        bugId,
        text: `assigned to ${developer} (${team})`,
        icon: "UserCheck",
        time: "Just now",
        tone: "blue",
      },
      ...prev,
    ]);
  };

  const updateBugPriority = (bugId, newPriority) => {
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        const newActivity = {
          user: currentUser.name,
          role: currentUser.roleLabel,
          time: "Just now",
          text: `Priority updated to ${newPriority}`,
        };
        const currentActivities = bug.activities || bug.notes || [];
        return {
          ...bug,
          priority: newPriority,
          activities: [newActivity, ...currentActivities],
          notes: [newActivity, ...currentActivities],
        };
      })
    );
  };

  const updateBugSeverity = (bugId, newSeverity) => {
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        const newActivity = {
          user: currentUser.name,
          role: currentUser.roleLabel,
          time: "Just now",
          text: `Severity updated to ${newSeverity}`,
        };
        const currentActivities = bug.activities || bug.notes || [];
        return {
          ...bug,
          severity: newSeverity,
          activities: [newActivity, ...currentActivities],
          notes: [newActivity, ...currentActivities],
        };
      })
    );
  };

  const addBugComment = (bugId, text) => {
    if (!text?.trim()) return;
    const newActivity = {
      user: currentUser.name,
      role: currentUser.roleLabel,
      time: "Just now",
      text: text.trim(),
    };

    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        const currentActivities = bug.activities || bug.notes || [];
        const updatedActivities = [newActivity, ...currentActivities];
        return {
          ...bug,
          activities: updatedActivities,
          notes: updatedActivities,
        };
      })
    );
  };

  const updateBugRepro = (bugId, reproStatus, steps = null) => {
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        return {
          ...bug,
          reproductionStatus: reproStatus,
          reproStatus: reproStatus,
          ...(steps ? { reproductionSteps: steps } : {}),
        };
      })
    );
  };

  const completeAiTriage = (bugId, triageResult = {}) => {
    setBugs((prev) =>
      prev.map((bug) => {
        if (bug.id !== bugId) return bug;
        return {
          ...bug,
          aiStatus: "Analyzed",
          status: bug.status === "AI Processing" ? "New" : bug.status,
          title: triageResult.standardizedTitle || bug.title,
          aiSummary: triageResult.aiSummary || bug.aiSummary,
          severity: triageResult.severity || bug.severity,
          priority: triageResult.priority || bug.priority,
          aiConfidence: triageResult.confidence || 94,
          aiReason: triageResult.reason || bug.aiReason,
          team: triageResult.team || bug.team,
          developer: triageResult.developer || bug.developer,
          duplicates: triageResult.duplicates || bug.duplicates,
        };
      })
    );

    setAiActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        bugId,
        text: `AI triage completed · classified as ${triageResult.severity || "Analyzed"}`,
        icon: "Sparkles",
        time: "Just now",
        tone: "violet",
      },
      ...prev,
    ]);
  };

  const createBug = (newBugData) => {
    const newId = `BUG-${140 + Math.floor(Math.random() * 800)}`;
    const fullBug = {
      id: newId,
      title: newBugData.title || "Untitled Issue",
      description: newBugData.description || newBugData.title,
      source: newBugData.source || "Manual Report",
      sourceIcon: "FileText",
      reportedDate: new Date().toISOString().slice(0, 10),
      severity: newBugData.severity || "Medium",
      priority: newBugData.priority || "Medium",
      status: "AI Processing",
      team: newBugData.team || "Payments",
      developer: newBugData.developer || "Arun Kumar",
      reproductionStatus: "Pending",
      reproStatus: "Pending",
      aiStatus: "Processing",
      aiConfidence: 91,
      aiReason: "Automated preliminary analysis mapped issue to relevant service component.",
      originalReport: newBugData.originalReport || newBugData.title,
      aiSummary: newBugData.aiSummary || `Standardized summary: ${newBugData.title}`,
      expectedBehavior: newBugData.expectedBehavior || "Feature functions as intended without errors.",
      actualBehavior: newBugData.actualBehavior || "System returned an unexpected failure state.",
      environment: {
        os: "Windows 11 Pro",
        browser: "Chrome 126",
        device: "Desktop",
        environment: "Production",
      },
      reproductionSteps: [
        { step: 1, label: "Open Application", status: "pass" },
        { step: 2, label: "Execute reported action", status: "fail" },
        { step: 3, label: "Capture application telemetry error log", status: "pass" },
      ],
      duplicates: [],
      activities: [
        {
          user: currentUser.name,
          role: currentUser.roleLabel,
          time: "Just now",
          text: `Bug report ingested via ${newBugData.source || "Manual Report"}`,
        },
      ],
      notes: [
        {
          author: currentUser.name,
          role: currentUser.roleLabel,
          time: "Just now",
          text: `Bug report ingested via ${newBugData.source || "Manual Report"}`,
        },
      ],
    };

    setBugs((prev) => [fullBug, ...prev]);

    setAiActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        bugId: newId,
        text: `received from ${fullBug.source} · AI triage processing`,
        icon: "Sparkles",
        time: "Just now",
        tone: "violet",
      },
      ...prev,
    ]);

    return fullBug;
  };

  const getBugById = (id) => bugs.find((b) => b.id.toLowerCase() === id?.toLowerCase()) || bugs[0];

  return (
    <BugContext.Provider
      value={{
        bugs,
        aiActivity,
        currentRole,
        setCurrentRole,
        currentUser,
        authSession,
        authUser,
        isAuthenticated: Boolean(authUser && authSession?.access_token),
        authLoading,
        login,
        register,
        logout,
        updateBugStatus,
        reassignBug,
        assignBug,
        updateBugPriority,
        updateBugSeverity,
        addBugComment,
        addBugNote: addBugComment,
        updateBugRepro,
        completeAiTriage,
        createBug,
        getBugById,
      }}
    >
      {children}
    </BugContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBugs() {
  const context = useContext(BugContext);
  if (!context) {
    throw new Error("useBugs must be used within a BugProvider");
  }
  return context;
}
