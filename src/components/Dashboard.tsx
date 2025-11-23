import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Activity,
  FileText,
  Shield,
  Users,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { motion } from "motion/react";
import { User } from "../App";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// Optimized animation settings for smooth, complete animations with scroll performance
const rechartsAnimationDuration = 1000; // 1 second - smooth and scroll-friendly
const rechartsEasing = "ease-out" as const; // Quick ending for better scroll response
const animationBeginDelay = 0; // No delay - start immediately
const isAnimationActive = true; // Always enabled

interface AuditEvent {
  id: string;
  eventType: "upload" | "share" | "verify" | "download" | "batch_upload" | "batch_share";
  fileId?: string;
  fileName?: string;
  caseNumber: string;
  performedBy: string;
  performerName: string;
  performerRole: string;
  txHash: string;
  timestamp: string;
  details?: string;
  batchId?: string;
  fileCount?: number;
  merkleRoot?: string;
  zkpProofId?: string;
  zkpVerified?: boolean;
  verificationType?: "ipfs" | "local";
  localFileName?: string;
}

interface DashboardProps {
  currentUser: User;
}

const COLORS = {
  primary: "#3b82f6",
  secondary: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const EVENT_COLORS: Record<string, string> = {
  upload: COLORS.primary,
  share: COLORS.secondary,
  verify: COLORS.success,
  download: COLORS.warning,
  batch_upload: COLORS.purple,
  batch_share: COLORS.pink,
};

export function Dashboard({ currentUser }: DashboardProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const fetchDashboardData = async () => {
    try {
      const url =
        currentUser.role === "Administrator"
          ? `https://${projectId}.supabase.co/functions/v1/make-server-af0976da/get-audit-trail?filter=all`
          : `https://${projectId}.supabase.co/functions/v1/make-server-af0976da/get-audit-trail?userEmail=${currentUser.email}&filter=all`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      // Small delay before showing charts to ensure smooth animation start
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  // Filter events by date range
  const filteredEvents = useMemo(() => {
    if (dateRange === "all") return events;

    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[dateRange];
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return events.filter((event) => new Date(event.timestamp) >= cutoffDate);
  }, [events, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const uploadCount = filteredEvents.filter((e) => e.eventType === "upload" || e.eventType === "batch_upload").length;
    const shareCount = filteredEvents.filter((e) => e.eventType === "share" || e.eventType === "batch_share").length;
    const verifyCount = filteredEvents.filter((e) => e.eventType === "verify").length;
    const verifySuccess = filteredEvents.filter((e) => e.eventType === "verify" && e.zkpVerified === true).length;
    const verifyFailed = filteredEvents.filter((e) => e.eventType === "verify" && e.zkpVerified === false).length;
    const uniqueCases = new Set(filteredEvents.map((e) => e.caseNumber)).size;
    const uniqueUsers = new Set(filteredEvents.map((e) => e.performedBy)).size;

    return {
      totalEvents,
      uploadCount,
      shareCount,
      verifyCount,
      verifySuccess,
      verifyFailed,
      successRate: verifyCount > 0 ? ((verifySuccess / verifyCount) * 100).toFixed(1) : "0",
      uniqueCases,
      uniqueUsers,
    };
  }, [filteredEvents]);

  // Activity over time (daily)
  const activityOverTime = useMemo(() => {
    const dailyActivity: Record<string, { date: string; uploads: number; shares: number; verifications: number; total: number }> = {};

    filteredEvents.forEach((event) => {
      const date = new Date(event.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!dailyActivity[date]) {
        dailyActivity[date] = { date, uploads: 0, shares: 0, verifications: 0, total: 0 };
      }

      if (event.eventType === "upload" || event.eventType === "batch_upload") {
        dailyActivity[date].uploads++;
      } else if (event.eventType === "share" || event.eventType === "batch_share") {
        dailyActivity[date].shares++;
      } else if (event.eventType === "verify") {
        dailyActivity[date].verifications++;
      }
      dailyActivity[date].total++;
    });

    return Object.values(dailyActivity).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredEvents]);

  // Event type distribution
  const eventTypeData = useMemo(() => {
    const distribution: Record<string, number> = {
      upload: 0,
      share: 0,
      verify: 0,
      download: 0,
      batch_upload: 0,
      batch_share: 0,
    };

    filteredEvents.forEach((event) => {
      distribution[event.eventType] = (distribution[event.eventType] || 0) + 1;
    });

    return Object.entries(distribution)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        name: type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: count,
        color: EVENT_COLORS[type] || COLORS.primary,
      }));
  }, [filteredEvents]);

  // Case activity (top 10 cases)
  const caseActivity = useMemo(() => {
    const caseCounts: Record<string, number> = {};

    filteredEvents.forEach((event) => {
      caseCounts[event.caseNumber] = (caseCounts[event.caseNumber] || 0) + 1;
    });

    return Object.entries(caseCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([caseNumber, count]) => ({
        case: caseNumber,
        activities: count,
      }));
  }, [filteredEvents]);

  // User/Department activity (for admins)
  const userActivity = useMemo(() => {
    if (currentUser.role !== "Administrator") return [];

    const userCounts: Record<string, { name: string; role: string; count: number }> = {};

    filteredEvents.forEach((event) => {
      if (!userCounts[event.performedBy]) {
        userCounts[event.performedBy] = {
          name: event.performerName,
          role: event.performerRole,
          count: 0,
        };
      }
      userCounts[event.performedBy].count++;
    });

    return Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredEvents, currentUser.role]);

  // Verification success rate over time
  const verificationTrend = useMemo(() => {
    const dailyVerifications: Record<
      string,
      { date: string; success: number; failed: number; total: number; rate: number }
    > = {};

    filteredEvents
      .filter((e) => e.eventType === "verify")
      .forEach((event) => {
        const date = new Date(event.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!dailyVerifications[date]) {
          dailyVerifications[date] = { date, success: 0, failed: 0, total: 0, rate: 0 };
        }

        if (event.zkpVerified === true) {
          dailyVerifications[date].success++;
        } else if (event.zkpVerified === false) {
          dailyVerifications[date].failed++;
        }
        dailyVerifications[date].total++;
      });

    return Object.values(dailyVerifications)
      .map((day) => ({
        ...day,
        rate: day.total > 0 ? Math.round((day.success / day.total) * 100) : 0,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredEvents]);

  // Performance radar chart data (for non-admin users)
  const performanceData = useMemo(() => {
    if (currentUser.role === "Administrator") return [];

    const uploads = filteredEvents.filter((e) => e.eventType === "upload" || e.eventType === "batch_upload").length;
    const shares = filteredEvents.filter((e) => e.eventType === "share" || e.eventType === "batch_share").length;
    const verifications = filteredEvents.filter((e) => e.eventType === "verify").length;
    const cases = new Set(filteredEvents.map((e) => e.caseNumber)).size;

    const max = Math.max(uploads, shares, verifications, cases, 1);

    return [
      { metric: "Uploads", value: uploads, fullMark: max },
      { metric: "Shares", value: shares, fullMark: max },
      { metric: "Verifications", value: verifications, fullMark: max },
      { metric: "Cases", value: cases, fullMark: max },
    ];
  }, [filteredEvents, currentUser.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-blue-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-full" style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Analytics Dashboard
          </h1>
          <p className="text-blue-300">
            {currentUser.role === "Administrator" ? "System-wide statistics and insights" : "Your activity statistics and insights"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-blue-500/30 rounded-lg p-1">
            {(["7d", "30d", "90d", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  dateRange === range
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                    : "text-blue-300 hover:text-white hover:bg-blue-600/20"
                }`}
              >
                {range === "all" ? "All Time" : `Last ${range.replace("d", " Days")}`}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 rounded-lg transition-colors border border-blue-500/30 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Activities"
          value={stats.totalEvents}
          icon={Activity}
          color="blue"
          trend={`${stats.uniqueCases} cases`}
        />
        <StatCard
          title="Evidence Uploaded"
          value={stats.uploadCount}
          icon={FileText}
          color="purple"
          trend={`${dateRange === "all" ? "All time" : `Last ${dateRange}`}`}
        />
        <StatCard
          title="Verifications"
          value={stats.verifyCount}
          icon={Shield}
          color="green"
          trend={`${stats.successRate}% success rate`}
        />
        <StatCard
          title={currentUser.role === "Administrator" ? "Active Users" : "Shares"}
          value={currentUser.role === "Administrator" ? stats.uniqueUsers : stats.shareCount}
          icon={Users}
          color="cyan"
          trend={currentUser.role === "Administrator" ? `${stats.uniqueCases} cases` : `${stats.uniqueCases} cases`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Activity - Bar Chart */}
        <ChartCard title="Most Active Cases" icon={FileText}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={caseActivity} layout="vertical">
              <defs>
                <linearGradient id="barGradientUnique" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                  <stop offset="50%" stopColor={COLORS.primary} stopOpacity={0.5}/>
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 4" stroke="#1e3a5f" opacity={0.15} horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                stroke="#60a5fa" 
                style={{ fontSize: "11px", fontWeight: 500 }} 
                tick={{ fill: "#60a5fa", opacity: 0.7 }}
                axisLine={{ stroke: "#60a5fa", strokeWidth: 1, opacity: 0.3 }}
              />
              <YAxis 
                dataKey="case" 
                type="category" 
                stroke="#60a5fa" 
                style={{ fontSize: "11px", fontWeight: 500 }} 
                width={100} 
                tick={{ fill: "#60a5fa", opacity: 0.8 }}
                axisLine={{ stroke: "#60a5fa", strokeWidth: 1, opacity: 0.3 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.98)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
                }}
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
              />
              <Bar 
                dataKey="activities" 
                fill="url(#barGradientUnique)" 
                radius={[0, 12, 12, 0]}
                maxBarSize={35}
                animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                >
                {caseActivity.map(() => (
                  <Cell 
                   
                    stroke={COLORS.primary}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Event Type Distribution - Pie Chart */}
        <ChartCard title="Event Distribution" icon={Activity}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: "#60a5fa",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={110}
                innerRadius={45}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
                animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  fill: '#ffffff',
                }}
              >
                {eventTypeData.map((entry) => (
                  <Cell 
                    
                    fill={entry.color}
                    stroke="rgba(15, 23, 42, 0.8)"
                    strokeWidth={2}
                    style={{ 
                      opacity: 0.95
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.98)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
                }}
                itemStyle={{
                  color: "#ffffff",
                }}
                labelStyle={{
                  color: "#ffffff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Over Time - Line Chart */}
        <ChartCard title="Activity Trends" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityOverTime}>
              <defs>
                <filter id="subtleGlow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke="#1e3a5f" opacity={0.2} />
              <XAxis dataKey="date" stroke="#60a5fa" style={{ fontSize: "11px", fontWeight: 500 }} tick={{ fill: "#60a5fa", opacity: 0.7 }} />
              <YAxis stroke="#60a5fa" style={{ fontSize: "11px", fontWeight: 500 }} tick={{ fill: "#60a5fa", opacity: 0.7 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.98)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
                }}
              />
              <Legend wrapperStyle={{ color: "#60a5fa", fontWeight: 500 }} />
              <Line 
                type="monotone" 
                dataKey="uploads" 
                stroke={COLORS.primary} 
                strokeWidth={2.5} 
                dot={{ r: 5, fill: COLORS.primary, stroke: "#0f172a", strokeWidth: 2 }} 
                activeDot={{ r: 6, fill: COLORS.primary, stroke: "#fff", strokeWidth: 2 }}
                name="Uploads"
                animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
              />
              <Line 
                type="monotone" 
                dataKey="shares" 
                stroke={COLORS.secondary} 
                strokeWidth={2.5} 
                dot={{ r: 5, fill: COLORS.secondary, stroke: "#0f172a", strokeWidth: 2 }} 
                activeDot={{ r: 6, fill: COLORS.secondary, stroke: "#fff", strokeWidth: 2 }}
                name="Shares"
                animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                style={{ filter: "drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))" }}
              />
              <Line 
                type="monotone" 
                dataKey="verifications" 
                stroke={COLORS.success} 
                strokeWidth={2.5} 
                dot={{ r: 5, fill: COLORS.success, stroke: "#0f172a", strokeWidth: 2 }} 
                activeDot={{ r: 6, fill: COLORS.success, stroke: "#fff", strokeWidth: 2 }}
                name="Verifications"
                animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        {/* Verification Trend - Area Chart */}
        {verificationTrend.length > 0 && (
          <ChartCard title="Verification Success Rate" icon={Shield}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={verificationTrend}>
                <defs>
                  <linearGradient id="successAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.success} stopOpacity={0.5}/>
                    <stop offset="50%" stopColor={COLORS.success} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={COLORS.success} stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="failedAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.danger} stopOpacity={0.5}/>
                    <stop offset="50%" stopColor={COLORS.danger} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={COLORS.danger} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 3" stroke="#1e3a5f" opacity={0.2} />
                <XAxis dataKey="date" stroke="#60a5fa" style={{ fontSize: "11px", fontWeight: 500 }} tick={{ fill: "#60a5fa", opacity: 0.7 }} />
                <YAxis stroke="#60a5fa" style={{ fontSize: "11px", fontWeight: 500 }} tick={{ fill: "#60a5fa", opacity: 0.7 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.98)",
                    border: "1px solid rgba(59, 130, 246, 0.5)",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
                  }}
                />
                <Legend wrapperStyle={{ color: "#60a5fa", fontWeight: 500 }} />
                <Area 
                  type="monotone" 
                  dataKey="success" 
                  stackId="1" 
                  stroke={COLORS.success} 
                  fill="url(#successAreaGradient)" 
                  strokeWidth={2}
                  name="Success"
                  animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.3))" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="failed" 
                  stackId="1" 
                  stroke={COLORS.danger} 
                  fill="url(#failedAreaGradient)" 
                  strokeWidth={2}
                  name="Failed"
                  animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                style={{ filter: "drop-shadow(0 0 4px rgba(239, 68, 68, 0.3))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke={COLORS.warning} 
                  strokeWidth={2.5} 
                  dot={{ r: 5, fill: COLORS.warning, stroke: "#0f172a", strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: COLORS.warning, stroke: "#fff", strokeWidth: 2 }}
                  name="Success Rate %"
                  strokeDasharray="5 5"
                  animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                style={{ filter: "drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* User Activity - For Admins */}
        {currentUser.role === "Administrator" && userActivity.length > 0 && (
          <ChartCard title="Top Active Users" icon={Users}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivity}>
                <defs>
                  <linearGradient id="userBarGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                    <stop offset="50%" stopColor={COLORS.secondary} stopOpacity={0.6}/>
                    <stop offset="100%" stopColor={COLORS.secondary} stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 3" stroke="#1e3a5f" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#60a5fa" 
                  style={{ fontSize: "11px", fontWeight: 500 }} 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fill: "#60a5fa", opacity: 0.7 }}
                />
                <YAxis 
                  stroke="#60a5fa" 
                  style={{ fontSize: "11px", fontWeight: 500 }}
                  tick={{ fill: "#60a5fa", opacity: 0.7 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.98)",
                    border: "1px solid rgba(59, 130, 246, 0.5)",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
                  }}
                  cursor={{ fill: "rgba(6, 182, 212, 0.1)" }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#userBarGradient)" 
                  radius={[12, 12, 0, 0]}
                  maxBarSize={45}
                  animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                >
                  {userActivity.map(() => (
                    <Cell 
                     
                      stroke={COLORS.secondary}
                      strokeWidth={1}
                      strokeOpacity={0.6}
                      style={{
                        filter: "drop-shadow(0 0 4px rgba(6, 182, 212, 0.3))",
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Performance Radar - For Non-Admins */}
        {currentUser.role !== "Administrator" && performanceData.length > 0 && (
          <ChartCard title="Your Performance Metrics" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.5}/>
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.15}/>
                  </linearGradient>
                </defs>
                <PolarGrid 
                  stroke="#60a5fa" 
                  strokeWidth={1} 
                  opacity={0.25}
                  strokeDasharray="3 3"
                />
                <PolarAngleAxis 
                  dataKey="metric" 
                  stroke="#60a5fa" 
                  style={{ fontSize: "12px", fontWeight: 500 }} 
                  tick={{ fill: "#60a5fa", opacity: 0.8 }}
                />
                <PolarRadiusAxis 
                  stroke="#60a5fa" 
                  style={{ fontSize: "11px", fontWeight: 500 }}
                  tick={{ fill: "#60a5fa", opacity: 0.6 }}
                  angle={90}
                />
                <Radar 
                  name="Activity" 
                  dataKey="value" 
                  stroke={COLORS.primary} 
                  fill="url(#radarGradient)" 
                  fillOpacity={0.4}
                  strokeWidth={2}
                  dot={{ r: 4, fill: COLORS.primary, stroke: "#0f172a", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: COLORS.primary, stroke: "#fff", strokeWidth: 2 }}
                  animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                style={{
                    filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.98)",
                    border: "1px solid rgba(59, 130, 246, 0.5)",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Cumulative Activity - Area Chart */}
        <ChartCard title="Cumulative Activity Growth" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityOverTime.map((item, index, arr) => ({
              ...item,
              cumulative: arr.slice(0, index + 1).reduce((sum, day) => sum + day.total, 0),
            }))}>
              <defs>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.5}/>
                  <stop offset="40%" stopColor={COLORS.purple} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 3" stroke="#1e3a5f" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#60a5fa" 
                style={{ fontSize: "11px", fontWeight: 500 }} 
                tick={{ fill: "#60a5fa", opacity: 0.7 }}
              />
              <YAxis 
                stroke="#60a5fa" 
                style={{ fontSize: "11px", fontWeight: 500 }}
                tick={{ fill: "#60a5fa", opacity: 0.7 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.98)",
                  border: "1px solid rgba(59, 130, 246, 0.5)",
                  borderRadius: "12px",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
                }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke={COLORS.purple} 
                fill="url(#cumulativeGradient)" 
                strokeWidth={2.5}
                name="Total Activities"
                animationBegin={animationBeginDelay}
                animationDuration={rechartsAnimationDuration}
                animationEasing={rechartsEasing}
                isAnimationActive={isAnimationActive}
                dot={{ r: 4, fill: COLORS.purple, stroke: "#0f172a", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: COLORS.purple, stroke: "#fff", strokeWidth: 2 }}
                style={{
                  filter: "drop-shadow(0 0 4px rgba(139, 92, 246, 0.3))",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Export Info */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-center gap-3 text-blue-300">
          <Download className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-medium text-white">Export Dashboard Data</p>
            <p className="text-sm">Click on any chart to interact with the data. Hover over elements for detailed information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "cyan";
  trend?: string;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-600/20 to-blue-900/20 border-blue-500/40 text-blue-400 shadow-blue-500/20",
    green: "from-green-600/20 to-green-900/20 border-green-500/40 text-green-400 shadow-green-500/20",
    purple: "from-purple-600/20 to-purple-900/20 border-purple-500/40 text-purple-400 shadow-purple-500/20",
    cyan: "from-cyan-600/20 to-cyan-900/20 border-cyan-500/40 text-cyan-400 shadow-cyan-500/20",
  };

  return (
    <div className={`relative bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6 shadow-lg overflow-hidden group hover:border-opacity-60 transition-colors duration-200`}>
      
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-blue-300/80 mb-2 font-medium tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value.toLocaleString()}</p>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-2xl border-2 border-current/20`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
      {trend && (
        <div className="relative">
          <div className="h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mb-3"></div>
          <p className="text-xs text-blue-300/70 font-medium">{trend}</p>
        </div>
      )}
    </div>
  );
}

// Chart Card Component
interface ChartCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function ChartCard({ title, icon: Icon, children }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className="relative bg-slate-900/80 border border-blue-500/40 rounded-xl p-6 shadow-lg overflow-hidden group hover:border-blue-400/60 transition-colors duration-200 transform-gpu"
      style={{ willChange: 'opacity' }}
    >
      
      <div className="relative flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30 shadow-lg shadow-blue-500/20">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
      </div>
      <div className="relative">
        {children}
      </div>
    </motion.div>
  );
}





