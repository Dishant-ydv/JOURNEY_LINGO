import React from "react";
import {
  Flame,
  Star,
  Compass,
  Plane,
  Building2,
  Utensils,
  Train,
  ShoppingBag,
  Landmark,
  Lock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { UserProfile, JourneyLocation, AppTab } from "../types";

interface Props {
  user: UserProfile;
  locations: JourneyLocation[];
  onNavigateTab: (tab: AppTab) => void;
  onSelectLocation: (locId: string) => void;
  sessionSeconds: number;
}

export const DashboardView: React.FC<Props> = ({
  user,
  locations,
  onNavigateTab,
  onSelectLocation,
  sessionSeconds,
}) => {
  const getLocationIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "Plane":
        return <Plane className={className} />;
      case "Building2":
        return <Building2 className={className} />;
      case "Utensils":
        return <Utensils className={className} />;
      case "Train":
        return <Train className={className} />;
      case "ShoppingBag":
        return <ShoppingBag className={className} />;
      case "Landmark":
      default:
        return <Landmark className={className} />;
    }
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Greeting (Slide 2 Screen 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-100">
              {user.name.charAt(0)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
              ✓
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Good morning, {user.name}!
              </h1>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                Level {user.levelNumber} {user.levelTitle}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ready to continue your {user.targetLanguage.split(" ")[0]} journey?
            </p>
          </div>
        </div>

        {/* Streaks & XP Badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 shadow-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Streak</div>
              <div className="text-sm font-black leading-none">{user.streakDays} Days</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 border border-indigo-200/70 text-indigo-900 shadow-xs">
            <Star className="w-4 h-4 text-indigo-600 fill-indigo-500" />
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Total XP</div>
              <div className="text-sm font-black leading-none">{user.xp.toLocaleString()}</div>
            </div>
          </div>

          {/* Real-time Session active ticker */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-900">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase text-emerald-600">Active Live</div>
              <div className="text-xs font-mono font-bold leading-none">
                {formatSessionTime(sessionSeconds)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Destination Card (Tokyo, Japan) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 shadow-xl shadow-indigo-900/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none flex items-center justify-end pr-8">
          <span className="text-9xl font-black">東京</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200">
            <Compass className="w-3.5 h-3.5 text-indigo-300" />
            Current Exploration
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {user.targetCity}, {user.targetCountry}
            </h2>
            <p className="text-sm text-indigo-200 mt-1">
              You are on a roll! Keep going to unlock Shibuya Dining.
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold text-indigo-200">
              <span>Mission Progress</span>
              <span>35% Complete</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                style={{ width: "35%" }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab("learn")}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-indigo-950 font-bold rounded-xl shadow-md text-sm flex items-center gap-2 transition-all"
            >
              Resume Journey
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>
            <button
              onClick={() => onNavigateTab("practice")}
              className="px-4 py-2.5 bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm border border-indigo-400/30 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              AI Conversation Practice
            </button>
          </div>
        </div>
      </div>

      {/* Your Journey Map (Sequential Location Unlock System - USP) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Your Journey Map</h3>
              <span className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                Sequential Unlock (USP)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Advance through realistic destinations step-by-step
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("missions")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View Full Map
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Node Track */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {locations.map((loc) => {
            const isCompleted = loc.status === "completed";
            const isInProgress = loc.status === "in_progress";
            const isLocked = loc.status === "locked";

            return (
              <div
                key={loc.id}
                onClick={() => {
                  if (!isLocked) onSelectLocation(loc.id);
                }}
                className={`relative p-4 rounded-2xl border text-center flex flex-col items-center justify-between transition-all ${
                  isCompleted
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-950 cursor-pointer hover:shadow-xs"
                    : isInProgress
                    ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 cursor-pointer shadow-xs"
                    : "bg-slate-50/60 border-slate-200 text-slate-400 cursor-not-allowed opacity-75"
                }`}
              >
                <div className="absolute top-2 right-2">
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {isInProgress && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                    </span>
                  )}
                  {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                </div>

                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 shadow-xs ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isInProgress
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {getLocationIcon(loc.iconName)}
                </div>

                <div>
                  <div className="text-[11px] font-mono text-slate-400">0{loc.order}</div>
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {loc.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{loc.japaneseName.split(" ")[0]}</div>
                </div>

                <div className="mt-2 text-[10px] font-semibold">
                  {isCompleted && <span className="text-emerald-700">Completed</span>}
                  {isInProgress && <span className="text-indigo-600">In Progress (3/5)</span>}
                  {isLocked && <span className="text-slate-400">Locked</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Key Statistics Cards (Slide 2 Screen 7) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{user.wordsLearned}</div>
            <div className="text-xs text-slate-500">Words Learned</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{user.conversationsPracticed}</div>
            <div className="text-xs text-slate-500">Conversations Practiced</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">
              {user.missionsCompleted}/{user.totalMissions}
            </div>
            <div className="text-xs text-slate-500">Missions Completed</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">4 Badges</div>
            <div className="text-xs text-slate-500">Achievements Earned</div>
          </div>
        </div>
      </div>

      {/* Today's Mission & Daily Goal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Mission (2 columns) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Today's Mission
            </h3>
            <button
              onClick={() => onNavigateTab("missions")}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View All Missions
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                🏨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                    Location 2
                  </span>
                  <span className="text-xs text-slate-500">3/5 Lessons Completed</span>
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">Hotel Check-in</div>
                <div className="text-xs text-slate-500">
                  Learn how to check in, ask for facilities and make requests
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab("learn")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all whitespace-nowrap"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Daily Goal Card (1 column) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Daily Goal
            </h3>
            <span className="text-xs font-bold text-emerald-600">85%</span>
          </div>

          <div className="my-3 space-y-2">
            <div className="text-xs text-slate-600 font-medium">
              Complete 2 lessons & earn 50 XP today
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                style={{ width: `${user.todayProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>1 / 2 Lessons done</span>
              <span>40 / 50 XP</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("progress")}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
          >
            Analytics & Progress
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
