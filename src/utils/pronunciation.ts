/**
 * Pronunciation and Web Speech API utilities
 */

export interface TokenComparison {
  text: string;
  matched: boolean;
}

export interface PronunciationComparisonResult {
  targetSentence: string;
  spokenText: string;
  score: number; // 0 - 100
  accuracy: number; // 0 - 100
  passed: boolean;
  ratingText: string;
  ratingColor: string;
  tokens: TokenComparison[];
  feedback: string;
}

// Clean text by stripping punctuation and normalizing spaces
export function cleanPunctuation(text: string): string {
  return text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'¿¡。、？！「」『』…—\s]+/g, " ")
    .trim()
    .toLowerCase();
}

// Levenshtein distance calculation
export function calculateLevenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) {
    matrix[i] = [i];
  }
  for (let i = 0; i <= an; ++i) {
    matrix[0][i] = i;
  }

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[bn][an];
}

// Compare target sentence against user spoken transcript
export function compareSpokenInput(
  targetSentence: string,
  userSpokenText: string,
  targetLanguage = "Japanese"
): PronunciationComparisonResult {
  const cleanTarget = cleanPunctuation(targetSentence);
  const cleanUser = cleanPunctuation(userSpokenText);

  // If user said nothing
  if (!cleanUser) {
    return {
      targetSentence,
      spokenText: "",
      score: 0,
      accuracy: 0,
      passed: false,
      ratingText: "No Speech Detected",
      ratingColor: "text-slate-500",
      tokens: tokenizeSentence(targetSentence, targetLanguage).map((t) => ({
        text: t,
        matched: false,
      })),
      feedback: "Please tap the microphone and speak clearly into your device.",
    };
  }

  // Exact match
  if (cleanTarget === cleanUser) {
    const allTokens = tokenizeSentence(targetSentence, targetLanguage).map((t) => ({
      text: t,
      matched: true,
    }));
    return {
      targetSentence,
      spokenText: userSpokenText,
      score: 100,
      accuracy: 100,
      passed: true,
      ratingText: "Flawless Native Pronunciation! 🌟",
      ratingColor: "text-emerald-600",
      tokens: allTokens,
      feedback: "Perfect clarity and phoneme precision. You sound like a local!",
    };
  }

  // Levenshtein similarity
  const maxLen = Math.max(cleanTarget.length, cleanUser.length);
  const dist = calculateLevenshteinDistance(cleanTarget, cleanUser);
  const stringSimilarity = Math.max(0, 1 - dist / maxLen);

  // Token level matching
  const targetTokens = tokenizeSentence(targetSentence, targetLanguage);
  let matchedCount = 0;

  const tokens: TokenComparison[] = targetTokens.map((token) => {
    const cleanTok = cleanPunctuation(token);
    if (!cleanTok) return { text: token, matched: true };

    // Check if token appears in user's spoken input or matches closely
    const inSpoken = cleanUser.includes(cleanTok);
    let closeMatch = false;

    if (!inSpoken) {
      // Check partial word match
      const userWords = cleanUser.split(" ");
      closeMatch = userWords.some((w) => {
        const d = calculateLevenshteinDistance(w, cleanTok);
        return d <= Math.max(1, Math.floor(cleanTok.length * 0.35));
      });
    }

    const matched = inSpoken || closeMatch;
    if (matched) matchedCount++;

    return { text: token, matched };
  });

  const tokenRecall = targetTokens.length > 0 ? matchedCount / targetTokens.length : 0;
  // Weighted score
  const rawScore = Math.round(tokenRecall * 60 + stringSimilarity * 40);
  const finalScore = Math.min(100, Math.max(15, rawScore));
  const accuracy = Math.min(100, Math.max(finalScore - 4, Math.round(finalScore * 0.98)));
  const passed = finalScore >= 65;

  let ratingText = "Needs Practice 🎯";
  let ratingColor = "text-amber-600";
  let feedback = "A few words were unclear or omitted. Review the highlighted words below.";

  if (finalScore >= 90) {
    ratingText = "Excellent Clarity! 🌟";
    ratingColor = "text-emerald-600";
    feedback = "Crystal clear pronunciation with natural rhythm and inflection.";
  } else if (finalScore >= 75) {
    ratingText = "Very Good Effort! 👍";
    ratingColor = "text-indigo-600";
    feedback = "Easily understandable to native speakers. Minor pitch or vowel adjustments.";
  } else if (finalScore >= 65) {
    ratingText = "Good, Keep Going! 👏";
    ratingColor = "text-blue-600";
    feedback = "Good foundation. Try repeating once more while listening to the native audio.";
  }

  return {
    targetSentence,
    spokenText: userSpokenText,
    score: finalScore,
    accuracy,
    passed,
    ratingText,
    ratingColor,
    tokens,
    feedback,
  };
}

// Tokenize sentence according to language characteristics
function tokenizeSentence(sentence: string, targetLanguage: string): string[] {
  const isCjk = ["Japanese", "Korean", "Chinese"].includes(targetLanguage);

  if (!isCjk) {
    // Space-separated languages
    return sentence.split(/\s+/).filter((t) => t.trim().length > 0);
  }

  // For Japanese / CJK: split by punctuation, particles, or grammatical chunks if possible
  // Or break into segments
  const segments = sentence.match(/[\u4e00-\u9faf]+|[\u3040-\u309f]+|[\u30a0-\u30ff]+|[a-zA-Z0-9]+|[\uac00-\ud7af]+|[^\s]/g);
  return segments && segments.length > 0 ? segments : sentence.split("");
}

// Check if Web Speech API SpeechRecognition is supported
export function isWebSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

// Get speech recognition instance safely
export function createSpeechRecognition(): any | null {
  if (typeof window === "undefined") return null;
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    return recognition;
  } catch (err) {
    console.warn("Failed to initialize SpeechRecognition:", err);
    return null;
  }
}
