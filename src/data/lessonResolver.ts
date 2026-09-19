import { LessonData, RoleplayScenario, VocabWord } from "../types";
import { japaneseModules, ModuleKey, ModuleContent } from "./lessonsJapanese";
import { spanishModules } from "./lessonsSpanish";
import { frenchModules } from "./lessonsFrench";
import { koreanModules } from "./lessonsKorean";
import { germanModules, italianModules } from "./lessonsGermanItalian";

const MODULE_KEYS_BY_INDEX: ModuleKey[] = [
  "airport",
  "hotel",
  "restaurant",
  "metro",
  "shopping",
  "attractions",
];

export function resolveModuleKey(locationIdOrKey: string): ModuleKey {
  if (MODULE_KEYS_BY_INDEX.includes(locationIdOrKey as ModuleKey)) {
    return locationIdOrKey as ModuleKey;
  }
  // Try matching by "loc-1", "loc-2", "tokyo-1", etc.
  const match = locationIdOrKey.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    const index = Math.max(0, Math.min(5, num - 1));
    return MODULE_KEYS_BY_INDEX[index];
  }
  return "airport";
}

export function getLanguageModules(targetLanguage: string): Record<ModuleKey, ModuleContent> {
  const lang = (targetLanguage || "Japanese").toLowerCase();
  if (lang.includes("span")) return spanishModules;
  if (lang.includes("fren") || lang.includes("franç")) return frenchModules;
  if (lang.includes("kore") || lang.includes("한국")) return koreanModules;
  if (lang.includes("germ") || lang.includes("deut")) return germanModules;
  if (lang.includes("ital")) return italianModules;
  return japaneseModules;
}

export function getLessonDataForLanguageAndLocation(
  targetLanguage: string,
  locationId: string,
  step = 1
): LessonData {
  const moduleKey = resolveModuleKey(locationId);
  const modules = getLanguageModules(targetLanguage);
  const mod = modules[moduleKey] || modules["airport"];

  // Convert dialogue
  const dialogue = mod.dialogue.map((d, index) => ({
    id: `dlg-${moduleKey}-${index + 1}`,
    speaker: d.speaker,
    avatar: d.avatar,
    role: d.role,
    japanese: d.text, // Represents target language line
    romaji: d.reading,
    english: d.english,
    hindi: d.hindi,
    audioPrompt: d.text,
  }));

  // Convert vocab
  const vocabulary = mod.vocab.map((v, index) => ({
    id: `voc-${moduleKey}-${index + 1}`,
    word: v.word,
    reading: v.reading,
    meaning: v.meaning,
    hindiMeaning: v.hindi,
    partOfSpeech: v.partOfSpeech,
    exampleSentence: v.example,
    exampleReading: v.exampleReading,
    exampleMeaning: v.exampleMeaning,
    exampleHindi: v.tip,
    tip: v.tip,
    audioText: v.word,
    isBookmarked: false,
  }));

  // Grammar
  const grammar = {
    title: mod.grammar.title,
    pattern: mod.grammar.pattern,
    explanation: mod.grammar.explanation,
    hindiExplanation: mod.grammar.hindiExplanation,
    structure: mod.grammar.pattern,
    examples: mod.grammar.examples.map((ex) => ({
      japanese: ex.text,
      romaji: ex.reading,
      english: ex.english,
    })),
  };

  // Practice activities generated dynamically from module vocab
  const primaryVocab = mod.vocab[0] || { word: "Sample", meaning: "Example" };
  const secondaryVocab = mod.vocab[1] || { word: "Sample2", meaning: "Example2" };
  const thirdVocab = mod.vocab[2] || { word: "Sample3", meaning: "Example3" };

  const fillInTheBlank = {
    sentence: `${mod.grammar.examples[0]?.text || primaryVocab.example}`,
    missingWord: primaryVocab.word,
    options: [
      primaryVocab.word,
      secondaryVocab.word,
      thirdVocab.word,
      mod.vocab[3]?.word || "Extra",
    ].sort(() => 0.5 - Math.random()),
  };

  const matchPairs = mod.vocab.slice(0, 4).map((v) => ({
    left: v.word,
    right: v.meaning,
  }));

  const dragDropWords = [
    primaryVocab.word,
    secondaryVocab.word,
    thirdVocab.word,
  ];

  // Quiz
  const miniQuiz = mod.quiz.map((q, index) => ({
    id: `quiz-${moduleKey}-${index + 1}`,
    type: "mcq" as const,
    prompt: q.prompt,
    hindiPrompt: q.hindiPrompt,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  }));

  return {
    id: `lesson-${targetLanguage.toLowerCase()}-${moduleKey}`,
    title: mod.title,
    location: mod.locationName,
    step: step,
    sceneIntro: {
      title: mod.introTitle,
      subtitle: `${targetLanguage} Mission Module`,
      description: mod.introDesc,
      highlights: [
        `Authentic real-world scenario in ${mod.locationName}`,
        `5 high-frequency vocabulary words with native pronunciation`,
        `Practical cultural phrase patterns & interactive roleplay`,
      ],
    },
    dialogue,
    vocabulary,
    grammar,
    practiceActivities: {
      fillInTheBlank,
      matchPairs,
      dragDropWords,
    },
    miniQuiz,
    summary: {
      newWordsCount: vocabulary.length,
      grammarPointsCount: 1,
      activitiesCompleted: 3,
      xpReward: 120,
    },
  };
}

export function getRoleplayScenarioForLanguageAndLocation(
  targetLanguage: string,
  locationId: string
): RoleplayScenario {
  const moduleKey = resolveModuleKey(locationId);
  const modules = getLanguageModules(targetLanguage);
  const mod = modules[moduleKey] || modules["airport"];

  return {
    id: `roleplay-${targetLanguage.toLowerCase()}-${moduleKey}`,
    title: mod.roleplay.title,
    location: mod.locationName,
    aiRole: mod.roleplay.role,
    aiAvatar: mod.roleplay.avatar,
    brief: mod.roleplay.brief,
    goal: `Practice real-world interaction in ${targetLanguage}`,
    initialMessage: mod.roleplay.initialMessage,
    initialRomaji: mod.roleplay.initialReading,
    initialTranslation: mod.roleplay.initialTranslation,
    suggestedPrompts: mod.roleplay.suggestedPrompts,
  };
}

export function getAllRoleplayScenariosForLanguage(targetLanguage: string): RoleplayScenario[] {
  return MODULE_KEYS_BY_INDEX.map((key) =>
    getRoleplayScenarioForLanguageAndLocation(targetLanguage, key)
  );
}

export function getVocabularyForLanguageAndModule(
  targetLanguage: string,
  locationId: string
): VocabWord[] {
  const lesson = getLessonDataForLanguageAndLocation(targetLanguage, locationId);
  return lesson.vocabulary;
}

export interface ListeningItem {
  audioText: string;
  reading?: string;
  question: string;
  hindiQuestion: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export function getListeningChallengeForLanguageAndModule(
  targetLanguage: string,
  locationId: string
): ListeningItem {
  const moduleKey = resolveModuleKey(locationId);
  const modules = getLanguageModules(targetLanguage);
  const mod = modules[moduleKey] || modules["airport"];

  // Use the 1st or 2nd dialogue line
  const line = mod.dialogue[0] || {
    text: "Bonjour",
    reading: "bonjour",
    english: "Hello",
    hindi: "नमस्ते",
  };

  const line2 = mod.dialogue[1];

  const question = `What does the speaker say in the audio?`;
  const hindiQuestion = `ऑडियो में क्या बोला जा रहा है?`;

  const correctAnswer = line.english;
  const wrongOptions = [
    line2?.english || "Where is the hotel?",
    "How much does the ticket cost?",
    "Could you please repeat that?",
    "Thank you very much and goodbye!",
  ].filter((opt) => opt !== correctAnswer).slice(0, 3);

  const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random());

  return {
    audioText: line.text,
    reading: line.reading,
    question,
    hindiQuestion,
    options,
    correctAnswer,
    explanation: `Target: "${line.text}" (${line.reading || ""})\nEnglish: ${line.english}\n🇮🇳 Hindi: ${line.hindi || ""}`,
  };
}
