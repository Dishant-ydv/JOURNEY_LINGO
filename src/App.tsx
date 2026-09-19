import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  BookOpen,
  MessageSquare,
  BarChart2,
  FileText,
  Flame,
  Star,
  Settings,
  HelpCircle,
  Sparkles,
  MapPin,
  Volume2,
  VolumeX,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Globe,
} from "lucide-react";
import { UserProfile, AppTab, JourneyLocation } from "./types";
import {
  initialUserProfile,
  journeyLocations,
  sampleLessonData,
} from "./data/mockData";
import {
  getLanguageMeta,
  getLocationsForLanguage,
  SUPPORTED_LANGUAGES,
} from "./data/multilingualData";
import { getLessonDataForLanguageAndLocation } from "./data/lessonResolver";
import { DashboardView } from "./components/DashboardView";
import { LearnModuleView } from "./components/LearnModuleView";
import { PracticeModuleView } from "./components/PracticeModuleView";
import { ProgressAnalyticsView } from "./components/ProgressAnalyticsView";
import { MissionsJourneyView } from "./components/MissionsJourneyView";
import { OnboardingModal } from "./components/OnboardingModal";
import { PresentationSpecsModal } from "./components/PresentationSpecsModal";
import { AuthView } from "./components/AuthView";
import { playChime } from "./utils/audio";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("journeylingo_auth_session");
      return !!saved;
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("journeylingo_auth_session");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return initialUserProfile;
  });

  const [locations, setLocations] = useState<JourneyLocation[]>(() => {
    return getLocationsForLanguage(user.targetLanguage || "Japanese");
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string>("airport");
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showSpecsModal, setShowSpecsModal] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const languagePickerRef = useRef<HTMLDivElement>(null);

  const currentLangMeta = getLanguageMeta(user.targetLanguage || "Japanese");

  // Keep locations updated when target language changes
  useEffect(() => {
    setLocations(getLocationsForLanguage(user.targetLanguage || "Japanese"));
  }, [user.targetLanguage]);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        languagePickerRef.current &&
        !languagePickerRef.current.contains(e.target as Node)
      ) {
        setShowLanguagePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live session timer tracking
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const handleSelectLanguage = (languageName: string) => {
    const meta = getLanguageMeta(languageName);
    const updatedUser: UserProfile = {
      ...user,
      targetLanguage: meta.name,
      targetCity: meta.city,
      targetCountry: meta.country,
    };
    setUser(updatedUser);
    setLocations(getLocationsForLanguage(meta.name));
    setShowLanguagePicker(false);
    playChime(true);
    try {
      localStorage.setItem("journeylingo_auth_session", JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setLocations(getLocationsForLanguage(loggedInUser.targetLanguage || "Japanese"));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("journeylingo_auth_session");
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    playChime(false);
  };

  const handleCompleteLesson = (xpReward: number) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        xp: prev.xp + xpReward,
        wordsLearned: prev.wordsLearned + 5,
        missionsCompleted: Math.min(prev.totalMissions, prev.missionsCompleted + 1),
        studyTimeMinutes: prev.studyTimeMinutes + 15,
      };
      try {
        localStorage.setItem("journeylingo_auth_session", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Unlock next location
    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === selectedModuleId || (loc.id === "airport" && selectedModuleId === "airport")) {
          return {
            ...loc,
            completedMissions: Math.min(loc.totalMissions, loc.completedMissions + 1),
          };
        }
        if (loc.id === "hotel" && loc.status === "locked") {
          return { ...loc, status: "in_progress" };
        }
        return loc;
      })
    );
  };

  const handleAddXP = (amount: number) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        xp: prev.xp + amount,
      };
      try {
        localStorage.setItem("journeylingo_auth_session", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleFinishOnboarding = (updatedUser: Partial<UserProfile>) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      if (updatedUser.targetLanguage) {
        setLocations(getLocationsForLanguage(updatedUser.targetLanguage));
      }
      try {
        localStorage.setItem("journeylingo_auth_session", JSON.stringify(merged));
      } catch {
        // ignore
      }
      return merged;
    });
    setShowOnboarding(false);
    playChime(true);
  };

  // Auth Gateway: Show Login/Register before opening app if unauthenticated
  if (!isAuthenticated) {
    return (
      <AuthView
        defaultProfile={user}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Dynamically resolve current lesson data based on user's targetLanguage and selectedModuleId
  const currentLessonData = getLessonDataForLanguageAndLocation(
    user.targetLanguage,
    selectedModuleId
  );

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                ⛩️
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 tracking-tight text-lg leading-none">
                    JourneyLingo
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                    MVP
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium leading-none">
                  Journey-based language learning
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("missions")}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === "missions"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Journey Map
            </button>
            <button
              onClick={() => setActiveTab("learn")}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === "learn"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Learn Module
            </button>
            <button
              onClick={() => setActiveTab("practice")}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === "practice"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Practice
            </button>
            <button
              onClick={() => setActiveTab("progress")}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === "progress"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Analytics
            </button>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Interactive Language Selector Dropdown (Fixes language mismatch everywhere) */}
            <div className="relative" ref={languagePickerRef}>
              <button
                onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 rounded-xl text-xs font-bold text-indigo-950 transition-all shadow-2xs group cursor-pointer"
                title="Click to switch learning language & destination city"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-12 transition-transform" />
                <span className="text-sm">{currentLangMeta.flag}</span>
                <span className="font-extrabold">{user.targetLanguage}</span>
                <span className="hidden xl:inline text-slate-500 font-medium">
                  ({currentLangMeta.city})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-500 ml-0.5" />
              </button>

              {showLanguagePicker && (
                <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1.5 border-b border-slate-100 mb-1">
                    Select Target Language
                  </div>
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected =
                        user.targetLanguage.toLowerCase() === lang.name.toLowerCase();
                      return (
                        <button
                          key={lang.id}
                          onClick={() => handleSelectLanguage(lang.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white font-bold shadow-xs"
                              : "hover:bg-slate-100 text-slate-700 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{lang.flag}</span>
                            <div>
                              <div className="leading-tight">{lang.name}</div>
                              <div
                                className={`text-[10px] ${
                                  isSelected ? "text-indigo-200" : "text-slate-400"
                                }`}
                              >
                                {lang.city}, {lang.country}
                              </div>
                            </div>
                          </div>
                          {isSelected && <span className="text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Streak Counter */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{user.streakDays}</span>
            </div>

            {/* XP Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-2xs">
              <Star className="w-3.5 h-3.5 text-indigo-600 fill-indigo-500" />
              <span>{user.xp} XP</span>
            </div>

            {/* Project Presentation & PDF Specs Button */}
            <button
              onClick={() => setShowSpecsModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
              title="View SRMS Internship Project Presentation & PDF specifications"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Project Specs</span>
            </button>

            {/* Onboarding Restart Button */}
            <button
              onClick={() => setShowOnboarding(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Onboarding & Setup Flow (Screens 1-6)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Pill & Log Out */}
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-all border border-slate-200/80 hover:border-rose-200"
                title="Log Out (Switch or change account)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-bold">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === "dashboard" ? "text-indigo-600 font-black" : "text-slate-500"
          }`}
        >
          <Compass className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("missions")}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === "missions" ? "text-indigo-600 font-black" : "text-slate-500"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Journey
        </button>
        <button
          onClick={() => setActiveTab("learn")}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === "learn" ? "text-indigo-600 font-black" : "text-slate-500"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Learn
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === "practice" ? "text-indigo-600 font-black" : "text-slate-500"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Practice
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === "progress" ? "text-indigo-600 font-black" : "text-slate-500"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === "dashboard" && (
          <DashboardView
            user={user}
            locations={locations}
            onNavigateTab={setActiveTab}
            onSelectLocation={(locId) => {
              setSelectedModuleId(locId);
              setActiveTab("learn");
            }}
            sessionSeconds={sessionSeconds}
          />
        )}

        {activeTab === "missions" && (
          <MissionsJourneyView
            locations={locations}
            onSelectLocation={(locId) => {
              setSelectedModuleId(locId);
              setActiveTab("learn");
            }}
            onStartLesson={(locId) => {
              if (locId) setSelectedModuleId(locId);
              setActiveTab("learn");
            }}
          />
        )}

        {activeTab === "learn" && (
          <LearnModuleView
            lesson={currentLessonData}
            user={user}
            selectedModuleId={selectedModuleId}
            onSelectModule={(modId) => setSelectedModuleId(modId)}
            onCompleteLesson={handleCompleteLesson}
            onGoToDashboard={() => setActiveTab("dashboard")}
          />
        )}

        {activeTab === "practice" && (
          <PracticeModuleView
            user={user}
            selectedModuleId={selectedModuleId}
            onSelectModule={(modId) => setSelectedModuleId(modId)}
            onRecordXP={handleAddXP}
          />
        )}

        {activeTab === "progress" && (
          <ProgressAnalyticsView
            user={user}
            sessionSeconds={sessionSeconds}
            onAddXP={handleAddXP}
          />
        )}
      </main>

      {/* MODALS */}
      <OnboardingModal
        isOpen={showOnboarding}
        initialProfile={user}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleFinishOnboarding}
      />

      <PresentationSpecsModal
        isOpen={showSpecsModal}
        onClose={() => setShowSpecsModal(false)}
      />
    </div>
  );
}
