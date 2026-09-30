import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout({ children, title, subtitle, onSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] antialiased">
      {/* Sidebar (fixed on desktop, drawer on mobile) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Header
          title={title}
          subtitle={subtitle}
          onSearch={onSearch}
          onMenu={() => setSidebarOpen(true)}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
