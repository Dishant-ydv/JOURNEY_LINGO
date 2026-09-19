import { LessonData, RoleplayScenario } from "../types";
import { getLanguageMeta, normalizeLangId } from "./multilingualData";

// Definition of 6 distinct modules with unique sentences for each language
type ModuleKey = "airport" | "hotel" | "restaurant" | "metro" | "shopping" | "attractions";

interface ModuleContent {
  title: string;
  locationName: string;
  introTitle: string;
  introDesc: string;
  dialogue: {
    speaker: string;
    avatar: string;
    role: "agent" | "user";
    text: string;
    reading: string;
    english: string;
    hindi: string;
  }[];
  vocab: {
    word: string;
    reading: string;
    meaning: string;
    hindi: string;
    partOfSpeech: string;
    example: string;
    exampleReading: string;
    exampleMeaning: string;
    tip: string;
  }[];
  grammar: {
    title: string;
    pattern: string;
    explanation: string;
    hindiExplanation: string;
    examples: { text: string; reading: string; english: string }[];
  };
  quiz: {
    prompt: string;
    hindiPrompt: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
  roleplay: {
    title: string;
    role: string;
    avatar: string;
    brief: string;
    initialMessage: string;
    initialReading: string;
    initialTranslation: string;
    initialHindi: string;
    suggestedPrompts: string[];
  };
}

// 1. JAPANESE (日本語) - Tokyo
const japaneseModules: Record<ModuleKey, ModuleContent> = {
  airport: {
    title: "Airport Arrival & Customs (空港と税関)",
    locationName: "成田国際空港 (Narita Airport, Tokyo)",
    introTitle: "Welcome to Narita Airport, Tokyo!",
    introDesc: "Clear customs, declare your visit, and prepare for your Japan journey.",
    dialogue: [
      {
        speaker: "Customs Officer (税関審査官)",
        avatar: "👮",
        role: "agent",
        text: "パスポートを見せてください。滞在の目的は何ですか？",
        reading: "Pasupooto wo misete kudasai. Taizai no mokuteki wa nan desu ka?",
        english: "Please show your passport. What is the purpose of your stay?",
        hindi: "कृपया अपना पासपोर्ट दिखाएं। आपके ठहरने का क्या उद्देश्य है?",
      },
      {
        speaker: "You (Learner)",
        avatar: "🧑‍💻",
        role: "user",
        text: "観光です。一週間滞在します。",
        reading: "Kankou desu. Isshuukan taizai shimasu.",
        english: "Sightseeing/Tourism. I will stay for one week.",
        hindi: "पर्यटन (घूमना-फिरना)। मैं एक सप्ताह ठहरूँगा।",
      },
      {
        speaker: "Customs Officer",
        avatar: "👮",
        role: "agent",
        text: "ようこそ日本へ！良い旅を！",
        reading: "Youkoso Nihon e! Yoi tabi wo!",
        english: "Welcome to Japan! Have a great trip!",
        hindi: "जापान में आपका स्वागत है! आपकी यात्रा मंगलमय हो!",
      },
    ],
    vocab: [
      {
        word: "パスポート",
        reading: "Pasupooto",
        meaning: "Passport",
        hindi: "पासपोर्ट",
        partOfSpeech: "Noun",
        example: "パスポートを忘れないでください。",
        exampleReading: "Pasupooto wo wasurenaide kudasai.",
        exampleMeaning: "Please do not forget your passport.",
        tip: "Always keep your passport handy during customs check.",
      },
      {
        word: "観光",
        reading: "Kankou",
        meaning: "Sightseeing / Tourism",
        hindi: "पर्यटन / घूमना",
        partOfSpeech: "Noun",
        example: "観光で東京に来ました。",
        exampleReading: "Kankou de Toukyou ni kimashita.",
        exampleMeaning: "I came to Tokyo for sightseeing.",
        tip: "Use this when asked for purpose of visit.",
      },
      {
        word: "手荷物",
        reading: "Tenimotsu",
        meaning: "Hand luggage / Baggage",
        hindi: "सामान / बैगेज",
        partOfSpeech: "Noun",
        example: "手荷物受取所はどこですか？",
        exampleReading: "Tenimotsu uketorijo wa doko desu ka?",
        exampleMeaning: "Where is baggage claim?",
        tip: "Useful for locating baggage carousels.",
      },
      {
        word: "両替",
        reading: "Ryougae",
        meaning: "Currency exchange",
        hindi: "मुद्रा विनिमय (करेंसी एक्सचेंज)",
        partOfSpeech: "Noun",
        example: "日本円に両替したいです。",
        exampleReading: "Nihon'en ni ryougae shitai desu.",
        exampleMeaning: "I want to exchange to Japanese Yen.",
        tip: "Currency booths are located right outside arrivals.",
      },
      {
        word: "到着",
        reading: "Touchaku",
        meaning: "Arrival",
        hindi: "आगमन (पहुंचना)",
        partOfSpeech: "Noun",
        example: "定刻に到着しました。",
        exampleReading: "Teikoku ni touchaku shimashita.",
        exampleMeaning: "Arrived on schedule.",
        tip: "Look for 到着 on airport terminal signs.",
      },
    ],
    grammar: {
      title: "Expressing Purpose: 〜で来ました (-de kimashita)",
      pattern: "[Noun] + で来ました",
      explanation: "Use this to explain the reason or purpose of your trip politely.",
      hindiExplanation: "अपनी यात्रा का कारण बताने के लिए [कारण] + で来ました का प्रयोग करें।",
      examples: [
        { text: "観光で来ました。", reading: "Kankou de kimashita.", english: "I came for sightseeing." },
        { text: "仕事で来ました。", reading: "Shigoto de kimashita.", english: "I came for business/work." },
      ],
    },
    quiz: [
      {
        prompt: "What does 「観光です」(Kankou desu) mean?",
        hindiPrompt: "「観光です」का क्या अर्थ है?",
        options: ["Tourism / Sightseeing", "Business trip", "Transit only", "Returning home"],
        correctAnswer: "Tourism / Sightseeing",
        explanation: "観光 (kankou) means sightseeing or tourism.",
      },
      {
        prompt: "Which word means 'Passport' in Japanese?",
        hindiPrompt: "जापानी में 'पासपोर्ट' को क्या कहते हैं?",
        options: ["パスポート (Pasupooto)", "チケット (Chiketto)", "ホテル (Hoteru)", "電車 (Densha)"],
        correctAnswer: "パスポート (Pasupooto)",
        explanation: "パスポート (Pasupooto) is the katakana loanword for passport.",
      },
    ],
    roleplay: {
      title: "Narita Customs Check",
      role: "Immigration Officer",
      avatar: "👮",
      brief: "Present your passport and state your vacation duration.",
      initialMessage: "日本へようこそ。滞在の目的は何ですか？",
      initialReading: "Nihon e youkoso. Taizai no mokuteki wa nan desu ka?",
      initialTranslation: "Welcome to Japan. What is the purpose of your visit?",
      initialHindi: "जापान में स्वागत है। आपके आगमन का उद्देश्य क्या है?",
      suggestedPrompts: [
        "観光です。(Kankou desu - Tourism)",
        "一週間滞在します。(Isshuukan taizai shimasu - Staying 1 week)",
        "東京と京都に行きます。(Toukyou to Kyouto ni ikimasu - Going to Tokyo & Kyoto)",
      ],
    },
  },

  hotel: {
    title: "Hotel Check-in & Requests (ホテルチェックイン)",
    locationName: "サクラホテル (Sakura Hotel, Shinjuku, Tokyo)",
    introTitle: "Check-in at Sakura Hotel",
    introDesc: "Request your room key, confirm your booking, and ask for Wi-Fi details.",
    dialogue: [
      {
        speaker: "Receptionist",
        avatar: "👩‍💼",
        role: "agent",
        text: "いらっしゃいませ！ご予約はございますか？",
        reading: "Irasshaimase! Go-yoyaku wa gozaimasu ka?",
        english: "Welcome! Do you have a reservation?",
        hindi: "नमस्ते! क्या आपका कोई आरक्षण (बुकिंग) है?",
      },
      {
        speaker: "You (Learner)",
        avatar: "🧑‍💻",
        role: "user",
        text: "はい、Dishantの名前で予約しています。チェックインをお願いします。",
        reading: "Hai, Dishant no namae de yoyaku shite imasu. Chekkuin wo onegaishimasu.",
        english: "Yes, I booked under Dishant. Check-in please.",
        hindi: "हाँ, Dishant के नाम से बुकिंग है। कृपया चेक-इन कर दीजिए।",
      },
      {
        speaker: "Receptionist",
        avatar: "👩‍💼",
        role: "agent",
        text: "かしこまりました。カードキーとWi-Fiパスワードはこちらです。",
        reading: "Kashikomarimashita. Kaadokii to Wi-Fi pasuwaado wa kochira desu.",
        english: "Understood. Here is your key card and Wi-Fi password.",
        hindi: "बिल्कुल। यह रहा आपका कार्ड की और वाई-फाई पासवर्ड।",
      },
    ],
    vocab: [
      {
        word: "チェックイン",
        reading: "Chekkuin",
        meaning: "Check-in",
        hindi: "चेक-इन",
        partOfSpeech: "Noun",
        example: "チェックインは何時からですか？",
        exampleReading: "Chekkuin wa nanji kara desu ka?",
        exampleMeaning: "What time does check-in start?",
        tip: "Standard check-in time in Japan is 3:00 PM.",
      },
      {
        word: "予約",
        reading: "Yoyaku",
        meaning: "Reservation / Booking",
        hindi: "आरक्षण / बुकिंग",
        partOfSpeech: "Noun",
        example: "予約を確認してください。",
        exampleReading: "Yoyaku wo kakunin shite kudasai.",
        exampleMeaning: "Please verify my booking.",
        tip: "Always have your booking voucher or app ready.",
      },
      {
        word: "部屋",
        reading: "Heya",
        meaning: "Room",
        hindi: "कमरा",
        partOfSpeech: "Noun",
        example: "禁煙の部屋をお願いします。",
        exampleReading: "Kin'en no heya wo onegaishimasu.",
        exampleMeaning: "A non-smoking room, please.",
        tip: "Kin'en (禁煙) is non-smoking, Kitsuen (喫煙) is smoking.",
      },
      {
        word: "荷物",
        reading: "Nimotsu",
        meaning: "Luggage / Baggage",
        hindi: "सामान",
        partOfSpeech: "Noun",
        example: "荷物を預かってもらえますか？",
        exampleReading: "Nimotsu wo azukatte moraemasu ka?",
        exampleMeaning: "Could you hold my luggage?",
        tip: "Most hotels hold your luggage for free before check-in.",
      },
      {
        word: "鍵",
        reading: "Kagi",
        meaning: "Key / Key Card",
        hindi: "चाबी / कार्ड की",
        partOfSpeech: "Noun",
        example: "部屋の鍵を失くしました。",
        exampleReading: "Heya no kagi wo nakushimashita.",
        exampleMeaning: "I lost my room key.",
        tip: "Card keys are called カードキー (kaadokii).",
      },
    ],
    grammar: {
      title: "Polite Request: 〜をお願いします (-wo onegaishimasu)",
      pattern: "[Noun] + をお願いします",
      explanation: "Add をお願いします to request any item or service with maximum politeness.",
      hindiExplanation: "किसी वस्तु या सेवा का विनम्र निवेदन करने के लिए [चीज़] + をお願いします कहें।",
      examples: [
        { text: "チェックインをお願いします。", reading: "Chekkuin wo onegaishimasu.", english: "Check-in, please." },
        { text: "領収書をお願いします。", reading: "Ryoushuusho wo onegaishimasu.", english: "Receipt, please." },
      ],
    },
    quiz: [
      {
        prompt: "How do you politely ask for check-in?",
        hindiPrompt: "विनम्रता से चेक-इन के लिए कैसे कहेंगे?",
        options: ["チェックインをお願いします", "チェックアウトです", "いくらですか", "さようなら"],
        correctAnswer: "チェックインをお願いします",
        explanation: "「〜をお願いします」 makes the request courteous and standard.",
      },
      {
        prompt: "Which word means 'Room' in Japanese?",
        hindiPrompt: "कमरे को जापानी में क्या कहते हैं?",
        options: ["部屋 (Heya)", "鍵 (Kagi)", "駅 (Eki)", "水 (Mizu)"],
        correctAnswer: "部屋 (Heya)",
        explanation: "部屋 (Heya) means room.",
      },
    ],
    roleplay: {
      title: "Hotel Front Desk",
      role: "Hotel Receptionist",
      avatar: "👩‍💼",
      brief: "Check-in to your room and ask for the Wi-Fi password.",
      initialMessage: "いらっしゃいませ！ご宿泊のご予約はお持ちですか？",
      initialReading: "Irasshaimase! Go-shukuhaku no go-yoyaku wa omochi desu ka?",
      initialTranslation: "Welcome! Do you have a booking for your stay with us?",
      initialHindi: "स्वागत है! क्या हमारे पास आपकी बुकिंग है?",
      suggestedPrompts: [
        "はい、予約しています。(Hai, yoyaku shite imasu - Yes, I have a booking)",
        "Wi-Fiのパスワードは何ですか？(Wi-Fi no pasuwaado wa nan desu ka?)",
        "荷物を預けたいです。(Nimotsu wo azuketai desu - I want to store my bags)",
      ],
    },
  },

  restaurant: {
    title: "Dining & Ordering Food (食事と注文)",
    locationName: "一蘭ラーメン (Ichiran Ramen, Shibuya, Tokyo)",
    introTitle: "Ordering Ramen in Shibuya",
    introDesc: "Order signature dishes, request water, and ask for the bill politely.",
    dialogue: [
      {
        speaker: "Staff (店員)",
        avatar: "👨‍🍳",
        role: "agent",
        text: "いらっしゃいませ！何名様ですか？ご注文はお決まりですか？",
        reading: "Irasshaimase! Nan-mei sama desu ka? Go-chuumon wa okimari desu ka?",
        english: "Welcome! How many people? Have you decided on your order?",
        hindi: "स्वागत है! कितने लोग हैं? क्या आपने आर्डर तय कर लिया?",
      },
      {
        speaker: "You (Learner)",
        avatar: "🧑‍💻",
        role: "user",
        text: "一人です。ラーメンを一つとお水をください。",
        reading: "Hitori desu. Raamen wo hitotsu to o-mizu wo kudasai.",
        english: "Table for one. One ramen and water please.",
        hindi: "अकेला हूँ। एक कटोरी रेमन और पानी दीजिए।",
      },
      {
        speaker: "Staff",
        avatar: "👨‍🍳",
        role: "agent",
        text: "かしこまりました！熱いのでお気をつけください。",
        reading: "Kashikomarimashita! Atsui node o-ki wo tsukete kudasai.",
        english: "Understood! It's very hot so please be careful.",
        hindi: "समझ गया! यह बहुत गरम है, कृपया ध्यान रखिएगा।",
      },
    ],
    vocab: [
      {
        word: "水",
        reading: "Mizu / O-mizu",
        meaning: "Water",
        hindi: "पानी",
        partOfSpeech: "Noun",
        example: "お水をもう一杯ください。",
        exampleReading: "O-mizu wo mou ippai kudasai.",
        exampleMeaning: "One more glass of water, please.",
        tip: "In Japan, cold water is provided complimentary at almost all restaurants.",
      },
      {
        word: "おすすめ",
        reading: "Osusume",
        meaning: "Recommendation",
        hindi: "सुझाव / खास डिश",
        partOfSpeech: "Noun",
        example: "今日のおすすめは何ですか？",
        exampleReading: "Kyou no osusume wa nan desu ka?",
        exampleMeaning: "What is today's recommendation?",
        tip: "Great way to discover the chef's special!",
      },
      {
        word: "お会計",
        reading: "O-kaikei",
        meaning: "The bill / Check",
        hindi: "बिल / भुगतान",
        partOfSpeech: "Noun",
        example: "お会計をお願いします。",
        exampleReading: "O-kaikei wo onegaishimasu.",
        exampleMeaning: "Check, please.",
        tip: "Cross your index fingers in an 'X' to signal for the check visually.",
      },
      {
        word: "美味しい",
        reading: "Oishii",
        meaning: "Delicious / Tasty",
        hindi: "स्वादिष्ट / लज़ीज़",
        partOfSpeech: "Adjective",
        example: "とても美味しいです！",
        exampleReading: "Totemo oishii desu!",
        exampleMeaning: "It's extremely delicious!",
        tip: "Complimenting the chef with 'Oishii' brings big smiles!",
      },
      {
        word: "ごちそうさま",
        reading: "Gochisousama",
        meaning: "Thank you for the meal",
        hindi: "भोजन के लिए धन्यवाद",
        partOfSpeech: "Phrase",
        example: "ごちそうさまでした！",
        exampleReading: "Gochisousama deshita!",
        exampleMeaning: "Thank you for the delicious meal!",
        tip: "Say this when leaving the restaurant counter.",
      },
    ],
    grammar: {
      title: "Ordering Items: 〜をください (-wo kudasai)",
      pattern: "[Item] + をください",
      explanation: "Use 〜をください to order food, drinks, or items respectfully.",
      hindiExplanation: "खाना या चीज़ मंगवाने के लिए [वस्तु] + をください कहें।",
      examples: [
        { text: "お水をください。", reading: "O-mizu wo kudasai.", english: "Water, please." },
        { text: "メニューをください。", reading: "Menyuu wo kudasai.", english: "Menu, please." },
      ],
    },
    quiz: [
      {
        prompt: "How do you say 'Water, please' in Japanese?",
        hindiPrompt: "'कृपया पानी दीजिए' जापानी में कैसे कहेंगे?",
        options: ["お水をください (O-mizu wo kudasai)", "お会計です", "こんにちは", "いくらですか"],
        correctAnswer: "お水をください (O-mizu wo kudasai)",
        explanation: "「お水をください」 is the standard phrase to ask for water.",
      },
      {
        prompt: "What is the meaning of 「美味しい」(Oishii)?",
        hindiPrompt: "「美味しい」(Oishii) का क्या अर्थ है?",
        options: ["Delicious / Tasty", "Expensive", "Cold", "Spicy"],
        correctAnswer: "Delicious / Tasty",
        explanation: "Oishii means delicious.",
      },
    ],
    roleplay: {
      title: "Ramen Shop Ordering",
      role: "Shop Master",
      avatar: "👨‍🍳",
      brief: "Order a bowl of ramen, ask for extra toppings and water.",
      initialMessage: "いらっしゃい！何にしますか？",
      initialReading: "Irasshai! Nan ni shimasu ka?",
      initialTranslation: "Welcome! What will you have?",
      initialHindi: "आइए! आप क्या लेना पसंद करेंगे?",
      suggestedPrompts: [
        "ラーメンを一つください。(Raamen wo hitotsu kudasai - One ramen please)",
        "おすすめは何ですか？(Osusume wa nan desu ka? - What is recommended?)",
        "お会計をお願いします。(O-kaikei wo onegaishimasu - Bill please)",
      ],
    },
  },

  metro: {
    title: "Subway & Metro Navigation (地下鉄と電車)",
    locationName: "渋谷駅 (Shibuya Subway Station, Tokyo)",
    introTitle: "Navigating Tokyo's Yamanote & Metro",
    introDesc: "Purchase IC transit cards, locate platforms, and ask for directions.",
    dialogue: [
      {
        speaker: "Station Attendant (駅員)",
        avatar: "🚇",
        role: "agent",
        text: "どちらまで行かれますか？お手伝いしましょうか？",
        reading: "Dochira made ikaremasu ka? Otetsudai shimashou ka?",
        english: "Where are you heading? May I help you?",
        hindi: "आप कहाँ जा रहे हैं? क्या मैं आपकी सहायता करूँ?",
      },
      {
        speaker: "You (Learner)",
        avatar: "🧑‍💻",
        role: "user",
        text: "新宿駅に行きたいです。どの電車に乗ればいいですか？",
        reading: "Shinjuku-eki ni ikitai desu. Dono densha ni noreba ii desu ka?",
        english: "I want to go to Shinjuku Station. Which train should I take?",
        hindi: "मुझे शिंजुकु स्टेशन जाना है। कौन सी ट्रेन पकड़नी होगी?",
      },
      {
        speaker: "Station Attendant",
        avatar: "🚇",
        role: "agent",
        text: "2番線の山手線に乗ってください。3駅目です。",
        reading: "Ni-ban-sen no Yamanote-sen ni notte kudasai. San-eki-me desu.",
        english: "Take the Yamanote Line on platform 2. It is the 3rd stop.",
        hindi: "प्लेटफॉर्म 2 से यामानोते लाइन पकड़ें। यह तीसरा स्टॉप है।",
      },
    ],
    vocab: [
      {
        word: "駅",
        reading: "Eki",
        meaning: "Station",
        hindi: "रेलवे / मेट्रो स्टेशन",
        partOfSpeech: "Noun",
        example: "東京駅はどこですか？",
        exampleReading: "Toukyou-eki wa doko desu ka?",
        exampleMeaning: "Where is Tokyo station?",
        tip: "Suffix -eki attaches to station names, e.g., Shibuya-eki.",
      },
      {
        word: "電車",
        reading: "Densha",
        meaning: "Train",
        hindi: "ट्रेन (रेलगाड़ी)",
        partOfSpeech: "Noun",
        example: "次の電車は何時ですか？",
        exampleReading: "Tsugi no densha wa nanji desu ka?",
        exampleMeaning: "What time is the next train?",
        tip: "Tokyo trains are remarkably punctual to the exact second.",
      },
      {
        word: "切符",
        reading: "Kippu",
        meaning: "Ticket",
        hindi: "टिकट",
        partOfSpeech: "Noun",
        example: "切符売り場はあそこです。",
        exampleReading: "Kippu uriba wa asoko desu.",
        exampleMeaning: "The ticket machines are over there.",
        tip: "IC Cards (Suica / Pasmo) are faster than buying paper tickets.",
      },
      {
        word: "乗り換え",
        reading: "Norikae",
        meaning: "Transfer / Change trains",
        hindi: "ट्रेन बदलना (ट्रांसफर)",
        partOfSpeech: "Noun",
        example: "ここで乗り換えます。",
        exampleReading: "Koko de norikaemasu.",
        exampleMeaning: "Transfer here.",
        tip: "Follow the colored floor lines to transfer easily.",
      },
      {
        word: "出口",
        reading: "Deguchi",
        meaning: "Exit",
        hindi: "निकास द्वार (एग्जिट)",
        partOfSpeech: "Noun",
        example: "ハチ公出口はどちらですか？",
        exampleReading: "Hachikou deguchi wa dochira desu ka?",
        exampleMeaning: "Which way is the Hachiko exit?",
        tip: "Major stations have dozens of exits; check exit maps!",
      },
    ],
    grammar: {
      title: "Asking Directions: 〜はどこですか？ (-wa doko desu ka?)",
      pattern: "[Place/Noun] + はどこですか？",
      explanation: "The most vital travel phrase to ask where any location or platform is.",
      hindiExplanation: "किसी जगह का पता पूछने के लिए [स्थान] + はどこですか？ कहें।",
      examples: [
        { text: "駅はどこですか？", reading: "Eki wa doko desu ka?", english: "Where is the station?" },
        { text: "トイレはどこですか？", reading: "Toire wa doko desu ka?", english: "Where is the restroom?" },
      ],
    },
    quiz: [
      {
        prompt: "How do you ask 'Where is the station?'",
        hindiPrompt: "'स्टेशन कहाँ है?' कैसे पूछेंगे?",
        options: ["駅はどこですか？", "駅に行きます", "電車です", "いくらですか"],
        correctAnswer: "駅はどこですか？",
        explanation: "「どこですか」 means 'Where is it?'.",
      },
      {
        prompt: "What does 「出口」(Deguchi) mean?",
        hindiPrompt: "「出口」(Deguchi) का क्या मतलब है?",
        options: ["Exit", "Entrance", "Platform", "Ticket"],
        correctAnswer: "Exit",
        explanation: "出口 means Exit.",
      },
    ],
    roleplay: {
      title: "Subway Ticket Gate",
      role: "Station Officer",
      avatar: "🚇",
      brief: "Ask how to reach your destination and check which platform to take.",
      initialMessage: "ご案内します。どちらまで行かれますか？",
      initialReading: "Go-annai shimasu. Dochira made ikaremasu ka?",
      initialTranslation: "I can guide you. Where would you like to go?",
      initialHindi: "मैं मदद कर सकता हूँ। आप कहाँ जाना चाहते हैं?",
      suggestedPrompts: [
        "東京駅に行きたいです。(Toukyou-eki ni ikitai desu - I want to go to Tokyo Station)",
        "何番線ですか？(Nan-ban-sen desu ka? - Which platform?)",
        "Suicaカードはチャージできますか？(Can I top up my Suica card?)",
      ],
    },
  },

  shopping: {
    title: "Shopping & Souvenirs (買い物とお土産)",
    locationName: "秋葉原電気街 (Akihabara Shopping District, Tokyo)",
    introTitle: "Shopping in Akihabara",
    introDesc: "Inquire about prices, tax-free deductions, and try on clothing.",
    dialogue: [
      {
        speaker: "Clerk (店員)",
        avatar: "🛍️",
        role: "agent",
        text: "いらっしゃいませ！何かお探しですか？",
        reading: "Irasshaimase! Nanika o-sagashi desu ka?",
        english: "Welcome! Are you looking for anything?",
        hindi: "स्वागत है! क्या आप कुछ ढूंढ रहे हैं?",
      },
      {
        speaker: "You (Learner)",
        avatar: "🧑‍💻",
        role: "user",
        text: "これはいくらですか？免税はできますか？",
        reading: "Kore wa ikura desu ka? Menzei wa dekimasu ka?",
        english: "How much is this? Is tax-free available?",
        hindi: "यह कितने का है? क्या टैक्स-फ्री छूट मिल सकती है?",
      },
      {
        speaker: "Clerk",
        avatar: "🛍️",
        role: "agent",
        text: "はい！5,000円以上で免税になります。パスポートをお見せください。",
        reading: "Hai! Go-sen en ijou de menzei ni narimasu. Pasupooto wo omise kudasai.",
        english: "Yes! Over 5,000 yen is tax-free. Please show your passport.",
        hindi: "हाँ! 5,000 येन से अधिक पर टैक्स-फ्री है। कृपया पासपोर्ट दिखाएं।",
      },
    ],
    vocab: [
      {
        word: "いくら",
        reading: "Ikura",
        meaning: "How much (price)",
        hindi: "कितने का / क्या कीमत",
        partOfSpeech: "Question Word",
        example: "これはいくらですか？",
        exampleReading: "Kore wa ikura desu ka?",
        exampleMeaning: "How much is this?",
        tip: "The number one shopping phrase in Japan!",
      },
      {
        word: "免税",
        reading: "Menzei",
        meaning: "Tax-free",
        hindi: "टैक्स-फ्री छूट",
        partOfSpeech: "Noun",
        example: "免税カウンターはどこですか？",
        exampleReading: "Menzei kauntaa wa doko desu ka?",
        exampleMeaning: "Where is the tax-free counter?",
        tip: "Saves you 10% consumption tax with your passport.",
      },
      {
        word: "袋",
        reading: "Fukuro",
        meaning: "Bag (shopping bag)",
        hindi: "थैला / बैग",
        partOfSpeech: "Noun",
        example: "袋はいりません。",
        exampleReading: "Fukuro wa irimasen.",
        exampleMeaning: "I don't need a bag.",
        tip: "Plastic bags usually cost 3 to 5 yen.",
      },
      {
        word: "クレジットカード",
        reading: "Kurejitto kaado",
        meaning: "Credit Card",
        hindi: "क्रेडिट कार्ड",
        partOfSpeech: "Noun",
        example: "カードで払えますか？",
        exampleReading: "Kaado de haraemasu ka?",
        exampleMeaning: "Can I pay by card?",
        tip: "Most major stores accept Visa, Mastercard & Amex.",
      },
      {
        word: "お土産",
        reading: "Omiyage",
        meaning: "Souvenir / Gift",
        hindi: "स्मारिका / तोहफा (उपहार)",
        partOfSpeech: "Noun",
        example: "東京のお土産を買いました。",
        exampleReading: "Toukyou no omiyage wo kaimashita.",
        exampleMeaning: "I bought Tokyo souvenirs.",
        tip: "Japanese souvenir sweets are called omiyage snacks.",
      },
    ],
    grammar: {
      title: "Asking Price: これはいくらですか？ (Kore wa ikura desu ka?)",
      pattern: "これは + いくらですか？",
      explanation: "Points to an item near you to inquire its cost.",
      hindiExplanation: "किसी वस्तु का मूल्य पूछने के लिए 'यह कितने का है?' (Kore wa ikura desu ka) बोलें।",
      examples: [
        { text: "これはいくらですか？", reading: "Kore wa ikura desu ka?", english: "How much is this?" },
        { text: "あれはいくらですか？", reading: "Are wa ikura desu ka?", english: "How much is that over there?" },
      ],
    },
    quiz: [
      {
        prompt: "How do you ask 'How much is this?' in Japanese?",
        hindiPrompt: "'यह कितने का है?' जापानी में कैसे पूछेंगे?",
        options: ["これはいくらですか？", "これは水です", "ここはどこですか", "ありがとうございます"],
        correctAnswer: "これはいくらですか？",
        explanation: "「いくらですか」 is the universal price question.",
      },
      {
        prompt: "What does 「免税」(Menzei) mean?",
        hindiPrompt: "「免税」(Menzei) का क्या अर्थ है?",
        options: ["Tax-free", "Sold out", "Discount", "Cash only"],
        correctAnswer: "Tax-free",
        explanation: "Menzei means tax exemption / tax-free.",
      },
    ],
    roleplay: {
      title: "Akihabara Souvenir Counter",
      role: "Store Clerk",
      avatar: "🛍️",
      brief: "Ask the price of an anime figure or gadget and request tax exemption.",
      initialMessage: "いらっしゃいませ！お手にとってご覧くださいね。",
      initialReading: "Irasshaimase! Otetotte goran kudasai ne.",
      initialTranslation: "Welcome! Feel free to pick it up and look.",
      initialHindi: "स्वागत है! आप आराम से देख सकते हैं।",
      suggestedPrompts: [
        "これはいくらですか？(Kore wa ikura desu ka? - How much is this?)",
        "免税できますか？(Menzei dekimasu ka? - Can I get tax-free?)",
        "カードで払います。(Kaado de haraimasu - I'll pay by card)",
      ],
    },
  },

  attractions: {
    title: "Sightseeing & Temples (観光名所と寺社)",
    locationName: "浅草寺 (Senso-ji Temple, Asakusa, Tokyo)",
    introTitle: "Visiting Senso-ji Temple in Asakusa",
    introDesc: "Learn cultural etiquette, ask someone to take your photo, and buy entry tickets.",
    dialogue: [
      {
        speaker: "Local Guide / Monk",
        avatar: "⛩️",
        role: "agent",
        text: "こんにちは！浅草寺へようこそ。お参りは初めてですか？",
        reading: "Konnichiwa! Sensou-ji e youkoso. O-mairi wa hajimete desu ka?",
        english: "Hello! Welcome to Senso-ji. Is this your first time visiting?",
        hindi: "नमस्ते! सेंसो-जी मंदिर में स्वागत है। क्या आप पहली बार दर्शन कर रहे हैं?",
      },
      {
        speaker: "You (Learner)",
        avatar: "🧑‍💻",
        role: "user",
        text: "はい、初めてです！写真を撮ってもらえますか？",
        reading: "Hai, hajimete desu! Shashin wo totte moraemasu ka?",
        english: "Yes, it is my first time! Could you please take my photo?",
        hindi: "हाँ, पहली बार है! क्या आप मेरी एक फोटो खींच सकते हैं?",
      },
      {
        speaker: "Local Guide",
        avatar: "⛩️",
        role: "agent",
        text: "いいですよ！雷門の前で撮りましょう。はい、チーズ！",
        reading: "Ii desu yo! Kaminarimon no mae de torimashou. Hai, chiizu!",
        english: "Sure! Let's take it in front of Kaminarimon gate. Say cheese!",
        hindi: "ज़रूर! कामिनारिमोन गेट के सामने लेते हैं। स्माइल प्लीज!",
      },
    ],
    vocab: [
      {
        word: "写真",
        reading: "Shashin",
        meaning: "Photograph / Picture",
        hindi: "फोटो / तस्वीर",
        partOfSpeech: "Noun",
        example: "写真を撮ってもいいですか？",
        exampleReading: "Shashin wo totte mo ii desu ka?",
        exampleMeaning: "May I take a photo?",
        tip: "Notice no-photo signs (撮影禁止 - Satsuei kinshi) inside shrines.",
      },
      {
        word: "お寺",
        reading: "O-tera",
        meaning: "Buddhist Temple",
        hindi: "बौद्ध मंदिर",
        partOfSpeech: "Noun",
        example: "このお寺はとても古いです。",
        exampleReading: "Kono o-tera wa totemo furui desu.",
        exampleMeaning: "This temple is very historic and old.",
        tip: "Temples end in -ji (寺), shrines end in -jinja (神社).",
      },
      {
        word: "おみくじ",
        reading: "Omikuji",
        meaning: "Fortune paper / divination slip",
        hindi: "किस्मत की पर्ची (भाग्य पर्ची)",
        partOfSpeech: "Noun",
        example: "おみくじを引きました。大吉でした！",
        exampleReading: "Omikuji wo hikimashita. Daikichi deshita!",
        exampleMeaning: "I drew a fortune slip. It was Great Blessing!",
        tip: "Costs around 100 yen at temple grounds.",
      },
      {
        word: "入場料",
        reading: "Nyuujouryou",
        meaning: "Admission fee / Entry ticket",
        hindi: "प्रवेश शुल्क (एंट्री टिकट)",
        partOfSpeech: "Noun",
        example: "入場料はいくらですか？",
        exampleReading: "Nyuujouryou wa ikura desu ka?",
        exampleMeaning: "How much is the admission fee?",
        tip: "Senso-ji main grounds are free to enter!",
      },
      {
        word: "きれい",
        reading: "Kirei",
        meaning: "Beautiful / Pretty / Clean",
        hindi: "सुंदर / खूबसूरत",
        partOfSpeech: "Adjective",
        example: "桜がとてもきれいです。",
        exampleReading: "Sakura ga totemo kirei desu.",
        exampleMeaning: "The cherry blossoms are very beautiful.",
        tip: "One of the most used compliments in Japan.",
      },
    ],
    grammar: {
      title: "Asking for Photos: 写真を撮ってもらえますか？",
      pattern: "写真を撮って + もらえますか？",
      explanation: "Courteous way to ask friendly locals or fellow travelers to take your photo.",
      hindiExplanation: "किसी से अपनी फोटो खिंचवाने के लिए यह विनम्र वाक्य बोलें।",
      examples: [
        { text: "写真を撮ってもらえますか？", reading: "Shashin wo totte moraemasu ka?", english: "Could you take a photo for me?" },
        { text: "一緒に撮りましょう。", reading: "Issho ni torimashou.", english: "Let's take one together." },
      ],
    },
    quiz: [
      {
        prompt: "How do you politely ask someone to take your picture?",
        hindiPrompt: "किसी से फोटो खींचने का अनुरोध कैसे करेंगे?",
        options: ["写真を撮ってもらえますか？", "写真はいくらですか？", "水が好きです", "どこに行きますか"],
        correctAnswer: "写真を撮ってもらえますか？",
        explanation: "「写真を撮ってもらえますか」 is the classic polite request.",
      },
      {
        prompt: "What does 「お寺」(O-tera) mean?",
        hindiPrompt: "「お寺」(O-tera) का क्या अर्थ है?",
        options: ["Temple", "Restaurant", "Train station", "Airport"],
        correctAnswer: "Temple",
        explanation: "O-tera means Buddhist Temple.",
      },
    ],
    roleplay: {
      title: "Asakusa Senso-ji Visit",
      role: "Friendly Local",
      avatar: "⛩️",
      brief: "Ask a local to take a photo of you in front of the giant red lantern.",
      initialMessage: "こんにちは！素敵なカメラをお持ちですね。お撮りしましょうか？",
      initialReading: "Konnichiwa! Suteki na kamera wo omochi desu ne. O-tori shimashou ka?",
      initialTranslation: "Hello! You have a lovely camera. Shall I take a picture for you?",
      initialHindi: "नमस्ते! आपके पास बढ़िया कैमरा है। क्या मैं आपकी फोटो ले लूँ?",
      suggestedPrompts: [
        "はい、お願いします！(Hai, onegaishimasu! - Yes, please!)",
        "ここできれいに撮れますか？(Can we get a nice angle here?)",
        "ありがとうございます！(Arigatou gozaimasu! - Thank you very much!)",
      ],
    },
  },
};

export { japaneseModules };
export type { ModuleKey, ModuleContent };
