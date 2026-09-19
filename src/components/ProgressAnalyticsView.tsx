import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Flame,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart2,
  BookOpen,
  MessageSquare,
  Mic,
  Headphones,
  Zap,
  Play,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import confetti from "canvas-confetti";
import { UserProfile, AnalyticsPoint } from "../types";
import {
  initialAnalyticsPoints,
  skillProgressData,
  milestoneBadges,
  recentActivities,
} from "../data/mockData";
import { playChime } from "../utils/audio";

interface Props {
  user: UserProfile;
  sessionSeconds: number;
  onAddXP: (amount: number) => void;
}

export const ProgressAnalyticsView: React.FC<Props> = ({
  user,
  sessionSeconds,
  onAddXP,
}) => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");
  const [chartMetric, setChartMetric] = useState<"xp" | "studyMinutes" | "accuracy">("xp");
  const [dataPoints, setDataPoints] = useState<AnalyticsPoint[]>(initialAnalyticsPoints);
  const [liveSimulatorActive, setLiveSimulatorActive] = useState<boolean>(false);
  const [liveEvents, setLiveEvents] = useState<
    { id: string; text: string; time: string; xp: number }[]
  >([
    { id: "e1", text: "Hotel Check-in Vocab Drilled", time: "Just now", xp: 15 },
    { id: "e2", text: "AI Roleplay Completed", time: "2 min ago", xp: 25 },
  ]);

  // Live simulator effect for real-time analytics demo
  useEffect(() => {
    if (!liveSimulatorActive) return;
    const interval = setInterval(() => {
      const phrases = [
        "Pronunciation Drill Perfect",
        "Listening Question Answered",
        "Grammar ~tai desu Reviewed",
        "Tokyo Subway Dialogue Completed",
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      const xpBonus = Math.floor(10 + Math.random() * 15);

      onAddXP(xpBonus);
      setLiveEvents((prev) => [
        {
          id: String(Date.now()),
          text: randomPhrase,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          xp: xpBonus,
        },
        ...prev.slice(0, 5),
      ]);

      // Update the chart dynamically in real-time
      setDataPoints((prev) => {
        const last = { ...prev[prev.length - 1] };
        last.xp += xpBonus;
        last.wordsReviewed += 1;
        return [...prev.slice(0, prev.length - 1), last];
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [liveSimulatorActive, onAddXP]);

  const filteredData =
    timeRange === "7d"
      ? dataPoints.slice(-4)
      : timeRange === "30d"
      ? dataPoints
      : dataPoints;

  const formatStudyTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getBadgeIcon = (name: string) => {
    switch (name) {
      case "BookOpen":
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case "MessageSquare":
        return <MessageSquare className="w-5 h-5 text-teal-600" />;
      case "Mic":
        return <Mic className="w-5 h-5 text-amber-600" />;
      case "Headphones":
        return <Headphones className="w-5 h-5 text-rose-600" />;
      case "Flame":
      default:
        return <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Header (Slide 4 Screen 10) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Progress & Real-Time Analytics
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Track your journey. Celebrate every step.
          </h2>
          <p className="text-xs text-slate-500">
            Real-time telemetry, competency metrics, skill radars, and learning trends
          </p>
        </div>

        {/* Live Real-Time Activity Simulator Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLiveSimulatorActive(!liveSimulatorActive);
              if (!liveSimulatorActive) {
                playChime(true);
              }
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
              liveSimulatorActive
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                liveSimulatorActive ? "bg-white animate-ping" : "bg-emerald-500"
              }`}
            />
            {liveSimulatorActive ? "Live Stream Active" : "Simulate Real-time Traffic"}
          </button>
        </div>
      </div>

      {/* TOP SECTION: Overall Progress & Streak Cards (Slide 4 top) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Overall Progress Card (2 Columns on large screens) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Circular Percentage Ring */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600 transition-all duration-700"
                    strokeDasharray="68, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-slate-900 leading-none">68%</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400 mt-0.5">Overall</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                    Level {user.levelNumber}
                  </span>
                  <span className="text-base font-black text-slate-900">{user.levelTitle}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  You're doing great! Keep learning and improving.
                </p>
                <div className="text-xs font-mono font-semibold text-slate-600 mt-1.5">
                  XP: <span className="text-indigo-600 font-bold">{user.xp.toLocaleString()}</span> / 1,800
                </div>
              </div>
            </div>
          </div>

          {/* 4 Overview Mini Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500">Lessons Completed</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">12 / 18</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500">Activities Completed</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">48</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500">Total XP Earned</div>
              <div className="text-lg font-black text-indigo-600 mt-0.5">{user.xp.toLocaleString()}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500">Study Time</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {formatStudyTime(user.studyTimeMinutes)}
              </div>
            </div>
          </div>
        </div>

        {/* Current Streak Card (Screen 10 right) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Current Streak</h3>
            <span className="text-xs font-semibold text-amber-600">Active</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center">
              <Flame className="w-8 h-8 fill-amber-500" />
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 leading-none">
                {user.streakDays}
              </div>
              <div className="text-xs font-bold text-slate-500 mt-0.5">Days in a row! Keep it up!</div>
            </div>
          </div>

          {/* This Week Days Checkboxes (Slide 4 Screen 10) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>This Week</span>
              <span className="text-emerald-600 font-bold">7 / 7 days</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div
                  key={d}
                  className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex flex-col items-center gap-0.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SKILL-WISE PROGRESS & MILESTONE LEARNING PATH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Skill Wise Progress (Slide 4 Screen 10) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Skill Wise Progress</h3>
              <p className="text-xs text-slate-500">Core linguistic competencies</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600">View Details</span>
          </div>

          <div className="space-y-3 pt-1">
            {skillProgressData.map((sk) => (
              <div key={sk.skill} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    {sk.skill}
                  </span>
                  <span>{sk.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${sk.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-medium">{sk.levelText}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Learning Journey Milestone Path (Slide 4 Screen 10) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Learning Journey</h3>
              <span className="text-xs font-semibold text-indigo-600">View Map</span>
            </div>
            <p className="text-xs text-slate-500">Progression tiers towards master fluency</p>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center py-2">
            {[
              { title: "Beginner", status: "Completed", icon: "🌱", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { title: "Explorer", status: "Completed", icon: "🧭", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { title: "Traveler", status: "Current Level", icon: "✈️", color: "bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-400/30 font-bold" },
              { title: "Adventurer", status: "Locked", icon: "👑", color: "bg-slate-50 text-slate-400 border-slate-200" },
            ].map((t) => (
              <div key={t.title} className={`p-3 rounded-2xl border ${t.color}`}>
                <div className="text-xl mb-1">{t.icon}</div>
                <div className="text-xs font-bold">{t.title}</div>
                <div className="text-[10px] mt-0.5 opacity-80">{t.status}</div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-indigo-950">Next Goal:</div>
              <div className="text-indigo-700 text-[11px]">
                Complete 6 more lessons to reach Level 5 (Adventurer)
              </div>
            </div>
            <span className="font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
              6 / 18
            </span>
          </div>
        </div>
      </div>

      {/* CORE DATA VISUALIZATION: LEARNING PROGRESS OVER TIME (Slide 4 Screen 10) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Learning Progress Over Time</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                Recharts Dynamic Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Empirical mastery curves, session minutes & XP trends
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setChartMetric("xp")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMetric === "xp" ? "bg-white text-indigo-700 shadow-xs font-bold" : ""
                }`}
              >
                XP
              </button>
              <button
                onClick={() => setChartMetric("studyMinutes")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMetric === "studyMinutes"
                    ? "bg-white text-indigo-700 shadow-xs font-bold"
                    : ""
                }`}
              >
                Minutes
              </button>
              <button
                onClick={() => setChartMetric("accuracy")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  chartMetric === "accuracy" ? "bg-white text-indigo-700 shadow-xs font-bold" : ""
                }`}
              >
                Accuracy %
              </button>
            </div>

            {/* Time Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {(["7d", "30d", "all"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2 py-1 rounded-lg uppercase transition-all ${
                    timeRange === r ? "bg-indigo-600 text-white shadow-xs font-bold" : ""
                  }`}
                >
                  {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "All"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Metric Pills Summary */}
        <div className="grid grid-cols-3 gap-3 py-1">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
            <span className="text-slate-500">Total Study Time</span>
            <div className="text-base font-black text-slate-900 mt-0.5">18h 30m</div>
            <span className="text-[10px] font-bold text-emerald-600">↑ 12% vs last week</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
            <span className="text-slate-500">Avg. Daily Time</span>
            <div className="text-base font-black text-slate-900 mt-0.5">2h 38m</div>
            <span className="text-[10px] font-bold text-emerald-600">↑ 8% vs last week</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
            <span className="text-slate-500">Avg. Accuracy</span>
            <div className="text-base font-black text-slate-900 mt-0.5">82%</div>
            <span className="text-[10px] font-bold text-emerald-600">↑ 6% vs last week</span>
          </div>
        </div>

        {/* Interactive Chart Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey={chartMetric}
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TODAY'S PROGRESS & RECENT LIVE TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Progress Radial */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's Progress</h3>
            <p className="text-xs text-slate-500">Daily quota completion</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600 transition-all duration-700"
                  strokeDasharray="85, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-slate-900">85%</span>
                <span className="text-[10px] text-emerald-600 font-bold">Great effort!</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-600">
            Lessons Completed: <strong className="text-slate-900">2 / 2</strong>
          </div>
        </div>

        {/* Live Event Stream / Telemetry (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Real-Time Event Stream</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Live Session: {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s
            </span>
          </div>

          <div className="space-y-2">
            {liveEvents.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs hover:bg-indigo-50/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span className="font-semibold text-slate-800">{evt.text}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-mono">{evt.time}</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    +{evt.xp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MILESTONE BADGES & RECENT ACTIVITY FEED (Slide 4 Screen 10 bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Milestone Badges */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Milestone Badges</h3>
            <span className="text-xs font-semibold text-indigo-600">View All</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {milestoneBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                  badge.unlocked
                    ? "bg-slate-50/70 border-slate-200 text-slate-900"
                    : "bg-slate-50/30 border-dashed border-slate-200 opacity-60 text-slate-400"
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-2 shadow-xs">
                  {getBadgeIcon(badge.icon)}
                </div>
                <div>
                  <div className="text-xs font-bold truncate max-w-[120px]">{badge.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{badge.dateUnlocked}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
            <span className="text-xs font-semibold text-indigo-600">View History</span>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{act.title}</div>
                  <div className="text-[11px] text-slate-500">{act.timestamp}</div>
                </div>
                <span className="font-black text-xs text-indigo-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-xs">
                  +{act.xpEarned} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
