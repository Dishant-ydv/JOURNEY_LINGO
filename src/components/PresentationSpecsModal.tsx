import React, { useState } from "react";
import {
  X,
  FileText,
  Map,
  Layers,
  Cpu,
  Award,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Users,
  ExternalLink,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationSpecsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "gap" | "pert" | "competitors" | "usp" | "architecture"
  >("overview");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-indigo-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              ✈️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">JourneyLingo</h2>
                <span className="text-xs bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-400/30">
                  SRMS Presentation Project
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Foreign Language Learning App • Project Guide: Ms. Akanksha Saxena
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
          {[
            { id: "overview", label: "Project Overview", icon: FileText },
            { id: "gap", label: "Fluency Gap & Thesis", icon: Layers },
            { id: "usp", label: "Our USP (Unlock System)", icon: Award },
            { id: "competitors", label: "Competitor Analysis", icon: Users },
            { id: "pert", label: "PERT Chart Timeline", icon: GitBranch },
            { id: "architecture", label: "System Architecture", icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                <h3 className="text-base font-bold text-indigo-950 mb-2">
                  The Core Organizing Idea
                </h3>
                <blockquote className="italic text-indigo-900 text-base font-medium border-l-4 border-indigo-500 pl-4 py-1">
                  “People learn language best when they are trying to accomplish something
                  inside a place, not when they are matching flashcards in a void.”
                </blockquote>
                <p className="text-xs text-indigo-700 mt-3">
                  JourneyLingo is built as a single simulated trip exploring a country. Once a
                  learner selects a destination, the app presents a structured learning journey
                  based on real-life travel situations: <strong>Airport ➔ Hotel ➔ Restaurant ➔ Metro ➔ Shopping ➔ Attractions</strong>.
                </p>
              </div>

              {/* Team Members */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  SRMS Project Team
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { name: "Dishant", id: "2400140130014" },
                    { name: "Nishta Gupta", id: "2300140130036" },
                    { name: "Artika Gangwar", id: "2300140130014" },
                    { name: "Anushree Gupta", id: "2400140130010" },
                    { name: "Virat Kumar", id: "2300140130060" },
                    { name: "Vinay Yadav", id: "2300140130059" },
                    { name: "Shashan Singh", id: "2400140130040" },
                    { name: "Jitin Kumar", id: "2400140130025" },
                  ].map((member) => (
                    <div
                      key={member.name}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70"
                    >
                      <div className="font-semibold text-slate-900">{member.name}</div>
                      <div className="text-[11px] text-slate-500">{member.id}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 8 Core Modules */}
              <div>
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  8 Core Application Modules
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { title: "1. Authentication", desc: "Secure signup, login, session tokens, and preferences." },
                    { title: "2. Language Setup", desc: "Native & target language pair, motivation, proficiency level." },
                    { title: "3. Learn Module", desc: "10-step structured flow: Scene ➔ Dialogue ➔ Vocab ➔ Grammar ➔ Quiz." },
                    { title: "4. Practice Module", desc: "AI Conversation, Real-Life Roleplay, Pronunciation, Listening, Revision." },
                    { title: "5. Journey Module", desc: "Sequential Location Unlock System: Airport ➔ Hotel ➔ Restaurant ➔ Metro." },
                    { title: "6. Progress & Analytics", desc: "Real-time analytics, skill-radar, daily XP, streak, Recharts graphs." },
                    { title: "7. Achievement Module", desc: "Milestone badges, streak multipliers, competency rewards." },
                    { title: "8. Profile & Goals", desc: "Manage profile, study goals, audio settings, and saved mistakes." },
                  ].map((mod) => (
                    <div key={mod.title} className="p-3 rounded-lg border border-slate-200 bg-white">
                      <div className="font-bold text-indigo-900">{mod.title}</div>
                      <div className="text-slate-600 mt-0.5">{mod.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "gap" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                The Fluency Gap: Why Traditional Language Apps Fail
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
                  <div className="font-bold text-rose-900 mb-1">1. Pedagogical Limitations</div>
                  <ul className="text-xs text-rose-800 space-y-1.5 list-disc pl-4">
                    <li><strong>Isolated Concept Overload:</strong> Grammar and vocab taught detached from real use.</li>
                    <li><strong>The Flashcard-First Trap:</strong> Matching exercises don't build spontaneous conversational ability.</li>
                    <li><strong>Translation-Centric:</strong> Hinders learners from thinking directly in the target language.</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                  <div className="font-bold text-amber-900 mb-1">2. Engagement Flaws</div>
                  <ul className="text-xs text-amber-800 space-y-1.5 list-disc pl-4">
                    <li><strong>Competence vs. Gamification:</strong> Rewarding streak maintenance over communicative competence.</li>
                    <li><strong>Lack of Narrative:</strong> Disconnected modular units fail to provide an emotional journey.</li>
                    <li><strong>Infinite Loop:</strong> Endless randomized lessons with no clear physical destination.</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="font-bold text-emerald-900 mb-1">3. The JourneyLingo Fix</div>
                  <ul className="text-xs text-emerald-800 space-y-1.5 list-disc pl-4">
                    <li><strong>Physical Travel Scenario:</strong> You arrive at Tokyo airport, check into your hotel, order ramen.</li>
                    <li><strong>Sequential Unlock:</strong> Master the location before advancing to the next destination.</li>
                    <li><strong>AI Conversational Feedback:</strong> Real-time speaking practice with Gemini AI.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "usp" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Our Unique Selling Proposition (USP)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
                    <Map className="w-5 h-5 text-indigo-600" />
                    1. Sequential Location Unlock System
                  </div>
                  <p className="text-xs text-slate-600">
                    Learners cannot randomly skip to advanced shopping without passing the airport customs and hotel check-in. This preserves narrative continuity and emotional connection to the journey.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
                    <Award className="w-5 h-5 text-indigo-600" />
                    2. 10-Step Structured Mission Flow
                  </div>
                  <p className="text-xs text-slate-600">
                    Vocabulary ➔ Grammar in Context ➔ Dialogue ➔ Listening ➔ Pronunciation ➔ Mini Quiz ➔ AI Roleplay. Ensures multi-sensory language acquisition.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
                    <Cpu className="w-5 h-5 text-indigo-600" />
                    3. AI-Powered Roleplay & Live Feedback
                  </div>
                  <p className="text-xs text-slate-600">
                    Interact with realistic AI characters (Receptionist, Ramen Chef, Station Attendant) with instant speech evaluation and mistake saving.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-indigo-900 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    4. Competence-Based Real-Time Analytics
                  </div>
                  <p className="text-xs text-slate-600">
                    Live session tracking, skill breakdowns (Speaking, Listening, Vocab, Grammar, Reading), accuracy trends, and milestone badges.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "competitors" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Slide 14: Competitor Analysis Matrix
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Dimension</th>
                      <th className="p-3">Duolingo</th>
                      <th className="p-3">Babbel</th>
                      <th className="p-3">Memrise</th>
                      <th className="p-3 bg-indigo-50 text-indigo-900 font-bold">
                        JourneyLingo (Our App)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Core Metaphor</td>
                      <td className="p-3 text-slate-600">Skill tree / game levels</td>
                      <td className="p-3 text-slate-600">Structured course units</td>
                      <td className="p-3 text-slate-600">Flashcard decks + videos</td>
                      <td className="p-3 bg-indigo-50/50 text-indigo-900 font-semibold">
                        Real-world journey (Location unlock)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Narrative & Place</td>
                      <td className="p-3 text-slate-600">None (abstract tree)</td>
                      <td className="p-3 text-slate-600">None (unit numbers)</td>
                      <td className="p-3 text-slate-600">None (deck titles)</td>
                      <td className="p-3 bg-indigo-50/50 text-indigo-900 font-semibold">
                        Strong story: You land in Tokyo!
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Conversation</td>
                      <td className="p-3 text-slate-600">Very limited</td>
                      <td className="p-3 text-slate-600">Drills only</td>
                      <td className="p-3 text-slate-600">None</td>
                      <td className="p-3 bg-indigo-50/50 text-indigo-900 font-semibold">
                        Authentic AI Roleplay with Gemini
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">Progression Gating</td>
                      <td className="p-3 text-slate-600">Loose (can test out)</td>
                      <td className="p-3 text-slate-600">Linear in course</td>
                      <td className="p-3 text-slate-600">Loose decks</td>
                      <td className="p-3 bg-indigo-50/50 text-indigo-900 font-semibold">
                        Strict Sequential Unlock (USP)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "pert" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Project PERT Chart (July 28 - Sept 25, 2026)
                </h3>
                <span className="text-xs text-slate-500 font-medium">Duration: 2 Months MVP</span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    phase: "1. Project Planning & Requirements",
                    dates: "28 Jul 2026 – 30 Jul 2026",
                    duration: "3 Days",
                    status: "Completed",
                  },
                  {
                    phase: "2. Research & Literature Review",
                    dates: "31 Jul 2026 – 03 Aug 2026",
                    duration: "4 Days",
                    status: "Completed",
                  },
                  {
                    phase: "3. UI/UX Design (Wireframes & 10 PPT Screens)",
                    dates: "04 Aug 2026 – 10 Aug 2026",
                    duration: "7 Days",
                    status: "Completed",
                  },
                  {
                    phase: "4. Architecture & Database Design",
                    dates: "11 Aug 2026 – 15 Aug 2026",
                    duration: "5 Days",
                    status: "Completed",
                  },
                  {
                    phase: "5. Frontend & Backend Development",
                    dates: "16 Aug 2026 – 04 Sept 2026",
                    duration: "20 Days",
                    status: "Completed",
                  },
                  {
                    phase: "6. AI Integration (Gemini Conversation & Roleplay)",
                    dates: "05 Sept 2026 – 11 Sept 2026",
                    duration: "7 Days",
                    status: "Completed",
                  },
                  {
                    phase: "7. Testing, Bug Fixing & Real-time Analytics",
                    dates: "12 Sept 2026 – 19 Sept 2026",
                    duration: "8 Days",
                    status: "Completed",
                  },
                  {
                    phase: "8. Final Review, Deployment & Documentation",
                    dates: "20 Sept 2026 – 25 Sept 2026",
                    duration: "6 Days",
                    status: "Completed",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{item.phase}</div>
                        <div className="text-[11px] text-slate-500">{item.dates}</div>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center gap-2 text-xs">
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {item.duration}
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-medium px-2 py-0.5 rounded">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                System Architecture (Slide 12 & 13)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-indigo-900 mb-2">Frontend Application</div>
                  <p className="text-slate-600 mb-2">
                    Mobile-first design (iOS/Android & Web) with React, TypeScript, and Tailwind CSS.
                  </p>
                  <ul className="list-disc pl-4 text-slate-700 space-y-1">
                    <li>Interactive 10-step learning module</li>
                    <li>Audio speech synthesis & mic recognition</li>
                    <li>Recharts data visualization engine</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-indigo-900 mb-2">Backend & AI Evaluation</div>
                  <p className="text-slate-600 mb-2">
                    Node.js + Express REST API integrated with Google Gemini API for intelligent assessment.
                  </p>
                  <ul className="list-disc pl-4 text-slate-700 space-y-1">
                    <li>Dynamic AI Roleplay in native languages</li>
                    <li>Grammar & pronunciation feedback</li>
                    <li>Real-time session analytics synchronization</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>JourneyLingo • SRMS Internship Project • September 2026</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
};
