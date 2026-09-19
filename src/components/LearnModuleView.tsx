import React, { useState } from "react";
import {
  Volume2,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  RotateCcw,
  Check,
  Star,
  Lock,
  Unlock,
  Smile,
} from "lucide-react";
import confetti from "canvas-confetti";
import { LessonData, VocabWord } from "../types";
import { speakText, playChime } from "../utils/audio";

interface Props {
  lesson: LessonData;
  onCompleteLesson: (xpReward: number) => void;
  onGoToDashboard: () => void;
}

export const LearnModuleView: React.FC<Props> = ({
  lesson,
  onCompleteLesson,
  onGoToDashboard,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeVocabIndex, setActiveVocabIndex] = useState<number>(0);

  // Practice state
  const [fillAnswer, setFillAnswer] = useState<string | null>(null);
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<string | null>(null);
  const [matchesFound, setMatchesFound] = useState<string[]>([]);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  const stepsList = [
    { num: 1, name: "Scene Intro" },
    { num: 2, name: "Dialogue" },
    { num: 3, name: "Vocabulary" },
    { num: 4, name: "Grammar" },
    { num: 5, name: "Examples" },
    { num: 6, name: "Activities" },
    { num: 7, name: "Mini Quiz" },
    { num: 8, name: "Summary" },
    { num: 9, name: "+XP Reward" },
    { num: 10, name: "Unlocked!" },
  ];

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"],
      });
    } catch {
      // safe fallback
    }
  };

  const handleNextStep = () => {
    if (currentStep === 8) {
      triggerCelebration();
      playChime(true);
      onCompleteLesson(lesson.summary.xpReward);
    }
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleMatchClick = (side: "left" | "right", value: string) => {
    if (side === "left") {
      setMatchSelectedLeft(value);
    } else if (matchSelectedLeft) {
      // check if match is correct
      const pair = lesson.practiceActivities.matchPairs.find(
        (p) => p.left === matchSelectedLeft && p.right === value
      );
      if (pair) {
        setMatchesFound([...matchesFound, matchSelectedLeft]);
        playChime(true);
      } else {
        playChime(false);
      }
      setMatchSelectedLeft(null);
    }
  };

  const handleQuizAnswer = (option: string) => {
    if (quizAnswered) return;
    setSelectedQuizOption(option);
    setQuizAnswered(true);

    const isCorrect = option === lesson.miniQuiz[quizIndex].correctAnswer;
    if (isCorrect) {
      setQuizScore(quizScore + 1);
      playChime(true);
    } else {
      playChime(false);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex < lesson.miniQuiz.length - 1) {
      setQuizIndex(quizIndex + 1);
      setSelectedQuizOption(null);
      setQuizAnswered(false);
    } else {
      handleNextStep();
    }
  };

  const currentWord = lesson.vocabulary[activeVocabIndex] || lesson.vocabulary[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 10-Step Breadcrumb Bar (Slide 2 Screen 8) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="font-bold text-slate-800">
            Step {currentStep} of 10:{" "}
            <span className="text-indigo-600 font-semibold">{stepsList[currentStep - 1].name}</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">{lesson.location}</span>
        </div>

        {/* Stepper Dots / Bars */}
        <div className="grid grid-cols-10 gap-1.5">
          {stepsList.map((st) => {
            const isPassed = st.num < currentStep;
            const isCurrent = st.num === currentStep;
            return (
              <div
                key={st.num}
                onClick={() => {
                  if (st.num <= currentStep) setCurrentStep(st.num);
                }}
                className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                  isPassed
                    ? "bg-emerald-500"
                    : isCurrent
                    ? "bg-indigo-600 ring-2 ring-indigo-400/40"
                    : "bg-slate-200"
                }`}
                title={`Step ${st.num}: ${st.name}`}
              />
            );
          })}
        </div>
      </div>

      {/* STEP 1: Lesson Introduction (Real-Life Scene) */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 text-center">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-purple-900 text-white p-8">
            <div className="text-5xl mb-3">⛩️</div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {lesson.sceneIntro.title}
            </h2>
            <p className="text-indigo-200 font-semibold text-sm mt-1">
              {lesson.sceneIntro.subtitle}
            </p>
            <p className="text-xs text-indigo-100/90 max-w-md mx-auto mt-3 leading-relaxed">
              {lesson.sceneIntro.description}
            </p>
          </div>

          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              What you will accomplish in this mission:
            </h4>
            <div className="space-y-2">
              {lesson.sceneIntro.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 font-medium"
                >
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  {h}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
          >
            Start Lesson Flow
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Conversation / Dialogue */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hotel Check-in Dialogue</h3>
              <p className="text-xs text-slate-500">
                Tap the speaker button to hear native Japanese pronunciation
              </p>
            </div>
            <button
              onClick={() => {
                const allJapanese = lesson.dialogue.map((d) => d.japanese).join(" ");
                speakText(allJapanese);
              }}
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen to All
            </button>
          </div>

          <div className="space-y-3.5">
            {lesson.dialogue.map((line) => {
              const isUser = line.role === "user";
              return (
                <div
                  key={line.id}
                  className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {line.avatar}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl space-y-1.5 text-xs ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-xs"
                        : "bg-slate-100 text-slate-900 rounded-tl-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-[10px] font-bold ${
                          isUser ? "text-indigo-200" : "text-slate-500"
                        }`}
                      >
                        {line.speaker}
                      </span>
                      <button
                        onClick={() => speakText(line.japanese)}
                        className={`p-1 rounded-full transition-colors ${
                          isUser
                            ? "hover:bg-indigo-500 text-white"
                            : "hover:bg-slate-200 text-slate-600"
                        }`}
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-sm font-bold tracking-wide">{line.japanese}</div>
                    <div
                      className={`text-[11px] font-mono ${
                        isUser ? "text-indigo-200" : "text-slate-500"
                      }`}
                    >
                      {line.romaji}
                    </div>
                    <div
                      className={`pt-1 border-t text-[11px] ${
                        isUser ? "border-indigo-500/40 text-indigo-100" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {line.english}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
          >
            Continue to Vocabulary (3/10)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: Vocabulary Drill */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Key Vocabulary</h3>
              <p className="text-xs text-slate-500">
                Word {activeVocabIndex + 1} of {lesson.vocabulary.length}
              </p>
            </div>
            {/* Quick Word switcher */}
            <div className="flex gap-1.5">
              {lesson.vocabulary.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveVocabIndex(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    activeVocabIndex === i
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Word Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 text-center space-y-4">
            <div className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-bold">
              {currentWord.partOfSpeech}
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">
                {currentWord.word}
              </span>
              <button
                onClick={() => speakText(currentWord.word)}
                className="w-10 h-10 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center justify-center transition-colors"
                title="Play Audio"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm font-mono font-medium text-slate-500">{currentWord.reading}</div>
            <div className="text-xl font-bold text-indigo-900">{currentWord.meaning}</div>

            {/* Example sentence */}
            <div className="mt-4 p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Example in Context</span>
                <button
                  onClick={() => speakText(currentWord.exampleSentence)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Listen
                </button>
              </div>
              <div className="text-sm font-bold text-slate-800">{currentWord.exampleSentence}</div>
              <div className="text-xs text-slate-500 font-mono">{currentWord.exampleReading}</div>
              <div className="text-xs text-slate-600 italic">{currentWord.exampleMeaning}</div>
            </div>

            {currentWord.tip && (
              <div className="text-left text-xs text-indigo-900 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                <strong>Traveler Tip:</strong> {currentWord.tip}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveVocabIndex(Math.max(0, activeVocabIndex - 1))}
              disabled={activeVocabIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40"
            >
              Previous Word
            </button>
            {activeVocabIndex < lesson.vocabulary.length - 1 ? (
              <button
                onClick={() => setActiveVocabIndex(activeVocabIndex + 1)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                Next Word
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                Continue to Grammar (4/10)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Grammar in Context */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Grammar Point
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-2">{lesson.grammar.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {lesson.grammar.explanation}
            </p>
          </div>

          {/* Formula / Structure */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center">
            <div className="text-[10px] font-bold uppercase text-indigo-600">Grammar Formula</div>
            <div className="text-base font-black text-indigo-950 mt-1 font-mono">
              {lesson.grammar.pattern}
            </div>
            <div className="text-xs text-indigo-700 mt-1">{lesson.grammar.structure}</div>
          </div>

          {/* Examples */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Real Situations in Hotel:
            </h4>
            {lesson.grammar.examples.map((ex, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{ex.japanese}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{ex.romaji}</div>
                  <div className="text-xs text-indigo-700 mt-0.5">{ex.english}</div>
                </div>
                <button
                  onClick={() => speakText(ex.japanese)}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-indigo-600 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
          >
            Continue to Example Sentences (5/10)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 5: Example Sentences Practice */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Example Sentences in Action</h3>
            <p className="text-xs text-slate-500">
              Listen and repeat each phrase aloud to build spontaneous muscle memory.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                jp: "部屋を予約したいです。",
                ro: "Heya wo yoyaku shitai desu.",
                en: "I would like to book a room.",
                badge: "Reservation",
              },
              {
                jp: "荷物を預けたいです。",
                ro: "Nimotsu wo azuketai desu.",
                en: "I would like to leave my luggage here.",
                badge: "Luggage",
              },
              {
                jp: "チェックアウトは何時ですか？",
                ro: "Chekkuauto wa nanji desu ka?",
                en: "What time is check-out?",
                badge: "Departure",
              },
            ].map((sent, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase bg-white border border-slate-200 px-2 py-0.5 rounded text-indigo-600">
                    {sent.badge}
                  </span>
                  <div className="text-sm font-bold text-slate-900 pt-1">{sent.jp}</div>
                  <div className="text-xs font-mono text-slate-500">{sent.ro}</div>
                  <div className="text-xs text-slate-700 font-medium">{sent.en}</div>
                </div>
                <button
                  onClick={() => speakText(sent.jp)}
                  className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
          >
            Start Practice Activities (6/10)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 6: Practice Activities (Fill in the blanks, Match, Drag) */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Practice Activities (MVP Types)</h3>
            <p className="text-xs text-slate-500">
              Interactive matching & fill-in drills from Slide 2
            </p>
          </div>

          {/* Activity 1: Fill in the blanks */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase text-indigo-700">
              Activity 1: Fill in the Blank
            </div>
            <div className="text-sm font-bold text-slate-900">
              {lesson.practiceActivities.fillInTheBlank.sentence}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {lesson.practiceActivities.fillInTheBlank.options.map((opt) => {
                const isSelected = fillAnswer === opt;
                const isCorrect = opt === lesson.practiceActivities.fillInTheBlank.missingWord;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      setFillAnswer(opt);
                      if (isCorrect) playChime(true);
                      else playChime(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? isCorrect
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-rose-50 border-rose-400 text-rose-800"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity 2: Match Pairs */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase text-indigo-700">
              Activity 2: Match the Pairs
            </div>
            <p className="text-xs text-slate-500">
              Select a Japanese word on the left, then click its English translation on the right.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Left column */}
              <div className="space-y-2">
                {lesson.practiceActivities.matchPairs.map((p) => {
                  const isDone = matchesFound.includes(p.left);
                  const isSelected = matchSelectedLeft === p.left;
                  return (
                    <button
                      key={p.left}
                      disabled={isDone}
                      onClick={() => handleMatchClick("left", p.left)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                        isDone
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 opacity-60"
                          : isSelected
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white border-slate-200 text-slate-800 hover:border-indigo-300"
                      }`}
                    >
                      {p.left}
                      {isDone && <Check className="w-3.5 h-3.5 inline ml-1.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Right column */}
              <div className="space-y-2">
                {lesson.practiceActivities.matchPairs
                  .slice()
                  .reverse()
                  .map((p) => {
                    const isDone = matchesFound.includes(p.left);
                    return (
                      <button
                        key={p.right}
                        disabled={isDone}
                        onClick={() => handleMatchClick("right", p.right)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          isDone
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700 opacity-60"
                            : "bg-white border-slate-200 text-slate-800 hover:border-indigo-400"
                        }`}
                      >
                        {p.right}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
          >
            Continue to Mini Quiz (7/10)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 7: Mini Quiz */}
      {currentStep === 7 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Question {quizIndex + 1} of {lesson.miniQuiz.length}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {lesson.miniQuiz[quizIndex].prompt}
              </h3>
            </div>
            <div className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              Score: {quizScore}
            </div>
          </div>

          {lesson.miniQuiz[quizIndex].japanesePrompt && (
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center flex items-center justify-center gap-3">
              <span className="text-xl sm:text-2xl font-black text-indigo-950">
                {lesson.miniQuiz[quizIndex].japanesePrompt}
              </span>
              <button
                onClick={() => speakText(lesson.miniQuiz[quizIndex].japanesePrompt || "")}
                className="p-1.5 rounded-full bg-white shadow-xs text-indigo-600 hover:bg-indigo-100"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2.5">
            {lesson.miniQuiz[quizIndex].options.map((opt) => {
              const isSelected = selectedQuizOption === opt;
              const isCorrect = opt === lesson.miniQuiz[quizIndex].correctAnswer;
              return (
                <button
                  key={opt}
                  disabled={quizAnswered}
                  onClick={() => handleQuizAnswer(opt)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${
                    quizAnswered
                      ? isCorrect
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold"
                        : isSelected
                        ? "bg-rose-50 border-rose-400 text-rose-900"
                        : "bg-slate-50 border-slate-200 text-slate-500"
                      : "bg-white border-slate-200 hover:border-indigo-400 text-slate-800"
                  }`}
                >
                  <span>{opt}</span>
                  {quizAnswered && isCorrect && (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  )}
                  {quizAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">Explanation:</div>
              <div>{lesson.miniQuiz[quizIndex].explanation}</div>
            </div>
          )}

          {quizAnswered && (
            <button
              onClick={handleNextQuizQuestion}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
            >
              {quizIndex < lesson.miniQuiz.length - 1 ? "Next Question" : "See Lesson Summary (8/10)"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* STEP 8: Lesson Summary */}
      {currentStep === 8 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-4xl mx-auto shadow-lg shadow-indigo-100">
            🌟
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Great Job!</h2>
            <p className="text-xs text-slate-500 mt-1">
              You completed <span className="font-bold text-indigo-600">{lesson.title}</span>
            </p>
          </div>

          {/* 4 Summary Stats */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Vocabulary</div>
              <div className="text-base font-black text-slate-900">
                +{lesson.summary.newWordsCount} Words
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Grammar Point</div>
              <div className="text-base font-black text-slate-900">
                {lesson.summary.grammarPointsCount} Mastered
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Activities</div>
              <div className="text-base font-black text-slate-900">
                {lesson.summary.activitiesCompleted} Completed
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500">Quiz Score</div>
              <div className="text-base font-black text-emerald-600">
                {quizScore}/{lesson.miniQuiz.length} Correct
              </div>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
          >
            Awesome! Claim XP Reward (9/10)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 9: Progress Updated (+40 XP) */}
      {currentStep === 9 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex flex-col items-center justify-center mx-auto shadow-xl shadow-amber-200/60 animate-bounce">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Reward</span>
              <span className="text-3xl font-black">+{lesson.summary.xpReward}</span>
              <span className="text-[10px] font-bold text-amber-100">XP</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">Your Progress Has Been Updated!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Consistent practice is the key to real-world fluency.
            </p>
          </div>

          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-left">
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Total XP Earned:</span>
              <span className="font-bold text-indigo-700">1,290 XP</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Day Streak:</span>
              <span className="font-bold text-amber-600">7 Days 🔥</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-600">Overall Progress:</span>
              <span className="font-bold text-emerald-600">72% (+4%)</span>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 text-sm transition-all"
          >
            Check Destination Unlocks (10/10)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 10: Next Lesson / Location Unlocked */}
      {currentStep === 10 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-100">
            <Unlock className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Milestone Accomplished
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Congratulations!</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You unlocked the next real-world mission stage:{" "}
              <strong>Shibuya Ramen & Dining</strong>!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-2xl flex items-center justify-center">
              🍜
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Location 3: Restaurant</div>
              <div className="text-[11px] text-slate-500">
                Order ramen, specify toppings, and ask for the bill.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onGoToDashboard}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition-colors"
            >
              Return to Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setActiveVocabIndex(0);
                setFillAnswer(null);
                setQuizAnswered(false);
                setQuizIndex(0);
              }}
              className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md text-xs transition-all flex items-center justify-center gap-1.5"
            >
              Practice Lesson Again
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
