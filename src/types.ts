export type AppTab = "dashboard" | "learn" | "practice" | "progress" | "missions" | "specs";

export type ProficiencyLevel = "Beginner" | "Elementary" | "Intermediate" | "Advanced";

export interface UserProfile {
  name: string;
  email?: string;
  nativeLanguage: string;
  targetLanguage: string;
  targetCity: string;
  targetCountry: string;
  level: ProficiencyLevel;
  primaryGoal: string;
  secondaryGoals: string[];
  streakDays: number;
  xp: number;
  levelNumber: number;
  levelTitle: string;
  wordsLearned: number;
  conversationsPracticed: number;
  missionsCompleted: number;
  totalMissions: number;
  studyTimeMinutes: number;
  accuracyRate: number;
  todayProgress: number; // percentage (0-100)
}

export interface JourneyLocation {
  id: string;
  order: number;
  name: string;
  japaneseName: string;
  iconName: string;
  status: "completed" | "in_progress" | "locked";
  description: string;
  completedMissions: number;
  totalMissions: number;
  lessonsCompleted?: number;
  totalLessons?: number;
  tag: string;
}

export interface VocabWord {
  id: string;
  word: string;
  reading: string; // e.g. romaji or kana
  meaning: string;
  hindiMeaning?: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleReading: string;
  exampleMeaning: string;
  exampleHindi?: string;
  tip?: string;
  audioText?: string;
  isBookmarked?: boolean;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  avatar: string;
  role: "agent" | "user" | "tutor";
  japanese: string;
  romaji: string;
  english: string;
  hindi?: string;
  audioPrompt?: string;
}

export interface GrammarPoint {
  title: string;
  pattern: string;
  explanation: string;
  hindiExplanation?: string;
  structure: string;
  examples: {
    japanese: string;
    romaji: string;
    english: string;
    hindi?: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "fill_blank" | "match" | "listening";
  prompt: string;
  japanesePrompt?: string;
  hindiPrompt?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  audioPrompt?: string;
}

export interface LessonData {
  id: string;
  title: string;
  location: string;
  step: number;
  sceneIntro: {
    title: string;
    subtitle: string;
    description: string;
    highlights: string[];
  };
  dialogue: DialogueLine[];
  vocabulary: VocabWord[];
  grammar: GrammarPoint;
  practiceActivities: {
    fillInTheBlank: {
      sentence: string;
      missingWord: string;
      options: string[];
    };
    matchPairs: { left: string; right: string }[];
    dragDropWords: string[];
  };
  miniQuiz: QuizQuestion[];
  summary: {
    newWordsCount: number;
    grammarPointsCount: number;
    activitiesCompleted: number;
    xpReward: number;
  };
}

export interface RoleplayScenario {
  id: string;
  title: string;
  location: string;
  aiRole: string;
  aiAvatar: string;
  brief: string;
  goal: string;
  initialMessage: string;
  initialRomaji: string;
  initialTranslation: string;
  suggestedPrompts: string[];
}

export interface AnalyticsPoint {
  date: string;
  xp: number;
  studyMinutes: number;
  accuracy: number;
  wordsReviewed: number;
}

export interface SkillProgress {
  skill: string;
  percentage: number;
  levelText: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  icon: string;
  dateUnlocked: string;
  unlocked: boolean;
  description: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  category: "lesson" | "ai_conversation" | "pronunciation" | "listening";
  timestamp: string;
  xpEarned: number;
}

export interface FallbackConversation {
  reply: string;
  romanization: string;
  translation: string;
  feedback: string;
  mistakes: string[];
  suggestedReplies: string[];
}

export interface FallbackRoleplayPerformance {
  fluency: number;
  vocabulary: number;
  grammar: number;
  overall: number;
  feedback: string;
}

export interface FallbackRoleplay {
  reply: string;
  romanization: string;
  translation: string;
  performance: FallbackRoleplayPerformance;
  isCompleted: boolean;
  suggestedResponses: string[];
}

export interface InitialConversationStarter {
  topic: string;
  text: string;
  romaji: string;
  translation: string;
}

export interface FallbackTranslationResult {
  originalText: string;
  translatedText: string;
  pronunciation: string;
  meaningHindi: string;
  meaningEnglish: string;
  grammarTip: string;
  culturalTip: string;
  relatedPhrases: { text: string; reading: string; meaning: string }[];
}

export interface FallbackPronunciationResult {
  score: number;
  accuracy: number;
  intonation: string;
  phoneticFeedback: string;
  passed: boolean;
}
