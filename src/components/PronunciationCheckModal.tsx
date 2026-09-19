import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Award,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import {
  compareSpokenInput,
  PronunciationComparisonResult,
  isWebSpeechSupported,
  createSpeechRecognition,
} from "../utils/pronunciation";
import { speakText, playChime } from "../utils/audio";
import { evaluatePronunciation, AIPronunciationResponse } from "../services/aiService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetSentence: string;
  targetReading?: string;
  englishTranslation?: string;
  hindiTranslation?: string;
  targetLanguage: string;
  voiceCode: string;
  onRecordXP?: (amount: number) => void;
}

export const PronunciationCheckModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetSentence,
  targetReading,
  englishTranslation,
  hindiTranslation,
  targetLanguage,
  voiceCode,
  onRecordXP,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [comparison, setComparison] = useState<PronunciationComparisonResult | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIPronunciationResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<boolean>(false);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const supported = isWebSpeechSupported();

  // Reset states when target sentence or modal changes
  useEffect(() => {
    if (isOpen) {
      setLiveTranscript("");
      setFinalTranscript("");
      setComparison(null);
      setAiFeedback(null);
      setSpeechError(null);
      setXpAwarded(false);
      setManualInput("");
      setFallbackMode(!supported);
    } else {
      stopRecording();
    }
  }, [isOpen, targetSentence]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    await speakText(targetSentence, voiceCode);
    setIsPlayingAudio(false);
  };

  const startRecording = () => {
    setSpeechError(null);
    setLiveTranscript("");
    setFinalTranscript("");
    setComparison(null);
    setAiFeedback(null);

    const recognition = createSpeechRecognition();
    if (!recognition) {
      setFallbackMode(true);
      setSpeechError(
        "Web Speech API SpeechRecognition is not available in this browser. You can test speech via the quick simulator below."
      );
      return;
    }

    try {
      recognition.lang = voiceCode;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const currentText = final || interim;
        setLiveTranscript(currentText);

        if (final) {
          setFinalTranscript(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setSpeechError("Microphone permission was denied. Please allow microphone access in your browser bar.");
        } else if (event.error === "no-speech") {
          setSpeechError("No speech detected. Please speak louder and closer to your microphone.");
        } else {
          setSpeechError(`Speech recognition note: ${event.error}. You can also use the manual simulator below.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        // If we captured transcript, run comparison
        setLiveTranscript((latest) => {
          if (latest.trim().length > 0) {
            evaluateSpokenText(latest.trim());
          }
          return latest;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      setSpeechError("Could not start microphone listener. Switching to simulated voice evaluation.");
      setFallbackMode(true);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const evaluateSpokenText = async (spoken: string) => {
    if (!spoken.trim()) return;
    setIsEvaluating(true);

    // Client-side comparison
    const result = compareSpokenInput(targetSentence, spoken, targetLanguage);
    setComparison(result);

    // Play chime & award XP
    if (result.passed) {
      playChime(true);
      if (!xpAwarded && onRecordXP) {
        onRecordXP(15);
        setXpAwarded(true);
      }
    } else {
      playChime(false);
    }

    // Call AI service for advanced phonetics & intonation
    try {
      const aiRes = await evaluatePronunciation(targetSentence, spoken);
      setAiFeedback(aiRes);
    } catch (err) {
      console.warn("AI evaluation fallback used:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Simulated speech test for environments without Web Speech API
  const handleSimulatedPronounce = (sampleType: "flawless" | "slight" | "poor") => {
    let sample = targetSentence;
    if (sampleType === "slight") {
      // Modify 1 or 2 characters/words
      sample = targetSentence.length > 5 ? targetSentence.slice(0, -2) + "..." : targetSentence;
    } else if (sampleType === "poor") {
      sample = "something completely different";
    }
    setLiveTranscript(sample);
    setFinalTranscript(sample);
    evaluateSpokenText(sample);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-slate-900">Pronunciation Check</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Web Speech API
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Target: {targetLanguage} ({voiceCode})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Target Sentence Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/20 border border-slate-200/90 text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-white border border-indigo-100 px-2.5 py-0.5 rounded-full">
              Target Sentence to Speak
            </span>

            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wide pt-1">
              {targetSentence}
            </div>

            {targetReading && (
              <div className="text-xs font-mono text-slate-500 font-medium">
                {targetReading}
              </div>
            )}

            {englishTranslation && (
              <div className="text-xs font-semibold text-slate-700">
                "{englishTranslation}"
              </div>
            )}

            {hindiTranslation && (
              <div className="text-xs font-bold text-amber-800">
                🇮🇳 {hindiTranslation}
              </div>
            )}

            <div className="pt-2 flex justify-center">
              <button
                onClick={handlePlayAudio}
                disabled={isPlayingAudio}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all hover:bg-indigo-50/50"
              >
                <Volume2
                  className={`w-4 h-4 text-indigo-600 ${isPlayingAudio ? "animate-pulse" : ""}`}
                />
                <span>{isPlayingAudio ? "Playing native audio..." : "Listen Native Audio"}</span>
              </button>
            </div>
          </div>

          {/* Microphone Speaking Station */}
          <div className="text-center space-y-3 py-2">
            <div className="relative inline-block">
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isRecording
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 scale-105"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:scale-105"
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            <div>
              <div className="text-sm font-black text-slate-900">
                {isRecording ? "Listening to your voice..." : "Tap Microphone to Speak"}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRecording
                  ? `Speak the target sentence in ${targetLanguage} clearly now`
                  : `Tap the mic and pronounce: "${targetSentence}"`}
              </p>
            </div>

            {/* Live Spoken Input Box */}
            {(isRecording || liveTranscript) && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Web Speech Spoken Input:</span>
                  {isRecording && (
                    <span className="text-rose-600 animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                      Live Recording
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-800 italic min-h-[22px]">
                  {liveTranscript ? `"${liveTranscript}"` : "Waiting for voice..."}
                </div>
              </div>
            )}

            {speechError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Notice</div>
                  <div>{speechError}</div>
                </div>
              </div>
            )}
          </div>

          {/* Comparison Evaluation Results */}
          {comparison && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in duration-300">
              {/* Score Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-xs ${
                      comparison.score >= 85
                        ? "bg-emerald-600"
                        : comparison.score >= 65
                        ? "bg-indigo-600"
                        : "bg-amber-500"
                    }`}
                  >
                    {comparison.score}%
                  </div>
                  <div>
                    <div className={`text-sm font-black ${comparison.ratingColor}`}>
                      {comparison.ratingText}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      Spoken Accuracy: {comparison.accuracy}%
                    </div>
                  </div>
                </div>

                {comparison.passed && (
                  <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Passed (+15 XP)</span>
                  </div>
                )}
              </div>

              {/* Token by Token Match Breakdown */}
              <div className="space-y-1.5 text-left">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>Target Sentence vs. What We Heard:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Green = Clear • Amber = Incomplete
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap gap-1.5 items-center">
                  {comparison.tokens.map((tok, idx) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        tok.matched
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                      title={tok.matched ? "Matched correctly" : "Word was missing or mispronounced"}
                    >
                      {tok.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* What was heard */}
              <div className="text-left text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-500">Transcribed Audio: </span>
                <span className="font-mono text-slate-800">
                  {comparison.spokenText || "(empty)"}
                </span>
              </div>

              {/* Feedback */}
              <div className="text-left text-xs text-slate-700 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 space-y-1">
                <div className="font-bold text-indigo-950 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Pronunciation Insight
                </div>
                <div>{aiFeedback?.phoneticFeedback || comparison.feedback}</div>
                {aiFeedback?.intonation && (
                  <div className="text-[11px] text-indigo-700 font-medium">
                    <strong>Pitch & Intonation:</strong> {aiFeedback.intonation}
                  </div>
                )}
              </div>

              {/* Try Again button */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={startRecording}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Quick Simulation / Manual Tester for Environments without mic access */}
          <div className="pt-2 border-t border-slate-100 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500">
                Test Pronunciation Options:
              </span>
              <span className="text-[10px] text-slate-400">
                {supported ? "Web Speech API is active" : "Web Speech API fallback mode"}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSimulatedPronounce("flawless")}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
              >
                ✨ Test Perfect Voice
              </button>
              <button
                onClick={() => handleSimulatedPronounce("slight")}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold"
              >
                ⚠️ Test Partial Match
              </button>
              <button
                onClick={() => handleSimulatedPronounce("poor")}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold"
              >
                ❌ Test Incorrect Voice
              </button>
            </div>

            {/* Manual text input test */}
            <div className="mt-2 flex gap-1.5">
              <input
                type="text"
                placeholder={`Or type spoken text in ${targetLanguage}...`}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manualInput.trim()) {
                    setLiveTranscript(manualInput);
                    setFinalTranscript(manualInput);
                    evaluateSpokenText(manualInput);
                  }
                }}
                className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
              <button
                onClick={() => {
                  if (manualInput.trim()) {
                    setLiveTranscript(manualInput);
                    setFinalTranscript(manualInput);
                    evaluateSpokenText(manualInput);
                  }
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Check
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Earn +15 XP when you achieve a 65%+ pronunciation match</span>
          <button
            onClick={onClose}
            className="font-bold text-indigo-600 hover:text-indigo-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
