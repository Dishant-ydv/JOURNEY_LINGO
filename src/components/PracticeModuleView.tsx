import React, { useState } from "react";
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
} from "lucide-react";
import { UserProfile, RoleplayScenario, VocabWord } from "../types";
import { roleplayScenarios, sampleVocabularyList } from "../data/mockData";
import {
  sendAIConversation,
  sendAIRoleplay,
  evaluatePronunciation,
} from "../services/aiService";
import { speakText, playChime } from "../utils/audio";

interface Props {
  user: UserProfile;
  onRecordXP: (amount: number) => void;
}

type SubModuleType =
  | "overview"
  | "ai_conversation"
  | "roleplay"
  | "pronunciation"
  | "listening"
  | "revision";

export const PracticeModuleView: React.FC<Props> = ({ user, onRecordXP }) => {
  const [activeSubModule, setActiveSubModule] = useState<SubModuleType>("overview");

  // --- Sub-Module 1: AI Conversation State ---
  const [convTopic, setConvTopic] = useState("Travel Plans to Tokyo");
  const [convHistory, setConvHistory] = useState<
    { sender: "ai" | "user"; text: string; translation?: string; romaji?: string }[]
  >([
    {
      sender: "ai",
      text: "こんにちは！今年どこへ旅行に行きたいですか？",
      romaji: "Konnichiwa! Kotoshi doko e ryokou ni ikitai desu ka?",
      translation: "Hello! Where would you like to travel this year?",
    },
  ]);
  const [convInput, setConvInput] = useState("");
  const [convLoading, setConvLoading] = useState(false);
  const [convFeedback, setConvFeedback] = useState<any>(null);
  const [convMistakes, setConvMistakes] = useState<any[]>([
    { original: "日本に行きます夏", correction: "夏の日本に行きます", explanation: "Place time particle に before destination." },
  ]);

  // --- Sub-Module 2: Real-Life Roleplay State ---
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(roleplayScenarios[0]);
  const [roleplayHistory, setRoleplayHistory] = useState<
    { sender: "ai" | "user"; text: string; translation?: string; romaji?: string }[]
  >([
    {
      sender: "ai",
      text: roleplayScenarios[0].initialMessage,
      romaji: roleplayScenarios[0].initialRomaji,
      translation: roleplayScenarios[0].initialTranslation,
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

  // Pronunciation evaluate handler
  const handleTestPronunciation = async () => {
    const target = sampleVocabularyList[pronounceIndex].word;
    setIsRecording(true);

    // Simulate microphone audio recording or use speech recognition
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
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Practice Module
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Practice more. Improve better.
            </h2>
            <p className="text-xs text-slate-500">
              Interactive AI roleplays, pronunciation evaluation, listening & revision
            </p>
          </div>

          {/* Sub-module switch tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: "overview", label: "Dashboard", icon: Sparkles },
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

        {/* Practice Overview Strip (Screen 9 top) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: "ai_conversation",
              title: "1. AI Conversation",
              desc: "Chat naturally with the AI tutor on generated travel topics. Automatic grammar feedback & mistake logging.",
              badge: "Voice & Text",
              icon: MessageSquare,
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              id: "roleplay",
              title: "2. Real-Life Roleplay",
              desc: "Simulate authentic situations: Hotel Receptionist, Ramen Chef, Narita Airport Officer. Get Fluency & Vocabulary scores.",
              badge: "Scenario Based",
              icon: Users,
              color: "bg-teal-50 text-teal-600",
            },
            {
              id: "pronunciation",
              title: "3. Pronunciation Practice",
              desc: "Listen to native audio, record your own voice, and receive speech accuracy percentage and intonation guidance.",
              badge: "Audio Analysis",
              icon: Mic,
              color: "bg-amber-50 text-amber-600",
            },
            {
              id: "listening",
              title: "4. Listening Practice",
              desc: "Hear real audio snippets in Japanese, deduce what the speaker is asking, and write the meaning in English.",
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
              {roleplayScenarios.map((sc) => (
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
              onClick={() => handleSendRoleplay("ありがとうございました！(Conclude roleplay)", true)}
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
              Word {pronounceIndex + 1} of {sampleVocabularyList.length}
            </p>
          </div>

          {/* Word to speak */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-200/70 space-y-3">
            <div className="text-4xl font-black text-slate-900">
              {sampleVocabularyList[pronounceIndex].word}
            </div>
            <div className="text-sm font-mono text-slate-500">
              {sampleVocabularyList[pronounceIndex].reading}
            </div>
            <div className="text-base font-bold text-amber-900">
              {sampleVocabularyList[pronounceIndex].meaning}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => speakText(sampleVocabularyList[pronounceIndex].word)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
                Listen Native Audio
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
                setPronounceIndex((pronounceIndex + 1) % sampleVocabularyList.length);
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
              Listen carefully to the audio and answer the question
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-rose-50/40 to-white border border-rose-200/60 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              <Headphones className="w-8 h-8" />
            </div>

            <button
              onClick={() => speakText("どこに行きますか？")}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 mx-auto shadow-md shadow-rose-200 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              Play Audio Clip
            </button>

            <div className="text-sm font-bold text-slate-900 pt-2">
              Question: What is the person asking in the audio?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto text-left text-xs">
              {[
                "Where are you going?",
                "What time is the train?",
                "How much is the ticket?",
                "Where is the hotel?",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setListeningAnswer(opt);
                    const isCorrect = opt === "Where are you going?";
                    setListeningFeedback({
                      isCorrect,
                      explanation:
                        "「どこに行きますか？」 (Doko ni ikimasu ka?) combines どこ (where) + に (direction particle) + 行きますか (are you going?).",
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
                      ? opt === "Where are you going?"
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
                className={`p-4 rounded-xl text-xs text-left max-w-md mx-auto border ${
                  listeningFeedback.isCorrect
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-900"
                }`}
              >
                <div className="font-bold">
                  {listeningFeedback.isCorrect ? "✅ Well done! Score: 90/100" : "❌ Incorrect"}
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
              Smart recommendations based on previous mistakes and quizzing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div className="font-bold text-purple-900">Difficult Words</div>
              <div className="text-2xl font-black text-purple-950 mt-1">12</div>
              <div className="text-[11px] text-purple-700 mt-0.5">Recommended review</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <div className="font-bold text-amber-900">Saved Mistakes</div>
              <div className="text-2xl font-black text-amber-950 mt-1">8</div>
              <div className="text-[11px] text-amber-700 mt-0.5">From roleplay sessions</div>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
              <div className="font-bold text-teal-900">Weak Topics</div>
              <div className="text-2xl font-black text-teal-950 mt-1">1</div>
              <div className="text-[11px] text-teal-700 mt-0.5">Particles: に vs で</div>
            </div>
          </div>

          {/* Quick Revision Drill */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase text-indigo-700">
              Quiz Time: Choose the correct meaning of 「予約する」
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
              {[
                { label: "To make a reservation / book", correct: true },
                { label: "To check out of the room", correct: false },
                { label: "To ask for Wi-Fi", correct: false },
                { label: "To order ramen", correct: false },
              ].map((opt, i) => (
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
                  You are almost there! Retention score: 80/100 ⭐⭐⭐⭐
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
