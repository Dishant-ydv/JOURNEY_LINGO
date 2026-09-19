import React, { useState } from "react";
import {
  Sparkles,
  Volume2,
  Mic,
  Send,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Copy,
  Languages,
  Lightbulb,
  Globe2,
} from "lucide-react";
import { UserProfile } from "../types";
import { translateAndLearnText, AITranslateResponse } from "../services/aiService";
import { speakText, playChime } from "../utils/audio";
import { getLanguageMeta } from "../data/multilingualData";

interface Props {
  user: UserProfile;
  onRecordXP: (amount: number) => void;
}

export const SmartTranslateTool: React.FC<Props> = ({ user, onRecordXP }) => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AITranslateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<AITranslateResponse[]>([]);

  const langMeta = getLanguageMeta(user.targetLanguage);

  const sampleHindiPrompts = [
    { hindi: "मुझे एक गिलास पानी चाहिए", english: "I need a glass of water" },
    { hindi: "नमस्ते, शाकाहारी खाना मिलेगा क्या?", english: "Hello, is vegetarian food available?" },
    { hindi: "ट्रेन स्टेशन किस तरफ है?", english: "Which way is the train station?" },
    { hindi: "होटल में चेक-इन करना है", english: "I want to check in to the hotel" },
    { hindi: "यह कितने रुपए/यूरो का है?", english: "How much does this cost?" },
    { hindi: "क्या आप कृपया मेरी मदद कर सकते हैं?", english: "Could you please help me?" },
  ];

  const handleTranslate = async (textToTranslate?: string) => {
    const text = textToTranslate || inputText;
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const response = await translateAndLearnText({
        text,
        inputLanguage: user.nativeLanguage || "Hindi",
        targetLanguage: user.targetLanguage,
        nativeLanguage: user.nativeLanguage || "Hindi",
      });

      setResult(response);
      setHistory((prev) => [response, ...prev.slice(0, 9)]);
      onRecordXP(10);
      playChime(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string) => {
    speakText(text, langMeta.voiceCode);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{langMeta.flag}</span>
            <h3 className="text-lg font-black text-slate-900">
              Hindi / Native to {user.targetLanguage} Smart Translator
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              Real-Time AI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            अपनी भाषा (हिंदी या इंग्लिश) में कोई भी वाक्य लिखें या बोलें — यह तुरंत{" "}
            <strong className="text-indigo-600 font-bold">{user.targetLanguage}</strong> में सटीक उच्चारण और अर्थ देगा।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-600 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            Target: {langMeta.flag} {user.targetLanguage}
          </span>
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Write or paste sentence in Hindi / English:
        </label>
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleTranslate();
              }
            }}
            placeholder="उदा. मुझे शाकाहारी खाना चाहिए / Where is the nearest metro station?"
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white text-sm text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              onClick={() => handleTranslate()}
              disabled={!inputText.trim() || loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Translate & Learn (+10 XP)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-bold text-slate-400">
            Quick Travel Phrases (Tap any to translate immediately):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleHindiPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(p.hindi);
                  handleTranslate(p.hindi);
                }}
                className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 transition-colors text-left font-medium"
              >
                {p.hindi}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Display Card */}
      {result && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 border-2 border-indigo-200 p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-600">
                {user.targetLanguage} Output ({langMeta.nativeName}):
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {result.translatedText}
              </h2>
              <p className="text-sm font-semibold text-indigo-700 font-mono">
                {result.pronunciation}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleSpeak(result.translatedText)}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-transform active:scale-95"
                title="Listen native pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCopy(result.translatedText)}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors"
                title="Copy translated text"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Meaning Cards (Hindi + English) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                <span>🇮🇳</span> हिंदी अर्थ (Hindi Meaning):
              </div>
              <div className="text-sm font-bold text-slate-800">
                {result.meaningHindi || result.originalText}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
              <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                <span>🌐</span> English Translation:
              </div>
              <div className="text-sm font-bold text-slate-800">
                {result.meaningEnglish || result.originalText}
              </div>
            </div>
          </div>

          {/* Grammar & Cultural Tips */}
          {(result.grammarTip || result.culturalTip) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {result.grammarTip && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Grammar Breakdown
                  </div>
                  <p className="leading-relaxed">{result.grammarTip}</p>
                </div>
              )}
              {result.culturalTip && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-indigo-500" />
                    Travel & Etiquette Tip
                  </div>
                  <p className="leading-relaxed">{result.culturalTip}</p>
                </div>
              )}
            </div>
          )}

          {/* Related phrases */}
          {result.relatedPhrases && result.relatedPhrases.length > 0 && (
            <div className="pt-2 border-t border-indigo-100 space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400">
                More related phrases in {user.targetLanguage}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.relatedPhrases.map((rp, i) => (
                  <div
                    key={i}
                    onClick={() => handleSpeak(rp.text)}
                    className="p-2.5 rounded-xl bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{rp.text}</div>
                      <div className="text-[10px] text-indigo-600 font-mono">{rp.reading}</div>
                      <div className="text-[10px] text-slate-500">{rp.meaning}</div>
                    </div>
                    <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History of translated sentences */}
      {history.length > 1 && (
        <div className="border-t border-slate-100 pt-4 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Recently Learned Sentences ({history.length}):
          </h4>
          <div className="space-y-2">
            {history.slice(1, 5).map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{item.translatedText}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.originalText} → {item.meaningEnglish}
                  </div>
                </div>
                <button
                  onClick={() => handleSpeak(item.translatedText)}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
