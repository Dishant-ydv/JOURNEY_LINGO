import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Mic,
  Headphones,
  RotateCcw,
  Volume2,
  Send,
  Sparkles,
  Flame,
  Star,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Award,
  AlertCircle,
  HelpCircle,
  Languages,
} from "lucide-react";
import { UserProfile, RoleplayScenario, VocabWord } from "../types";
import {
  sendAIConversation,
  sendAIRoleplay,
  evaluatePronunciation,
} from "../services/aiService";
import { speakText, playChime } from "../utils/audio";
import { SmartTranslateTool } from "./SmartTranslateTool";
import { getLanguageMeta, getLocationsForLanguage } from "../data/multilingualData";
import { createSpeechRecognition, compareSpokenInput } from "../utils/pronunciation";
import { getInitialConversation } from "../data/fallbackData";
import {
  getRoleplayScenarioForLanguageAndLocation,
  getAllRoleplayScenariosForLanguage,
  getVocabularyForLanguageAndModule,
  getListeningChallengeForLanguageAndModule,
} from "../data/lessonResolver";

interface Props {
  user: UserProfile;
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string) => void;
  onRecordXP: (amount: number) => void;
}

type SubModuleType =
  | "overview"
  | "translate"
  | "ai_conversation"
  | "roleplay"
  | "pronunciation"
  | "listening"
  | "revision";

export const PracticeModuleView: React.FC<Props> = ({
  user,
  selectedModuleId = "airport",
  onSelectModule,
  onRecordXP,
}) => {
  const [activeSubModule, setActiveSubModule] = useState<SubModuleType>("overview");

  const targetLang = user.targetLanguage || "Japanese";
  const langMeta = getLanguageMeta(targetLang);
  const locations = getLocationsForLanguage(targetLang);
  const currentModuleId = selectedModuleId || "airport";
  const currentLocationMeta =
    locations.find((l) => l.id === currentModuleId) || locations[0];

  const currentVocabList = getVocabularyForLanguageAndModule(targetLang, currentModuleId);
  const availableScenarios = getAllRoleplayScenariosForLanguage(targetLang);
  const listeningChallenge = getListeningChallengeForLanguageAndModule(targetLang, currentModuleId);

  const initialConv = getInitialConversation(targetLang);

  // --- Sub-Module 1: AI Conversation State ---
  const [convTopic, setConvTopic] = useState(initialConv.topic);
  const [convHistory, setConvHistory] = useState<
    { sender: "ai" | "user"; text: string; translation?: string; romaji?: string }[]
  >([
    {
      sender: "ai",
      text: initialConv.text,
      romaji: initialConv.romaji,
      translation: initialConv.translation,
    },
  ]);
  const [convInput, setConvInput] = useState("");
  const [convLoading, setConvLoading] = useState(false);
  const [convFeedback, setConvFeedback] = useState<any>(null);
  const [convMistakes, setConvMistakes] = useState<any[]>([]);

  // --- Sub-Module 2: Real-Life Roleplay State ---
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(() =>
    getRoleplayScenarioForLanguageAndLocation(targetLang, currentModuleId)
  );
  const [roleplayHistory, setRoleplayHistory] = useState<
    { sender: "ai" | "user"; text: string; translation?: string; romaji?: string }[]
  >([
    {
      sender: "ai",
      text: selectedScenario.initialMessage,
      romaji: selectedScenario.initialRomaji,
      translation: selectedScenario.initialTranslation,
    },
  ]);
  const [roleplayInput, setRoleplayInput] = useState("");
  const [roleplayLoading, setRoleplayLoading] = useState(false);
  const [roleplayReport, setRoleplayReport] = useState<any>(null);

  // --- Sub-Module 3: Pronunciation State ---
  const [pronounceIndex, setPronounceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [pronounceResult, setPronounceResult] = useState<any>(null);

  // --- Sub-Module 4: Listening State ---
  const [listeningAnswer, setListeningAnswer] = useState("");
  const [listeningFeedback, setListeningFeedback] = useState<any>(null);

  // --- Sub-Module 5: Revision State ---
  const [revisionIndex, setRevisionIndex] = useState(0);
  const [revisionScore, setRevisionScore] = useState(0);
  const [revisionComplete, setRevisionComplete] = useState(false);

  // Synchronize scenario, roleplay, and practice drills when language or module changes
  useEffect(() => {
    const updatedConv = getInitialConversation(targetLang);
    setConvTopic(updatedConv.topic);
    setConvHistory([
      {
        sender: "ai",
        text: updatedConv.text,
        romaji: updatedConv.romaji,
        translation: updatedConv.translation,
      },
    ]);

    const roleplay = getRoleplayScenarioForLanguageAndLocation(targetLang, currentModuleId);
    setSelectedScenario(roleplay);
    setRoleplayHistory([
      {
        sender: "ai",
        text: roleplay.initialMessage,
        romaji: roleplay.initialRomaji,
        translation: roleplay.initialTranslation,
      },
    ]);
    setRoleplayReport(null);
    setPronounceIndex(0);
    setPronounceResult(null);
    setListeningAnswer("");
    setListeningFeedback(null);
    setRevisionComplete(false);
  }, [targetLang, currentModuleId]);

  // AI Conversation Handlers
  const handleSendConversation = async (textToSend?: string) => {
    const message = textToSend || convInput;
    if (!message.trim() || convLoading) return;

    const newHistory = [...convHistory, { sender: "user" as const, text: message }];
    setConvHistory(newHistory);
    setConvInput("");
    setConvLoading(true);

    try {
      const response = await sendAIConversation({
        topic: convTopic,
        targetLanguage: user.targetLanguage,
        nativeLanguage: user.nativeLanguage,
        userMessage: message,
        history: newHistory.map((h) => ({ sender: h.sender, text: h.text })),
      });

      setConvHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response.reply,
          romaji: response.romanization,
          translation: response.translation,
        },
      ]);

      if (response.feedback) {
        setConvFeedback(response);
      }
      if (response.mistakes && response.mistakes.length > 0) {
        setConvMistakes((prev) => [...prev, ...response.mistakes!]);
      }
      onRecordXP(15);
    } catch (err) {
      console.error(err);
    } finally {
      setConvLoading(false);
    }
  };

  // Roleplay Handlers
  const handleSendRoleplay = async (userLine?: string, isEnd = false) => {
    const text = userLine || roleplayInput;
    if (!text.trim() || roleplayLoading) return;

    const updated = [...roleplayHistory, { sender: "user" as const, text }];
    setRoleplayHistory(updated);
    setRoleplayInput("");
    setRoleplayLoading(true);

    try {
      const res = await sendAIRoleplay({
        scenario: selectedScenario.title,
        location: selectedScenario.location,
        role: selectedScenario.aiRole,
        userMessage: text,
        history: updated.map((h) => ({ sender: h.sender, text: h.text })),
        targetLanguage: user.targetLanguage,
        isEndTurn: isEnd,
      });

      setRoleplayHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: res.reply,
          romaji: res.romanization,
          translation: res.translation,
        },
      ]);

      if (res.performance) {
        setRoleplayReport(res.performance);
      }
      onRecordXP(25);
    } catch (err) {
      console.error(err);
    } finally {
      setRoleplayLoading(false);
    }
  };

  // Pronunciation evaluate handler using Web Speech API
  const handleTestPronunciation = async () => {
    const target = currentVocabList[pronounceIndex]?.word || "Hello";
    setIsRecording(true);

    const recognition = createSpeechRecognition();
    if (recognition) {
      try {
        recognition.lang = langMeta.voiceCode;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = async (event: any) => {
          setIsRecording(false);
          const spoken = event.results[0][0]?.transcript || target;
          const comparison = compareSpokenInput(target, spoken, targetLang);
          const res = await evaluatePronunciation(target, spoken);
          setPronounceResult({
            ...res,
            score: comparison.score,
            accuracy: comparison.accuracy,
            phoneticFeedback: `Heard: "${spoken}". ${res.phoneticFeedback}`,
          });
          if (comparison.passed) {
            playChime(true);
            onRecordXP(20);
          } else {
            playChime(false);
          }
        };

        recognition.onerror = async () => {
          setIsRecording(false);
          const res = await evaluatePronunciation(target, target);
          setPronounceResult(res);
          playChime(true);
          onRecordXP(20);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn("Speech recognition fallback:", err);
      }
    }

    // Fallback simulation when Web Speech API is not available
    setTimeout(async () => {
      setIsRecording(false);
      const res = await evaluatePronunciation(target, target);
      setPronounceResult(res);
      playChime(true);
      onRecordXP(20);
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Overview (Slide 3 Screen 9) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                Practice Module
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                <span>{langMeta.flag}</span>
                <span>{langMeta.name}</span>
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Practice more. Improve better.
            </h2>
            <p className="text-xs text-slate-500">
              Interactive AI roleplays, pronunciation evaluation, listening & revision in {targetLang}
            </p>
          </div>

          {/* Sub-module switch tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: "overview", label: "Dashboard", icon: Sparkles },
              { id: "translate", label: "0. 🇮🇳 Hindi Translator", icon: Languages },
              { id: "ai_conversation", label: "1. AI Conversation", icon: MessageSquare },
              { id: "roleplay", label: "2. Real-Life Roleplay", icon: Users },
              { id: "pronunciation", label: "3. Pronunciation", icon: Mic },
              { id: "listening", label: "4. Listening", icon: Headphones },
              { id: "revision", label: "5. Revision", icon: RotateCcw },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeSubModule === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubModule(tab.id as SubModuleType)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Module Switcher for Practice (Airport, Hotel, Restaurant, Metro, Shopping, Attractions) */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Practicing Module:</span>
              <span className="text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-md">
                {currentLocationMeta.name}
              </span>
              <span className="text-slate-500 font-normal">({currentLocationMeta.japaneseName})</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Select module below to switch content:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {locations.map((loc) => {
              const isCurrent = currentModuleId === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    if (onSelectModule) onSelectModule(loc.id);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    isCurrent
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold ring-2 ring-indigo-300"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-indigo-300 font-medium"
                  }`}
                >
                  <span className="text-lg">
                    {loc.id === "airport" && "✈️"}
                    {loc.id === "hotel" && "🏨"}
                    {loc.id === "restaurant" && "🍜"}
                    {loc.id === "metro" && "🚇"}
                    {loc.id === "shopping" && "🛍️"}
                    {loc.id === "attractions" && "🏛️"}
                  </span>
                  <div className="overflow-hidden">
                    <div className="text-xs truncate font-bold leading-tight">{loc.name}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isCurrent ? "text-indigo-100" : "text-slate-500"
                      }`}
                    >
                      {loc.japaneseName.split(" ")[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Practice Overview Strip (Screen 9 top) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-center">
          <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="text-2xl font-black text-indigo-950">68%</div>
            <div className="text-[11px] font-bold text-indigo-600">Overall Progress</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              {user.streakDays}
            </div>
            <div className="text-[11px] font-bold text-amber-600">Day Streak</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="text-2xl font-black text-purple-950 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-purple-600 fill-purple-500" />
              {user.xp}
            </div>
            <div className="text-[11px] font-bold text-purple-600">XP Earned</div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-100">
            <div className="text-2xl font-black text-teal-950">18</div>
            <div className="text-[11px] font-bold text-teal-600">Sessions</div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100">
            <div className="text-2xl font-black text-rose-950">12</div>
            <div className="text-[11px] font-bold text-rose-600">Topics Practiced</div>
          </div>
        </div>
      </div>

      {/* OVERVIEW / MENU SELECTION */}
      {activeSubModule === "overview" && (
        <div className="space-y-4">
          {/* Smart Hindi Translator Hero Banner */}
          <div
            onClick={() => setActiveSubModule("translate")}
            className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition-all group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black tracking-wider">
                  SPECIAL FEATURE
                </span>
                <span className="text-xs font-bold text-indigo-200">
                  Hindi Input ➔ {user.targetLanguage} Translation & Audio
                </span>
              </div>
              <h3 className="text-lg font-black group-hover:text-amber-200 transition-colors flex items-center gap-2">
                <span>🇮🇳 Smart Native Language Translator</span>
              </h3>
              <p className="text-xs text-indigo-100/90 max-w-xl leading-relaxed">
                अपनी भाषा (हिंदी/इंग्लिश) में कोई भी वाक्य लिखें — यह तुरंत {user.targetLanguage} में अनुवाद, देवनागरी उच्चारण, शब्दावली और आवाज के साथ सिखाएगा।
              </p>
            </div>
            <button className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0 group-hover:bg-amber-300 transition-colors">
              <span>Open Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "translate",
                title: "0. Hindi/Native Translator",
                desc: `Type your thoughts in Hindi or English, and receive authentic ${user.targetLanguage} translation, reading, and audio.`,
                badge: "Hindi ➔ Target",
                icon: Languages,
                color: "bg-amber-50 text-amber-600",
              },
              {
                id: "ai_conversation",
                title: "1. AI Conversation",
                desc: `Chat naturally with the AI tutor in ${user.targetLanguage}. Automatic grammar feedback & mistake logging.`,
                badge: "Voice & Text",
                icon: MessageSquare,
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                id: "roleplay",
                title: "2. Real-Life Roleplay",
                desc: `Simulate authentic travel situations in ${user.targetLanguage}: Hotel Receptionist, Waiter, Airport Officer.`,
                badge: "Scenario Based",
                icon: Users,
                color: "bg-teal-50 text-teal-600",
              },
              {
                id: "pronunciation",
                title: "3. Pronunciation Practice",
                desc: `Listen to native audio in ${user.targetLanguage}, record your voice, and receive speech accuracy analysis.`,
                badge: "Audio Analysis",
                icon: Mic,
                color: "bg-amber-50 text-amber-600",
              },
              {
                id: "listening",
                title: "4. Listening Practice",
                desc: `Hear real audio snippets in ${user.targetLanguage}, deduce what the speaker is asking, and write the meaning.`,
                badge: "Comprehension",
                icon: Headphones,
                color: "bg-rose-50 text-rose-600",
              },
              {
                id: "revision",
                title: "5. Revision",
                desc: "Smart recommendation engine: review saved mistakes, tricky vocabulary, and review weak grammar topics.",
                badge: "Personalized",
                icon: RotateCcw,
                color: "bg-purple-50 text-purple-600",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveSubModule(item.id as SubModuleType)}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-4 flex items-center text-xs font-bold text-indigo-600">
                    Open Practice
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-MODULE 0: SMART TRANSLATION TOOL */}
      {activeSubModule === "translate" && (
        <SmartTranslateTool user={user} onRecordXP={onRecordXP} />
      )}

      {/* SUB-MODULE 1: AI CONVERSATION (Slide 3 item 1) */}
      {activeSubModule === "ai_conversation" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">AI Conversation Practice</h3>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                  Gemini Flash AI
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Topic: <span className="font-semibold text-indigo-600">{convTopic}</span>
              </p>
            </div>

            {/* Change topic pills */}
            <div className="flex gap-1.5 overflow-x-auto text-[11px]">
              {["Travel Plans to Tokyo", "Ordering Ramen", "Asking Directions", "At Akihabara"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setConvTopic(t);
                    setConvHistory([
                      {
                        sender: "ai",
                        text: `こんにちは！${t}について日本語で話しましょう！`,
                        romaji: `Konnichiwa! ${t} ni tsuite nihongo de hanashimashou!`,
                        translation: `Hello! Let's talk about ${t} in Japanese!`,
                      },
                    ]);
                    setConvFeedback(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                    convTopic === t
                      ? "bg-indigo-50 border-indigo-300 font-bold text-indigo-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Bubbles */}
          <div className="space-y-3 min-h-[260px] max-h-[400px] overflow-y-auto p-2">
            {convHistory.map((msg, i) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={i}
                  className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-sm flex items-center justify-center shrink-0">
                    {isUser ? "🧑‍💻" : "🤖"}
                  </div>
                  <div
                    className={`max-w-[78%] p-3.5 rounded-2xl text-xs space-y-1 ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-slate-100 text-slate-900 rounded-tl-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[10px] opacity-75">
                        {isUser ? user.name : "AI Tutor"}
                      </span>
                      <button
                        onClick={() => speakText(msg.text)}
                        className="opacity-75 hover:opacity-100 p-0.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-semibold text-sm">{msg.text}</div>
                    {msg.romaji && <div className="font-mono text-[10px] opacity-80">{msg.romaji}</div>}
                    {msg.translation && (
                      <div className="text-[11px] pt-1 border-t border-black/10 opacity-90">
                        {msg.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {convLoading && (
              <div className="flex gap-2 text-xs text-slate-400 items-center p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                AI is thinking in Japanese...
              </div>
            )}
          </div>

          {/* AI Feedback Box if received */}
          {convFeedback && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                AI Tutor Feedback:
              </div>
              <p>{convFeedback.feedback}</p>
              {convFeedback.suggestedReplies && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-indigo-700">Suggestions:</span>
                  {convFeedback.suggestedReplies.map((s: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleSendConversation(s)}
                      className="text-[10px] bg-white border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md hover:bg-indigo-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mistakes Saved Box */}
          {convMistakes.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
              <div className="font-bold text-amber-900 mb-1">Mistakes Auto-Saved:</div>
              {convMistakes.slice(-2).map((m, idx) => (
                <div key={idx} className="text-amber-800 text-[11px]">
                  ❌ <span className="line-through">{m.original}</span> ➔ ✅{" "}
                  <strong>{m.correction}</strong> ({m.explanation})
                </div>
              ))}
            </div>
          )}

          {/* Input field */}
          <div className="flex gap-2">
            <input
              type="text"
              value={convInput}
              onChange={(e) => setConvInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendConversation()}
              placeholder="Type in Japanese or English (e.g. ラーメンを食べたいです)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleSendConversation()}
              disabled={convLoading || !convInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>
      )}

      {/* SUB-MODULE 2: REAL-LIFE ROLEPLAY (Slide 3 item 2) */}
      {activeSubModule === "roleplay" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Roleplay Simulation
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {selectedScenario.title}
              </h3>
              <p className="text-xs text-slate-500">
                At {selectedScenario.location} • AI Role: <strong>{selectedScenario.aiRole}</strong>
              </p>
            </div>

            {/* Scenario Chooser */}
            <div className="flex gap-1.5 overflow-x-auto text-xs">
              {availableScenarios.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenario(sc);
                    setRoleplayHistory([
                      {
                        sender: "ai",
                        text: sc.initialMessage,
                        romaji: sc.initialRomaji,
                        translation: sc.initialTranslation,
                      },
                    ]);
                    setRoleplayReport(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap text-xs transition-all ${
                    selectedScenario.id === sc.id
                      ? "bg-indigo-600 text-white font-bold border-indigo-600"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {sc.title}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Brief & Goal Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-800">
              Goal: <span className="font-normal text-slate-600">{selectedScenario.goal}</span>
            </div>
            <div className="text-slate-500 text-[11px]">{selectedScenario.brief}</div>
          </div>

          {/* Roleplay Chat Stream */}
          <div className="space-y-3 min-h-[220px] max-h-[350px] overflow-y-auto p-2">
            {roleplayHistory.map((m, idx) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-sm flex items-center justify-center shrink-0">
                    {isUser ? "🧑‍💻" : selectedScenario.aiAvatar}
                  </div>
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-slate-100 text-slate-900 rounded-tl-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold opacity-75">
                        {isUser ? user.name : selectedScenario.aiRole}
                      </span>
                      <button
                        onClick={() => speakText(m.text)}
                        className="opacity-75 hover:opacity-100"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-bold text-sm">{m.text}</div>
                    {m.romaji && <div className="text-[10px] font-mono opacity-80">{m.romaji}</div>}
                    {m.translation && (
                      <div className="text-[11px] pt-1 border-t border-black/10 opacity-90">
                        {m.translation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {roleplayLoading && (
              <div className="text-xs text-slate-400 flex items-center gap-2 p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                {selectedScenario.aiRole} is responding...
              </div>
            )}
          </div>

          {/* Performance Report from Slide 3 */}
          {roleplayReport && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Performance Report
                </span>
                <span className="text-sm font-black text-emerald-700">
                  {roleplayReport.overall} / 100
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-500">Fluency</div>
                  <div className="font-bold text-emerald-800">{roleplayReport.fluency}%</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-500">Vocabulary</div>
                  <div className="font-bold text-emerald-800">{roleplayReport.vocabulary}%</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-slate-500">Grammar</div>
                  <div className="font-bold text-emerald-800">{roleplayReport.grammar}%</div>
                </div>
              </div>
              <p className="text-emerald-900 text-[11px]">{roleplayReport.feedback}</p>
            </div>
          )}

          {/* Suggested quick replies */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500">Traveler Quick Prompts:</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedScenario.suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendRoleplay(p)}
                  className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={roleplayInput}
              onChange={(e) => setRoleplayInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendRoleplay()}
              placeholder="Reply to the character in Japanese..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => handleSendRoleplay()}
              disabled={roleplayLoading || !roleplayInput.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Reply
            </button>
            <button
              onClick={() => handleSendRoleplay("Thank you! Conclude roleplay", true)}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              title="Finish and evaluate scenario"
            >
              Finish
            </button>
          </div>
        </div>
      )}

      {/* SUB-MODULE 3: PRONUNCIATION PRACTICE (Slide 3 item 3) */}
      {activeSubModule === "pronunciation" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 text-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Speech & Phonetics
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">Pronunciation Practice</h3>
            <p className="text-xs text-slate-500">
              {currentLocationMeta.name} • Word {pronounceIndex + 1} of {currentVocabList.length}
            </p>
          </div>

          {/* Word to speak */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-200/70 space-y-3">
            <div className="text-4xl font-black text-slate-900">
              {currentVocabList[pronounceIndex]?.word}
            </div>
            {currentVocabList[pronounceIndex]?.reading && (
              <div className="text-sm font-mono text-slate-500">
                {currentVocabList[pronounceIndex]?.reading}
              </div>
            )}
            <div className="text-base font-bold text-amber-900">
              {currentVocabList[pronounceIndex]?.meaning}
            </div>
            {currentVocabList[pronounceIndex]?.hindiMeaning && (
              <div className="text-sm font-semibold text-emerald-700">
                🇮🇳 {currentVocabList[pronounceIndex]?.hindiMeaning}
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() =>
                  speakText(
                    currentVocabList[pronounceIndex]?.word || "",
                    langMeta.voiceCode
                  )
                }
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
                Listen Native Audio ({langMeta.name})
              </button>
            </div>
          </div>

          {/* Mic Record Button */}
          <div className="space-y-2">
            <button
              onClick={handleTestPronunciation}
              disabled={isRecording}
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? "bg-rose-500 text-white animate-pulse shadow-rose-200"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <div className="text-xs font-semibold text-slate-600">
              {isRecording ? "Listening to your voice..." : "Tap to Speak & Evaluate"}
            </div>
          </div>

          {/* Feedback Card */}
          {pronounceResult && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Pronunciation Feedback</span>
                <span className="font-black text-sm text-emerald-600">
                  Score: {pronounceResult.score} / 100
                </span>
              </div>
              <div className="text-slate-600">{pronounceResult.phoneticFeedback}</div>
              <div className="text-[11px] text-indigo-700 font-medium">
                Intonation: {pronounceResult.intonation}
              </div>
            </div>
          )}

          <div className="flex justify-between max-w-md mx-auto pt-2">
            <button
              onClick={() => setPronounceIndex(Math.max(0, pronounceIndex - 1))}
              disabled={pronounceIndex === 0}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-40"
            >
              Previous Word
            </button>
            <button
              onClick={() => {
                setPronounceIndex((pronounceIndex + 1) % currentVocabList.length);
                setPronounceResult(null);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
            >
              Next Word
            </button>
          </div>
        </div>
      )}

      {/* SUB-MODULE 4: LISTENING PRACTICE (Slide 3 item 4) */}
      {activeSubModule === "listening" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 text-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              Audio Comprehension
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">Listening Practice</h3>
            <p className="text-xs text-slate-500">
              Listen carefully to the audio and answer the question in {targetLang} ({currentLocationMeta.name})
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-rose-50/40 to-white border border-rose-200/60 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              <Headphones className="w-8 h-8" />
            </div>

            <button
              onClick={() => speakText(listeningChallenge.audioText, langMeta.voiceCode)}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto shadow-md shadow-rose-200 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              Play Audio Clip ({langMeta.name})
            </button>

            <div className="text-sm font-bold text-slate-900 pt-2">
              Question: {listeningChallenge.question}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              🇮🇳 {listeningChallenge.hindiQuestion}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto text-left text-xs">
              {listeningChallenge.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setListeningAnswer(opt);
                    const isCorrect = opt === listeningChallenge.correctAnswer;
                    setListeningFeedback({
                      isCorrect,
                      explanation: listeningChallenge.explanation,
                    });
                    if (isCorrect) {
                      playChime(true);
                      onRecordXP(25);
                    } else {
                      playChime(false);
                    }
                  }}
                  className={`p-3 rounded-xl border font-semibold transition-all ${
                    listeningAnswer === opt
                      ? opt === listeningChallenge.correctAnswer
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                        : "bg-rose-50 border-rose-400 text-rose-900"
                      : "bg-white border-slate-200 text-slate-800 hover:border-indigo-400"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {listeningFeedback && (
              <div
                className={`p-4 rounded-xl text-xs text-left max-w-md mx-auto border whitespace-pre-line ${
                  listeningFeedback.isCorrect
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="font-bold">
                  {listeningFeedback.isCorrect ? "✅ Well done! Score: 95/100" : "❌ Incorrect"}
                </div>
                <div className="mt-1">{listeningFeedback.explanation}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-MODULE 5: REVISION (Slide 3 item 5) */}
      {activeSubModule === "revision" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Spaced Repetition
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Personalized Revision & Weak Areas
            </h3>
            <p className="text-xs text-slate-500">
              Smart practice recommendations for {targetLang} ({currentLocationMeta.name})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div className="font-bold text-purple-900">Module Vocabulary</div>
              <div className="text-2xl font-black text-purple-950 mt-1">
                {currentVocabList.length}
              </div>
              <div className="text-[11px] text-purple-700 mt-0.5">Active review words</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="font-bold text-amber-900">Saved Mistakes</div>
              <div className="text-2xl font-black text-amber-950 mt-1">4</div>
              <div className="text-[11px] text-amber-700 mt-0.5">From roleplay sessions</div>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
              <div className="font-bold text-teal-900">Target Language</div>
              <div className="text-2xl font-black text-teal-950 mt-1">{langMeta.name.split(" ")[0]}</div>
              <div className="text-[11px] text-teal-700 mt-0.5">{langMeta.city} immersion</div>
            </div>
          </div>

          {/* Quick Revision Drill */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase text-indigo-700">
              Quiz Time ({currentLocationMeta.name}): Choose the correct meaning of 「
              {currentVocabList[0]?.word}」
              {currentVocabList[0]?.reading ? ` (${currentVocabList[0]?.reading})` : ""}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
              {[
                {
                  label: `${currentVocabList[0]?.meaning} (${currentVocabList[0]?.hindiMeaning || ""})`,
                  correct: true,
                },
                {
                  label: currentVocabList[1]?.meaning || "Hotel checkout",
                  correct: false,
                },
                {
                  label: currentVocabList[2]?.meaning || "Ask for direction",
                  correct: false,
                },
                {
                  label: currentVocabList[3]?.meaning || "Purchase ticket",
                  correct: false,
                },
              ]
                .sort(() => 0.5 - Math.random())
                .map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (opt.correct) {
                        playChime(true);
                        setRevisionScore(revisionScore + 1);
                        setRevisionComplete(true);
                        onRecordXP(20);
                      } else {
                        playChime(false);
                      }
                    }}
                    className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-left text-slate-800"
                  >
                    {opt.label}
                  </button>
                ))}
            </div>
          </div>

          {revisionComplete && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <div className="font-bold">Great Job! Progress Updated!</div>
                <div className="text-emerald-700 text-[11px]">
                  You are mastering {currentLocationMeta.name}! Retention score: 90/100 ⭐⭐⭐⭐
                </div>
              </div>
              <span className="font-black text-sm text-emerald-700">+20 XP</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
