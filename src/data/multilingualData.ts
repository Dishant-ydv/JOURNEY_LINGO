import {
  JourneyLocation,
  LessonData,
  RoleplayScenario,
  VocabWord,
} from "../types";

export interface SupportedLanguage {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  city: string;
  country: string;
  bcp47: string;
  voiceCode: string;
  accentColor: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: "japanese",
    name: "Japanese (日本語)",
    nativeName: "日本語",
    flag: "🇯🇵",
    city: "Tokyo",
    country: "Japan",
    bcp47: "ja-JP",
    voiceCode: "ja-JP",
    accentColor: "rose",
  },
  {
    id: "spanish",
    name: "Spanish (Español)",
    nativeName: "Español",
    flag: "🇪🇸",
    city: "Madrid",
    country: "Spain",
    bcp47: "es-ES",
    voiceCode: "es-ES",
    accentColor: "amber",
  },
  {
    id: "french",
    name: "French (Français)",
    nativeName: "Français",
    flag: "🇫🇷",
    city: "Paris",
    country: "France",
    bcp47: "fr-FR",
    voiceCode: "fr-FR",
    accentColor: "blue",
  },
  {
    id: "korean",
    name: "Korean (한국어)",
    nativeName: "한국어",
    flag: "🇰🇷",
    city: "Seoul",
    country: "South Korea",
    bcp47: "ko-KR",
    voiceCode: "ko-KR",
    accentColor: "indigo",
  },
  {
    id: "german",
    name: "German (Deutsch)",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    city: "Berlin",
    country: "Germany",
    bcp47: "de-DE",
    voiceCode: "de-DE",
    accentColor: "emerald",
  },
  {
    id: "italian",
    name: "Italian (Italiano)",
    nativeName: "Italiano",
    flag: "🇮🇹",
    city: "Rome",
    country: "Italy",
    bcp47: "it-IT",
    voiceCode: "it-IT",
    accentColor: "teal",
  },
];

export function normalizeLangId(langStr: string): string {
  const l = (langStr || "").toLowerCase();
  if (l.includes("japan") || l.includes("nihon") || l.includes("ja")) return "japanese";
  if (l.includes("span") || l.includes("español") || l.includes("es")) return "spanish";
  if (l.includes("french") || l.includes("français") || l.includes("fr")) return "french";
  if (l.includes("korean") || l.includes("한국") || l.includes("ko")) return "korean";
  if (l.includes("german") || l.includes("deutsch") || l.includes("de")) return "german";
  if (l.includes("italian") || l.includes("italiano") || l.includes("it")) return "italian";
  return "japanese";
}

export function getLanguageMeta(langStr: string): SupportedLanguage {
  const id = normalizeLangId(langStr);
  return (
    SUPPORTED_LANGUAGES.find((l) => l.id === id) || SUPPORTED_LANGUAGES[0]
  );
}

// Module IDs: "airport" | "hotel" | "restaurant" | "metro" | "shopping" | "attractions"

export const MODULE_DEFINITIONS = [
  { id: "airport", name: "Airport & Immigration", icon: "Plane", order: 1 },
  { id: "hotel", name: "Hotel & Stay", icon: "Building2", order: 2 },
  { id: "restaurant", name: "Restaurant & Food", icon: "Utensils", order: 3 },
  { id: "metro", name: "Metro & Transit", icon: "Train", order: 4 },
  { id: "shopping", name: "Shopping & Markets", icon: "ShoppingBag", order: 5 },
  { id: "attractions", name: "Sights & Landmarks", icon: "Landmark", order: 6 },
];

// Helper to generate JourneyLocation list for any language
export function getLocationsForLanguage(langStr: string): JourneyLocation[] {
  const meta = getLanguageMeta(langStr);
  const langId = meta.id;

  const names: Record<string, Record<string, string>> = {
    japanese: {
      airport: "成田国際空港 (Narita Airport)",
      hotel: "サクラホテル (Sakura Hotel)",
      restaurant: "一蘭ラーメン (Ichiran Ramen)",
      metro: "渋谷地下鉄駅 (Shibuya Metro)",
      shopping: "秋葉原電気街 (Akihabara Mall)",
      attractions: "浅草寺 (Senso-ji Temple)",
    },
    spanish: {
      airport: "Aeropuerto Barajas Madrid",
      hotel: "Hotel Gran Vía Madrid",
      restaurant: "Bar de Tapas & Paella",
      metro: "Metro de Madrid - Sol",
      shopping: "Mercado San Miguel",
      attractions: "Plaza Mayor & El Prado",
    },
    french: {
      airport: "Aéroport Charles de Gaulle",
      hotel: "Hôtel Le Marais Paris",
      restaurant: "Bistro & Boulangerie",
      metro: "Métro Parisien - Châtelet",
      shopping: "Galeries & Boutiques",
      attractions: "Tour Eiffel & Musée Louvre",
    },
    korean: {
      airport: "인천국제공항 (Incheon Airport)",
      hotel: "강남 스테이 호텔 (Gangnam Hotel)",
      restaurant: "삼겹살 & 한국 식당 (K-BBQ)",
      metro: "서울 지하철 2호선 (Seoul Metro)",
      shopping: "명동 쇼핑 거리 (Myeongdong)",
      attractions: "경복궁 (Gyeongbok Palace)",
    },
    german: {
      airport: "Flughafen Berlin Brandenburg",
      hotel: "Hotel Mitte Berlin",
      restaurant: "Berliner Wirtshaus & Cafe",
      metro: "U-Bahn & S-Bahn Alexanderplatz",
      shopping: "Kurfürstendamm Mall",
      attractions: "Brandenburger Tor",
    },
    italian: {
      airport: "Aeroporto Fiumicino Roma",
      hotel: "Albergo Piazza Navona",
      restaurant: "Trattoria & Pizzeria",
      metro: "Metro di Roma - Termini",
      shopping: "Via del Corso & Negozi",
      attractions: "Colosseo & Fontana di Trevi",
    },
  };

  const currentNames = names[langId] || names.japanese;

  return [
    {
      id: "airport",
      order: 1,
      name: "Airport",
      japaneseName: currentNames.airport,
      iconName: "Plane",
      status: "completed",
      description: `Arrivals, passport control, and airport express in ${meta.city}.`,
      completedMissions: 3,
      totalMissions: 3,
      tag: "Passed with Honors",
    },
    {
      id: "hotel",
      order: 2,
      name: "Hotel",
      japaneseName: currentNames.hotel,
      iconName: "Building2",
      status: "in_progress",
      description: `Checking in, requesting Wi-Fi, key cards, and luggage storage.`,
      completedMissions: 3,
      totalMissions: 5,
      tag: "Active Mission",
    },
    {
      id: "restaurant",
      order: 3,
      name: "Restaurant",
      japaneseName: currentNames.restaurant,
      iconName: "Utensils",
      status: "in_progress",
      description: `Ordering signature cuisine, drinks, asking for water, and paying the bill.`,
      completedMissions: 2,
      totalMissions: 4,
      tag: "High Priority",
    },
    {
      id: "metro",
      order: 4,
      name: "Metro & Transit",
      japaneseName: currentNames.metro,
      iconName: "Train",
      status: "in_progress",
      description: `Buying tickets / transit cards, asking directions, and transfer stations.`,
      completedMissions: 1,
      totalMissions: 3,
      tag: "Transit Ready",
    },
    {
      id: "shopping",
      order: 5,
      name: "Shopping & Mall",
      japaneseName: currentNames.shopping,
      iconName: "ShoppingBag",
      status: "in_progress",
      description: `Asking prices, checking sizes, tax-free deductions, and card payment.`,
      completedMissions: 0,
      totalMissions: 4,
      tag: "Explore",
    },
    {
      id: "attractions",
      order: 6,
      name: "Attractions & Temples",
      japaneseName: currentNames.attractions,
      iconName: "Landmark",
      status: "in_progress",
      description: `Visiting iconic historical monuments, buying entry tickets, and asking for photos.`,
      completedMissions: 0,
      totalMissions: 4,
      tag: "Cultural Wonder",
    },
  ];
}
