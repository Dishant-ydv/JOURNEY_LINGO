import React, { useState } from "react";
import {
  Globe,
  ArrowRight,
  ArrowLeft,
  Check,
  Plane,
  Sparkles,
  BookOpen,
  Briefcase,
  Heart,
  Compass,
} from "lucide-react";
import { ProficiencyLevel, UserProfile } from "../types";

interface Props {
  isOpen: boolean;
  onComplete: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
  initialProfile: UserProfile;
}

export const OnboardingModal: React.FC<Props> = ({
  isOpen,
  onComplete,
  onClose,
  initialProfile,
}) => {
  const [step, setStep] = useState<number>(1);
  const [nativeLang, setNativeLang] = useState(initialProfile.nativeLanguage);
  const [targetLang, setTargetLang] = useState(initialProfile.targetLanguage);
  const [level, setLevel] = useState<ProficiencyLevel>(initialProfile.level);
  const [primaryGoal, setPrimaryGoal] = useState(initialProfile.primaryGoal);
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>(initialProfile.secondaryGoals);
  const [userName, setUserName] = useState(initialProfile.name);

  if (!isOpen) return null;

  const languages = [
    { name: "Japanese (日本語)", flag: "🇯🇵", label: "Japanese" },
    { name: "English (India)", flag: "🇮🇳", label: "English" },
    { name: "Français (French)", flag: "🇫🇷", label: "French" },
    { name: "Deutsch (German)", flag: "🇩🇪", label: "German" },
    { name: "한국어 (Korean)", flag: "🇰🇷", label: "Korean" },
    { name: "中文 (Chinese)", flag: "🇨🇳", label: "Chinese" },
    { name: "Español (Spanish)", flag: "🇪🇸", label: "Spanish" },
  ];

  const levels: { id: ProficiencyLevel; title: string; desc: string }[] = [
    {
      id: "Beginner",
      title: "Beginner",
      desc: "I'm just starting or know basic phrases",
    },
    {
      id: "Elementary",
      title: "Elementary",
      desc: "I know basic words and simple sentences",
    },
    {
      id: "Intermediate",
      title: "Intermediate",
      desc: "I can have simple conversations",
    },
    {
      id: "Advanced",
      title: "Advanced",
      desc: "I am comfortable and fluent",
    },
  ];

  const goals = [
    { id: "Travel", label: "Travel", desc: "Communicate with confidence while exploring", icon: Plane },
    { id: "Study", label: "Study", desc: "Understand lectures and academic materials", icon: BookOpen },
    { id: "Work", label: "Work", desc: "Use the language in my professional career", icon: Briefcase },
    { id: "Personal Growth", label: "Personal Growth", desc: "Learn for enjoyment, brain fitness & culture", icon: Heart },
  ];

  const secondaryOptions = [
    "Connect with People",
    "Improve Career",
    "Prepare for Exam",
    "Relocation / Immigration",
    "Pop Culture & Anime",
  ];

  const toggleSecondaryGoal = (g: string) => {
    if (secondaryGoals.includes(g)) {
      setSecondaryGoals(secondaryGoals.filter((item) => item !== g));
    } else {
      if (secondaryGoals.length < 3) {
        setSecondaryGoals([...secondaryGoals, g]);
      }
    }
  };

  const handleFinish = () => {
    onComplete({
      name: userName || "Traveler",
      nativeLanguage: nativeLang,
      targetLanguage: targetLang,
      level,
      primaryGoal,
      secondaryGoals,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Step Indicator */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-1.5 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Step {step} of 6
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip to App
          </button>
        </div>

        {/* Screen 1: Onboarding 1 */}
        {step === 1 && (
          <div className="p-6 text-center space-y-5">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200 text-white text-4xl">
              ⛩️
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Learn Languages Through Journeys
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Explore new places, complete real-life missions, and speak with confidence from day one.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                <Compass className="w-4 h-4" />
                Tokyo, Japan Journey Preview:
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-medium">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200">✈️ Airport</div>
                <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200">🏨 Hotel</div>
                <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200">🍜 Dining</div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 2: Onboarding 2 */}
        {step === 2 && (
          <div className="p-6 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 text-white text-3xl">
              🗺️
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Learn by Experiencing
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Complete real-life missions in different places and absorb the language naturally.
              </p>
            </div>

            <div className="space-y-2.5 text-left text-xs">
              {[
                { title: "Airport Check-in", desc: "Pass customs, baggage claim, and buy transit card", icon: "🧳" },
                { title: "Hotel Reception", desc: "Ask for keys, Wi-Fi password, and luggage storage", icon: "🛎️" },
                { title: "Shopping in Akiba", desc: "Tax-free shopping, asking sizes and discounts", icon: "🛍️" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-slate-500 text-[11px]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 3: Login / Welcome */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md text-2xl mb-3">
                🌍
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">JourneyLingo</h2>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                Don't study a language. Travel through it.
              </p>
              <h3 className="text-lg font-bold text-slate-800 mt-4">Welcome back!</h3>
              <p className="text-xs text-slate-500">Log in to continue your journey</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-600"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              Continue to Preferences
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 4: Choose Language */}
        {step === 4 && (
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Let's personalize your journey
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                We'll show content in your native language and help you master your target language.
              </p>
            </div>

            {/* Native Language */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                1. Select your Native Language (You speak)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {languages.slice(0, 4).map((lang) => {
                  const selected = nativeLang.includes(lang.label);
                  return (
                    <button
                      key={lang.name}
                      onClick={() => setNativeLang(lang.name)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs transition-all ${
                        selected
                          ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-950"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="truncate">{lang.label}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-indigo-600 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Language */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                2. Select your Target Language (You want to learn)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => {
                  const selected = targetLang.includes(lang.label);
                  return (
                    <button
                      key={lang.name}
                      onClick={() => setTargetLang(lang.name)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs transition-all ${
                        selected
                          ? "border-indigo-600 bg-indigo-50/70 font-bold text-indigo-950"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="truncate">{lang.name.split(" ")[0]}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-indigo-600 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStep(5)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all mt-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 5: Level & Goal Selection */}
        {step === 5 && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Set up your learning path
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                This helps us calibrate the right travel missions and speech speed.
              </p>
            </div>

            {/* Level selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                1. Choose your level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {levels.map((lvl) => {
                  const selected = level === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => setLevel(lvl.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selected
                          ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        {lvl.title}
                        {selected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                        {lvl.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                2. What is your primary goal?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {goals.map((g) => {
                  const Icon = g.icon;
                  const selected = primaryGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selected
                          ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold"
                          : "border-slate-200 hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-indigo-600 mb-1" />
                      <div>{g.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Goals */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                3. Secondary goals (Pick up to 3)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {secondaryOptions.map((opt) => {
                  const selected = secondaryGoals.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleSecondaryGoal(opt)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                        selected
                          ? "bg-indigo-600 text-white font-medium shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setStep(6)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all mt-2"
            >
              Continue to Preview
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Screen 6: Journey Set Up Preview */}
        {step === 6 && (
          <div className="p-6 space-y-4">
            <div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 font-bold text-lg">
                ✓
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                All set! Here's your journey preview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your selections. You can change them anytime in Settings.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Learner</span>
                <span className="font-bold text-slate-900">{userName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Native Language</span>
                <span className="font-bold text-slate-900">{nativeLang}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Target Language</span>
                <span className="font-bold text-indigo-700">{targetLang}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500">Level & Goal</span>
                <span className="font-bold text-slate-900">
                  {level} • {primaryGoal}
                </span>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3.5 text-xs text-indigo-950">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-indigo-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                What's Next?
              </div>
              <ol className="list-decimal pl-4 space-y-0.5 text-indigo-800 text-[11px]">
                <li>1. Start Your Journey in Tokyo (Airport ➔ Hotel Check-in)</li>
                <li>2. Complete 10-step mission lessons and practice speaking</li>
                <li>3. Unlock sequential destinations & earn milestone XP</li>
              </ol>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              Start My Journey
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
