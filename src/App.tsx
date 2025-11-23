import { useState } from "react";
import { motion } from "motion/react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { UserTable } from "./components/UserTable";
import { LoginPage } from "./components/LoginPage";
import { SplashScreen } from "./components/SplashScreen";
import { LandingPage } from "./components/LandingPage";
import { UploadEvidence } from "./components/UploadEvidence";
import { EvidenceFiles } from "./components/EvidenceFiles";
import { ShareEvidence } from "./components/ShareEvidence";
import { AuditTrail } from "./components/AuditTrail";
import { Dashboard } from "./components/Dashboard";
import { TamperDetectionDemo } from "./components/TamperDetectionDemo";
import { BlockchainBackground } from "./components/BlockchainBackground";
import cyberCrimeLogo from "./assets/CYBERCRIME.png";

export interface User {
  email: string;
  name: string;
  role: string;
  department: string;
  badgeId: string;
}

// User credentials database
const users: Record<string, { password: string; user: User }> = {
  "admin@evidenceshield.gov": {
    password: "admin123",
    user: {
      email: "admin@evidenceshield.gov",
      name: "System Administrator",
      role: "Administrator",
      department: "IT Department",
      badgeId: "ADMIN-001",
    },
  },
  "john.detective@police.gov": {
    password: "police123",
    user: {
      email: "john.detective@police.gov",
      name: "Detective John Smith",
      role: "Police Officer",
      department: "Homicide Division",
      badgeId: "PO-1234",
    },
  },
  "sarah.officer@police.gov": {
    password: "police123",
    user: {
      email: "sarah.officer@police.gov",
      name: "Officer Sarah Johnson",
      role: "Police Officer",
      department: "Narcotics Unit",
      badgeId: "PO-5678",
    },
  },
  "mike.forensics@lab.gov": {
    password: "forensics123",
    user: {
      email: "mike.forensics@lab.gov",
      name: "Dr. Michael Chen",
      role: "Forensics Specialist",
      department: "Crime Lab",
      badgeId: "FS-9012",
    },
  },
  "emily.analyst@lab.gov": {
    password: "forensics123",
    user: {
      email: "emily.analyst@lab.gov",
      name: "Emily Rodriguez",
      role: "Forensics Specialist",
      department: "Digital Forensics",
      badgeId: "FS-3456",
    },
  },
  "david.prosecutor@da.gov": {
    password: "prosecutor123",
    user: {
      email: "david.prosecutor@da.gov",
      name: "David Thompson",
      role: "Prosecutor",
      department: "District Attorney",
      badgeId: "DA-7890",
    },
  },
  "lisa.ada@da.gov": {
    password: "prosecutor123",
    user: {
      email: "lisa.ada@da.gov",
      name: "Lisa Martinez",
      role: "Prosecutor",
      department: "Assistant DA",
      badgeId: "ADA-2345",
    },
  },
  "robert.senior@da.gov": {
    password: "prosecutor123",
    user: {
      email: "robert.senior@da.gov",
      name: "Robert Williams",
      role: "Prosecutor",
      department: "Senior Counsel",
      badgeId: "SC-6789",
    },
  },
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("users");
  const [viewingPublicAudit, setViewingPublicAudit] = useState(false);

  const handleLogin = (email: string, password: string) => {
    const userRecord = users[email];
    
    if (!userRecord) {
      setLoginError("Invalid email address. Please check your credentials.");
      return;
    }

    if (userRecord.password !== password) {
      setLoginError("Incorrect password. Please try again.");
      return;
    }

    // Successful login
    setLoginError(null);
    setCurrentUser(userRecord.user);
    
    // Set default page to dashboard for all users
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginError(null);
    setCurrentPage("users");
  };

  const handleRequestDemo = () => {
    setShowLanding(false);
    setShowSplash(true);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleViewPublicAuditTrail = () => {
    setViewingPublicAudit(true);
  };

  const handleBackToLogin = () => {
    setViewingPublicAudit(false);
  };

  const renderPage = () => {
    if (!currentUser) return null;

    switch (currentPage) {
      case "dashboard":
        return <Dashboard currentUser={currentUser} />;
      case "users":
        return <UserTable currentUser={currentUser} />;
      case "upload":
        return <UploadEvidence currentUser={currentUser} />;
      case "files":
        return <EvidenceFiles currentUser={currentUser} />;
      case "share":
        return <ShareEvidence currentUser={currentUser} />;
      case "audit":
        return <AuditTrail currentUser={currentUser} />;
      case "download":
        return <EvidenceFiles currentUser={currentUser} />;
      case "tamper":
        return <TamperDetectionDemo currentUser={currentUser} />;
      default:
        return <UserTable currentUser={currentUser} />;
    }
  };

  // Show landing page
  if (showLanding) {
    return <LandingPage onRequestDemo={handleRequestDemo} />;
  }

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show public audit trail if viewing
  if (viewingPublicAudit) {
    // Create a temporary public user for viewing audit trail
    const publicUser: User = {
      email: "public@chainguard.gov",
      name: "Public Viewer",
      role: "Administrator", // Admin role to see all events
      department: "Public Access",
      badgeId: "PUBLIC",
    };

    return (
      <>
        <BlockchainBackground />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 h-screen flex flex-col"
        >
          {/* Public Header */}
          <div className="bg-slate-900/80 backdrop-blur-xl border-b border-blue-500/30 shadow-lg">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={cyberCrimeLogo} 
                  alt="ChainGuard Logo" 
                  className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                />
                <div>
                  <h1 className="text-white text-xl font-bold">ChainGuard Public Audit Trail</h1>
                  <p className="text-blue-300 text-sm">Transparent blockchain records for public accountability</p>
                </div>
              </div>
              <button
                onClick={handleBackToLogin}
                className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 rounded-lg transition-colors border border-blue-500/30"
              >
                Back to Login
              </button>
            </div>
          </div>

          {/* Audit Trail Content */}
          <main className="flex-1 overflow-y-auto">
            <AuditTrail currentUser={publicUser} />
          </main>

          {/* Footer */}
          <Footer />
        </motion.div>
      </>
    );
  }

  // Show login page if not authenticated
  if (!currentUser) {
    return (
      <>
        <BlockchainBackground />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <LoginPage 
            onLogin={handleLogin} 
            error={loginError}
            onViewPublicAuditTrail={handleViewPublicAuditTrail}
          />
        </motion.div>
      </>
    );
  }

  // Show main app if authenticated
  return (
    <>
      <BlockchainBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex overflow-hidden relative z-10"
      >
        {/* Sidebar */}
        <Sidebar 
          currentUser={currentUser} 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <Header currentUser={currentUser} onLogout={handleLogout} />
          
          {/* Content */}
          <main className="flex-1 overflow-y-auto" style={{ willChange: 'scroll-position' }}>
            {renderPage()}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
      </motion.div>
    </>
  );
}
