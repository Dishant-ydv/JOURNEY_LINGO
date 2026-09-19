import {
  FallbackConversation,
  FallbackRoleplay,
  InitialConversationStarter,
  FallbackTranslationResult,
  FallbackPronunciationResult,
} from "../types";

// ==========================================
// 1. Initial Conversation Starters (by language)
// ==========================================
export const initialConversationStarters: Record<string, InitialConversationStarter> = {
  spanish: {
    topic: "Planes de viaje a Madrid",
    text: "¡Hola! ¿A dónde te gustaría viajar este año y qué lugares quieres visitar?",
    romaji: "O-la! A don-de te goos-ta-ree-a vee-a-har es-te an-yo?",
    translation: "Hello! Where would you like to travel this year and what places do you want to visit?",
  },
  french: {
    topic: "Projets de voyage à Paris",
    text: "Bonjour ! Où aimeriez-vous voyager cette année ?",
    romaji: "Bon-zhoor ! Oo aim-ree-voo vwa-ya-zhay set an-nay ?",
    translation: "Hello! Where would you like to travel this year?",
  },
  korean: {
    topic: "서울 여행 계획",
    text: "안녕하세요! 올해 어디로 여행 가고 싶으세요?",
    romaji: "Annyeonghaseyo! Olhae eodiro yeohaeng gago sipeuseyo?",
    translation: "Hello! Where would you like to travel this year?",
  },
  german: {
    topic: "Reisepläne nach Berlin",
    text: "Hallo! Wohin möchtest du dieses Jahr reisen?",
    romaji: "Ha-lo! Vo-hin merkh-test doo dee-zes Yar rye-zen?",
    translation: "Hello! Where would you like to travel this year?",
  },
  italian: {
    topic: "Piani di viaggio a Roma",
    text: "Ciao! Dove vorresti viaggiare quest'anno?",
    romaji: "Chow! Do-vay vor-res-tee vee-ad-ja-re kwest an-no?",
    translation: "Hello! Where would you like to travel this year?",
  },
  japanese: {
    topic: "Travel Plans to Tokyo",
    text: "こんにちは！今年どこへ旅行に行きたいですか？",
    romaji: "Konnichiwa! Kotoshi doko e ryokou ni ikitai desu ka?",
    translation: "Hello! Where would you like to travel this year?",
  },
};

export function getInitialConversation(targetLanguage = "Japanese"): InitialConversationStarter {
  const langKey = (targetLanguage || "").toLowerCase();
  if (langKey.includes("span")) return initialConversationStarters.spanish;
  if (langKey.includes("fren")) return initialConversationStarters.french;
  if (langKey.includes("kore")) return initialConversationStarters.korean;
  if (langKey.includes("germ")) return initialConversationStarters.german;
  if (langKey.includes("ital")) return initialConversationStarters.italian;
  return initialConversationStarters.japanese;
}

// ==========================================
// 2. AI Conversation Fallback Data
// ==========================================
export const fallbackConversations: Record<string, FallbackConversation> = {
  spanish: {
    reply: "¡Excelente! Me parece muy buena respuesta. Sigamos conversando sobre el viaje.",
    romanization: "Ex-se-len-te! Me pa-re-se moo-ee bwe-na res-pwes-ta.",
    translation: "Excellent! That seems like a very good response. Let's keep discussing the trip.",
    feedback: "Natural conversational tone and clear Spanish phrasing!",
    mistakes: [],
    suggestedReplies: [
      "¿Dónde está la estación de tren? (Where is the train station?)",
      "Muchas gracias por su ayuda. (Thank you very much for your help.)",
    ],
  },
  french: {
    reply: "Très bien ! C'est une excellente façon de vous exprimer en français.",
    romanization: "Tray byehn ! Say toon ex-se-lahnt fah-son...",
    translation: "Very good! That's an excellent way to express yourself in French.",
    feedback: "Polite register and good vocabulary choice!",
    mistakes: [],
    suggestedReplies: [
      "Pouvez-vous m'aider, s'il vous plaît ? (Can you help me, please?)",
      "Merci beaucoup pour vos conseils ! (Thanks for the advice!)",
    ],
  },
  german: {
    reply: "Sehr gut! Das klingt wunderbar für Ihre Reise und Unterhaltung.",
    romanization: "Zair goot! Dahs klinkt voon-der-bar...",
    translation: "Very good! That sounds wonderful for your travel conversation.",
    feedback: "Clear sentence structure and good word order!",
    mistakes: [],
    suggestedReplies: [
      "Wo ist die nächste Haltestelle? (Where is the nearest stop?)",
      "Vielen Dank für Ihre Hilfe! (Thank you for your help!)",
    ],
  },
  korean: {
    reply: "네, 아주 좋아요! 여행 중에 정말 자연스러운 표현이에요.",
    romanization: "Ne, a-ju jo-a-yo! Yeo-haeng jung-e jeong-mal ja-yeon-seu-reo-un pyo-hyeon-i-e-yo.",
    translation: "Yes, that's great! It's a very natural expression while traveling.",
    feedback: "Pleasant intonation and polite honorific ending (-yo)!",
    mistakes: [],
    suggestedReplies: [
      "감사합니다! (Thank you!)",
      "어디가 가장 맛있나요? (Where is the most delicious?)",
    ],
  },
  italian: {
    reply: "Molto bene! È un'ottima frase da usare durante il tuo viaggio.",
    romanization: "Mol-to beh-neh! Eh oon-ot-tee-mah frah-zeh...",
    translation: "Very good! That's a great phrase to use during your journey.",
    feedback: "Natural Italian cadence and friendly communicative style!",
    mistakes: [],
    suggestedReplies: [
      "Grazie mille per l'aiuto! (Thanks a lot for the help!)",
      "Dov'è il ristorante tipico? (Where is the typical restaurant?)",
    ],
  },
  japanese: {
    reply: "はい、素晴らしいですね！旅行についてもっと詳しくお話ししましょう。",
    romanization: "Hai, subarashii desu ne! Ryokou ni tsuite motto kashikoku ohanashi shimashou.",
    translation: "Yes, that sounds wonderful! Let's talk more about travel.",
    feedback: "Clear expression and polite conversational tone!",
    mistakes: [],
    suggestedReplies: [
      "おすすめの場所はどこですか？ (Osusume no basho wa doko desu ka?)",
      "ありがとうございます！ (Arigatou gozaimasu!)",
    ],
  },
};

export function getFallbackConversation(
  targetLanguage = "Japanese",
  topic = "Travel",
  _userMessage = ""
): FallbackConversation {
  const langKey = (targetLanguage || "").toLowerCase();
  let base: FallbackConversation;
  if (langKey.includes("span")) base = fallbackConversations.spanish;
  else if (langKey.includes("fren")) base = fallbackConversations.french;
  else if (langKey.includes("germ")) base = fallbackConversations.german;
  else if (langKey.includes("kore")) base = fallbackConversations.korean;
  else if (langKey.includes("ital")) base = fallbackConversations.italian;
  else {
    base = {
      ...fallbackConversations.japanese,
      reply: `はい、素晴らしいですね！${topic}についてもっと詳しくお話ししましょう。`,
      translation: `Yes, that sounds wonderful! Let's talk more about ${topic}.`,
    };
  }
  return base;
}

// ==========================================
// 3. AI Roleplay Fallback Data
// ==========================================
export const fallbackRoleplays: Record<string, Omit<FallbackRoleplay, "isCompleted">> = {
  spanish: {
    reply: "¡Bienvenido! Con mucho gusto le atiendo aquí en recepción.",
    romanization: "Byen-ve-nee-do! Kon moo-cho goos-to le a-tyen-do a-kee.",
    translation: "Welcome! I am pleased to assist you here at reception.",
    performance: {
      fluency: 88,
      vocabulary: 87,
      grammar: 86,
      overall: 87,
      feedback: "Polite Spanish travel etiquette! Appropriate formal register used.",
    },
    suggestedResponses: [
      "Tengo una reserva a nombre de viajero. (I have a reservation.)",
      "¿A qué hora sirven el desayuno? (What time is breakfast served?)",
    ],
  },
  french: {
    reply: "Bonjour ! Bienvenue. Comment puis-je vous renseigner aujourd'hui ?",
    romanization: "Bon-zhoor ! Byen-ve-noo. Ko-mahn pwee-zhuh voo rahn-say-nyay...",
    translation: "Hello! Welcome. How can I help or guide you today?",
    performance: {
      fluency: 88,
      vocabulary: 86,
      grammar: 86,
      overall: 87,
      feedback: "Courteous greeting and polite phrasing appropriate for travel.",
    },
    suggestedResponses: [
      "J'ai une réservation confirmée. (I have a confirmed reservation.)",
      "Merci beaucoup pour votre accueil. (Thank you for your welcome.)",
    ],
  },
  korean: {
    reply: "안녕하세요! 체크인을 도와드리겠습니다. 예약자 성함이 어떻게 되시나요?",
    romanization: "Annyeonghaseyo! Chekeu-in-eul dowa-deurigesseumnida. Yeyakja seonghami eotteoke doesinayo?",
    translation: "Hello! I can assist you with check-in. What is your reservation name?",
    performance: {
      fluency: 88,
      vocabulary: 87,
      grammar: 86,
      overall: 87,
      feedback: "Polite honorific Korean and natural travel response!",
    },
    suggestedResponses: [
      "제 이름으로 예약했습니다. (I booked under my name.)",
      "와이파이 비밀번호가 무엇인가요? (What is the Wi-Fi password?)",
    ],
  },
  german: {
    reply: "Guten Tag! Herzlich willkommen. Wie kann ich Ihnen heute behilflich sein?",
    romanization: "Goo-ten Tag! Herts-likh vil-ko-men. Vee kan ikh Ee-nen hoy-te be-hilf-likh zyne?",
    translation: "Good day! Welcome. How may I assist you today?",
    performance: {
      fluency: 87,
      vocabulary: 86,
      grammar: 86,
      overall: 86,
      feedback: "Formal Sie-form addressing and clear German pronunciation structure.",
    },
    suggestedResponses: [
      "Ich habe eine Reservierung. (I have a reservation.)",
      "Wann gibt es Frühstück? (When is breakfast?)",
    ],
  },
  italian: {
    reply: "Buongiorno e benvenuto! Come posso esserle utile oggi?",
    romanization: "Bwon-dzhor-no eh ben-ve-noo-to! Ko-meh pos-so es-ser-leh oo-tee-leh od-jee?",
    translation: "Good morning and welcome! How can I be of help to you today?",
    performance: {
      fluency: 88,
      vocabulary: 87,
      grammar: 86,
      overall: 87,
      feedback: "Friendly formal Italian greeting suitable for hospitality.",
    },
    suggestedResponses: [
      "Ho una prenotazione a mio nome. (I have a reservation in my name.)",
      "A che ora è il check-out? (What time is check-out?)",
    ],
  },
  japanese: {
    reply: "かしこまりました。ご予約のお名前とおパスポートを拝見できますでしょうか？",
    romanization: "Kashikomarimashita. Go-yoyaku no onamae to o-pasupooto wo haiken dekimasu deshou ka?",
    translation: "Certainly. Could I please see your reservation name and passport?",
    performance: {
      fluency: 88,
      vocabulary: 86,
      grammar: 85,
      overall: 86,
      feedback: "Clear pronunciation and polite keigo phrasing suited for customer service.",
    },
    suggestedResponses: [
      "はい、こちらがパスポートです。(Hai, kochira ga pasupooto desu.)",
      "チェックアウトは何時ですか？(Chekkuauto wa nanji desu ka?)",
    ],
  },
};

export function getFallbackRoleplay(
  _scenario = "Hotel Check-in",
  _role = "Staff",
  _location = "Destination",
  targetLanguage = "Japanese",
  isEndTurn = false
): FallbackRoleplay {
  const langKey = (targetLanguage || "").toLowerCase();
  let base: Omit<FallbackRoleplay, "isCompleted">;

  if (langKey.includes("span")) base = fallbackRoleplays.spanish;
  else if (langKey.includes("fren")) base = fallbackRoleplays.french;
  else if (langKey.includes("kore")) base = fallbackRoleplays.korean;
  else if (langKey.includes("germ")) base = fallbackRoleplays.german;
  else if (langKey.includes("ital")) base = fallbackRoleplays.italian;
  else base = fallbackRoleplays.japanese;

  return {
    ...base,
    isCompleted: Boolean(isEndTurn),
  };
}

// ==========================================
// 4. Pronunciation Evaluation Fallback
// ==========================================
export function getFallbackPronunciation(
  targetPhrase = "",
  userTranscript = ""
): FallbackPronunciationResult {
  const normalizedTarget = (targetPhrase || "").trim().toLowerCase();
  const normalizedUser = (userTranscript || targetPhrase || "").trim().toLowerCase();
  const match = normalizedTarget === normalizedUser;
  const score = match ? Math.floor(88 + Math.random() * 9) : 79;

  return {
    score,
    accuracy: score + 2,
    intonation: "Accurate pitch accent and clear vowel endings.",
    phoneticFeedback: `Clear articulation of "${targetPhrase}". Rhythmic timing aligns with native speech patterns.`,
    passed: score >= 70,
  };
}

// ==========================================
// 5. Offline Fallback Translations Dictionary
// ==========================================
export function getFallbackTranslation(
  text: string,
  targetLanguage = "Japanese"
): FallbackTranslationResult {
  const clean = (text || "").toLowerCase().trim();
  const lang = (targetLanguage || "").toLowerCase();

  let translated = "";
  let reading = "";
  let engMeaning = "";
  let hinMeaning = "";

  if (lang.includes("span")) {
    if (clean.includes("pani") || clean.includes("water") || clean.includes("पानी")) {
      translated = "Quisiera un vaso de agua, por favor.";
      reading = "Ki-sye-ra oon va-so de a-gwa, por fa-vor.";
      engMeaning = "I would like a glass of water, please.";
      hinMeaning = "मुझे एक गिलास पानी चाहिए, कृपया।";
    } else if (clean.includes("namaste") || clean.includes("hello") || clean.includes("नमस्ते")) {
      translated = "¡Hola! ¿Cómo estás? Mucho gusto.";
      reading = "O-la! Ko-mo es-tas? Moo-cho goos-to.";
      engMeaning = "Hello! How are you? Nice to meet you.";
      hinMeaning = "नमस्ते! आप कैसे हैं? आपसे मिलकर खुशी हुई।";
    } else {
      translated = `¿Dónde está el lugar más cercano para ${text}?`;
      reading = "Don-de es-ta el loo-gar mas ser-ka-no...";
      engMeaning = `Where is the nearest place for ${text}?`;
      hinMeaning = `${text} के लिए सबसे नज़दीकी जगह कहाँ है?`;
    }
  } else if (lang.includes("fren")) {
    if (clean.includes("pani") || clean.includes("water") || clean.includes("पानी")) {
      translated = "Une carafe d'eau, s'il vous plaît.";
      reading = "Oon ka-rahf doh, seel voo play.";
      engMeaning = "A jug of tap water, please.";
      hinMeaning = "कृपया पानी की सुराही दीजिए।";
    } else {
      translated = `Bonjour, je cherche ${text}, s'il vous plaît.`;
      reading = "Bon-zhoor, zhe shairsh... seel voo play.";
      engMeaning = `Hello, I am looking for ${text}, please.`;
      hinMeaning = `नमस्ते, मैं ${text} ढूंढ रहा हूँ, कृपया।`;
    }
  } else if (lang.includes("kore")) {
    if (clean.includes("pani") || clean.includes("water") || clean.includes("पानी")) {
      translated = "물 좀 주세요.";
      reading = "Mul jom juseyo.";
      engMeaning = "Please give me water.";
      hinMeaning = "कृपया पानी दीजिए।";
    } else {
      translated = `${text} 어디에 있나요?`;
      reading = `${text} eodie innayo?`;
      engMeaning = `Where is ${text}?`;
      hinMeaning = `${text} कहाँ पर है?`;
    }
  } else if (lang.includes("germ")) {
    if (clean.includes("pani") || clean.includes("water") || clean.includes("पानी")) {
      translated = "Ein Glas Wasser bitte.";
      reading = "Eye-n Glas Va-ser bi-te.";
      engMeaning = "A glass of water please.";
      hinMeaning = "एक गिलास पानी कृपया।";
    } else {
      translated = `Entschuldigung, wo ist ${text}?`;
      reading = `Ent-shool-dee-goong, voh ist ${text}?`;
      engMeaning = `Excuse me, where is ${text}?`;
      hinMeaning = `माफ़ कीजिए, ${text} कहाँ है?`;
    }
  } else if (lang.includes("ital")) {
    if (clean.includes("pani") || clean.includes("water") || clean.includes("पानी")) {
      translated = "Un bicchiere d'acqua, per favore.";
      reading = "Oon beek-kye-re dahk-wa, pair fa-vo-re.";
      engMeaning = "A glass of water, please.";
      hinMeaning = "एक गिलास पानी, कृपया।";
    } else {
      translated = `Scusi, dov'è ${text}?`;
      reading = `Skoo-zee, doh-vay ${text}?`;
      engMeaning = `Excuse me, where is ${text}?`;
      hinMeaning = `माफ़ कीजिए, ${text} कहाँ है?`;
    }
  } else {
    // Japanese
    if (clean.includes("pani") || clean.includes("water") || clean.includes("पानी")) {
      translated = "お水を一杯いただけますか？";
      reading = "O-mizu wo ippai itadakemasu ka?";
      engMeaning = "Could I have a glass of water, please?";
      hinMeaning = "क्या मुझे एक गिलास पानी मिल सकता है?";
    } else {
      translated = `${text}はどこにありますか？`;
      reading = `${text} wa doko ni arimasu ka?`;
      engMeaning = `Where is ${text}?`;
      hinMeaning = `${text} कहाँ है?`;
    }
  }

  return {
    originalText: text,
    translatedText: translated,
    pronunciation: reading,
    meaningHindi: hinMeaning,
    meaningEnglish: engMeaning,
    grammarTip: `Common authentic structure in ${targetLanguage} for daily travel encounters.`,
    culturalTip: "Polite expressions and greetings smooth interactions with local residents.",
    relatedPhrases: [
      {
        text: translated,
        reading,
        meaning: engMeaning,
      },
    ],
  };
}
