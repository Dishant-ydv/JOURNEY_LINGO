import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Globe,
  ArrowRight,
  CheckCircle2,
  Plane,
  KeyRound,
  Check,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { UserProfile, ProficiencyLevel } from "../types";
import { playChime } from "../utils/audio";

interface AuthViewProps {
  onLoginSuccess: (userProfile: UserProfile) => void;
  defaultProfile: UserProfile;
}

type AuthMode = "login" | "register";

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  defaultProfile,
}) => {
  const [mode, setMode] = useState<AuthMode>("login");

  // Login Form States
  const [loginEmail, setLoginEmail] = useState<string>(() => {
    try {
      return localStorage.getItem("journeylingo_saved_email") || "";
    } catch {
      return "";
    }
  });
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regNativeLang, setRegNativeLang] = useState("English (India)");
  const [regTargetCity, setRegTargetCity] = useState("Tokyo, Japan");
  const [regTargetLang, setRegTargetLang] = useState("Japanese (日本語)");
  const [regLevel, setRegLevel] = useState<ProficiencyLevel>("Beginner");
  const [regGoal, setRegGoal] = useState("Travel & Vacation");
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Target destinations list
  const destinations = [
    { city: "Tokyo, Japan", lang: "Japanese (日本語)", flag: "🇯🇵", country: "Japan" },
    { city: "Seoul, South Korea", lang: "Korean (한국어)", flag: "🇰🇷", country: "South Korea" },
    { city: "Paris, France", lang: "French (Français)", flag: "🇫🇷", country: "France" },
    { city: "Madrid, Spain", lang: "Spanish (Español)", flag: "🇪🇸", country: "Spain" },
    { city: "Berlin, Germany", lang: "German (Deutsch)", flag: "🇩🇪", country: "Germany" },
    { city: "Rome, Italy", lang: "Italian (Italiano)", flag: "🇮🇹", country: "Italy" },
  ];

  // Native languages
  const nativeLanguages = [
    "English (India)",
    "English (US / Global)",
    "Hindi (हिन्दी)",
    "Bengali (বাংলা)",
    "Spanish (Español)",
    "French (Français)",
    "German (Deutsch)",
  ];

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const regPasswordScore = getPasswordStrength(regPassword);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage("Please enter your email or username.");
      playChime(false);
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMessage("Please enter your password.");
      playChime(false);
      return;
    }

    if (loginPassword.length < 4) {
      setErrorMessage("Password must be at least 4 characters.");
      playChime(false);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      playChime(true);
      setSuccessMessage("Welcome back! Loading your learning journey...");

      // Generate or retrieve profile
      const derivedName = loginEmail.includes("@")
        ? loginEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : loginEmail;

      const loggedInProfile: UserProfile = {
        ...defaultProfile,
        name: derivedName.trim() || defaultProfile.name || "Learner",
        email: loginEmail,
      };

      if (rememberMe) {
        try {
          localStorage.setItem("journeylingo_saved_email", loginEmail);
          localStorage.setItem("journeylingo_auth_session", JSON.stringify(loggedInProfile));
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        onLoginSuccess(loggedInProfile);
      }, 600);
    }, 700);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage("Please enter your full name.");
      playChime(false);
      return;
    }

    if (!regEmail.trim() || !regEmail.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      playChime(false);
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      playChime(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      playChime(false);
      return;
    }

    if (!regTermsAccepted) {
      setErrorMessage("Please agree to the learning terms to continue.");
      playChime(false);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      playChime(true);
      setSuccessMessage("Account created successfully! Preparing your passport...");

      const matchedDest = destinations.find((d) => d.city === regTargetCity) || destinations[0];

      const newProfile: UserProfile = {
        ...defaultProfile,
        name: regName.trim(),
        email: regEmail.trim(),
        nativeLanguage: regNativeLang,
        targetLanguage: matchedDest.lang,
        targetCity: matchedDest.city.split(",")[0].trim(),
        targetCountry: matchedDest.country,
        level: regLevel,
        primaryGoal: regGoal,
        streakDays: 1,
        xp: 150, // Welcome bonus
        levelNumber: 1,
        levelTitle: "Novice Traveler",
        wordsLearned: 5,
        conversationsPracticed: 1,
        missionsCompleted: 1,
        studyTimeMinutes: 10,
        accuracyRate: 90,
        todayProgress: 25,
      };

      try {
        localStorage.setItem("journeylingo_saved_email", regEmail);
        localStorage.setItem("journeylingo_auth_session", JSON.stringify(newProfile));
      } catch {
        // ignore
      }

      setTimeout(() => {
        onLoginSuccess(newProfile);
      }, 650);
    }, 800);
  };

  // Quick Demo Login
  const handleQuickDemo = (name: string, email: string, level: ProficiencyLevel) => {
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsLoading(false);
      playChime(true);
      const demoUser: UserProfile = {
        ...defaultProfile,
        name,
        email,
        level,
        xp: level === "Beginner" ? 1250 : 3400,
        streakDays: level === "Beginner" ? 7 : 21,
      };
      onLoginSuccess(demoUser);
    }, 450);
  };

  // Guest login
  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      playChime(true);
      onLoginSuccess({
        ...defaultProfile,
        name: "Guest Traveler",
        email: "guest@journeylingo.app",
      });
    }, 350);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Decorative ambient travel glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top branding bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Journey<span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-sky-400">Lingo</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Authentic Scenario-Based Language Immersion
            </p>
          </div>
        </div>

        <button
          onClick={handleGuestLogin}
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition-all flex items-center gap-1.5"
        >
          <span>Explore as Guest</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Center main authentication area */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Feature highlights / Product Preview (hidden on smaller mobile) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Internship Project Presentation Edition</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              Master languages by{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-indigo-300 to-rose-300">
                traveling authentic scenarios.
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Step beyond rote vocabulary drills. Navigate Narita Airport, check into your Shibuya hotel, order ramen at local izakayas, and talk with AI local guides.
            </p>

            {/* Feature cards */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sequential Journey Map</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Progress from Airport to Hotel, Subway, and Night Markets in order.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Voice Roleplay & Intonation</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Realistic speech recognition and native accent feedback.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Real-Time Competency Telemetry</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recharts telemetry tracking XP, accuracy curves, and vocabulary retention.
                  </p>
                </div>
              </div>
            </div>

            {/* Traveler Quote */}
            <div className="mt-2 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center gap-3">
              <span className="text-xl">🇯🇵</span>
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Destination Target: </span>
                Tokyo, Shibuya & Shinjuku Journey active
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card (Login / Register) */}
          <div className="lg:col-span-7 w-full max-w-lg mx-auto">
            <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
              {/* Tab Selector: Login vs Register */}
              <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-white/10 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === "login"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    mode === "register"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* ===================== LOGIN FORM ===================== */}
              {mode === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email or Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                        title={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & auto-save */}
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-sm border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                      />
                      <span>Remember me on this browser</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Your Journey</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Quick Demo Logins Section */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>One-Click Demo Evaluator Profiles</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickDemo(
                            "Alex Morgan",
                            "alex.demo@journeylingo.app",
                            "Beginner"
                          )
                        }
                        className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                            Alex Morgan 🇯🇵
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-300 font-semibold">
                            Tokyo
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Beginner · 7 Day Streak · 1,250 XP
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuickDemo(
                            "Priya Sharma",
                            "priya.sharma@example.com",
                            "Intermediate"
                          )
                        }
                        className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                            Priya Sharma 🇯🇵
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 font-semibold">
                            Kyoto
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Intermediate · 21 Day Streak · 3,400 XP
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* ===================== REGISTER FORM ===================== */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Name & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showRegPassword ? "text" : "password"}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full pl-9 pr-8 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-indigo-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showRegPassword ? "text" : "password"}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-type password"
                          className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {regPassword.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Strength</span>
                        <span
                          className={
                            regPasswordScore >= 4
                              ? "text-emerald-400 font-bold"
                              : regPasswordScore >= 2
                              ? "text-amber-400 font-bold"
                              : "text-rose-400 font-bold"
                          }
                        >
                          {regPasswordScore >= 4 ? "Strong" : regPasswordScore >= 2 ? "Moderate" : "Weak"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            regPasswordScore >= 1 ? "bg-rose-500" : "bg-slate-700"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            regPasswordScore >= 2 ? "bg-amber-500" : "bg-slate-700"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            regPasswordScore >= 3 ? "bg-sky-500" : "bg-slate-700"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            regPasswordScore >= 4 ? "bg-emerald-500" : "bg-slate-700"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Target Destination & Language */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Choose Your Destination & Target Language
                    </label>
                    <select
                      value={regTargetCity}
                      onChange={(e) => {
                        setRegTargetCity(e.target.value);
                        const match = destinations.find((d) => d.city === e.target.value);
                        if (match) setRegTargetLang(match.lang);
                      }}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                    >
                      {destinations.map((d) => (
                        <option key={d.city} value={d.city}>
                          {d.flag} {d.city} — {d.lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Native Language & Level row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your Native Language
                      </label>
                      <select
                        value={regNativeLang}
                        onChange={(e) => setRegNativeLang(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                      >
                        {nativeLanguages.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Current Proficiency Level
                      </label>
                      <select
                        value={regLevel}
                        onChange={(e) => setRegLevel(e.target.value as ProficiencyLevel)}
                        className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-indigo-500"
                      >
                        <option value="Beginner">Beginner (Starting fresh)</option>
                        <option value="Elementary">Elementary (Know basic words)</option>
                        <option value="Intermediate">Intermediate (Simple conversations)</option>
                        <option value="Advanced">Advanced (Fluency polishing)</option>
                      </select>
                    </div>
                  </div>

                  {/* Primary Goal */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Primary Learning Goal
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Travel & Vacation",
                        "Live & Work Abroad",
                        "Conversational Fluency",
                        "Pass Language Exam",
                      ].map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setRegGoal(goal)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium text-left border transition-all ${
                            regGoal === goal
                              ? "bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold"
                              : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2 pt-1 cursor-pointer select-none text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={regTermsAccepted}
                      onChange={(e) => setRegTermsAccepted(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-sm border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 mt-0.5"
                    />
                    <span>
                      I agree to the JourneyLingo Traveler Learning Guidelines and local storage session persistence.
                    </span>
                  </label>

                  {/* Submit Registration */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account & Start Journey</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-white/10 gap-2">
        <div>
          <span>JourneyLingo © 2025-2026. Inspired by SRMS Internship Specifications.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-slate-300">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> Offline Capable
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Secure Local Auth
          </span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 relative text-white shadow-2xl">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-indigo-400 mb-3">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Reset Traveler Password</h3>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-3 text-center py-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Recovery Link Sent!</h4>
                <p className="text-xs text-slate-300">
                  We have simulated sending a secure reset link to{" "}
                  <span className="text-indigo-300 font-semibold">{forgotEmail || loginEmail}</span>. You can use your demo credentials anytime.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold mt-2"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSubmitted(true);
                  playChime(true);
                }}
                className="space-y-4"
              >
                <p className="text-xs text-slate-300">
                  Enter your registered account email and we will generate an instant access recovery token for your journey.
                </p>
                <input
                  type="email"
                  value={forgotEmail || loginEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Send Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
