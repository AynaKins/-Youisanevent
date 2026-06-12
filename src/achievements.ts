import mirrorIcon from "./assets/achievement-mirror.webp";
import catIcon from "./assets/achievement-cat.webp";
import mangaIcon from "./assets/achievement-manga.webp";
import starIcon from "./assets/achievement-star.webp";
import teaIcon from "./assets/achievement-tea.webp";
import bellIcon from "./assets/achievement-bell.webp";
import circuitIcon from "./assets/achievement-circuit.webp";
import blanketIcon from "./assets/achievement-blanket.webp";
import crownIcon from "./assets/achievement-crown.webp";

export type AchievementId =
  | "first-light"
  | "mirror-truth"
  | "mood-carry"
  | "chapter-18"
  | "night-witness"
  | "quiet-bell"
  | "tea-nearby"
  | "circuit-heart"
  | "soft-crown";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  rarity: "обычная магия" | "редкая" | "легендарная";
};

export const achievements: Achievement[] = [
  { id: "first-light", title: "Источник света", description: "Мир заметил, что ты здесь.", icon: starIcon, rarity: "редкая" },
  { id: "mirror-truth", title: "Без фильтра", description: "Принять ещё одну красивую версию себя.", icon: mirrorIcon, rarity: "легендарная" },
  { id: "mood-carry", title: "Вайб восстановлен", description: "Минус вайб отправлен на респаун.", icon: starIcon, rarity: "легендарная" },
  { id: "chapter-18", title: "Не дропнута", description: "Собрана глава, которую хочется перечитать.", icon: mangaIcon, rarity: "редкая" },
  { id: "night-witness", title: "Ночной свидетель", description: "Чёрная кошка подтверждает: всё правда.", icon: catIcon, rarity: "легендарная" },
  { id: "quiet-bell", title: "Режим «не беспокоить»", description: "Шум выключен без чувства вины.", icon: bellIcon, rarity: "обычная магия" },
  { id: "tea-nearby", title: "Тёплый бафф", description: "Чай рядом. Требований рядом нет.", icon: teaIcon, rarity: "обычная магия" },
  { id: "circuit-heart", title: "Схема сошлась", description: "Хаос превратился в светящуюся реликвию.", icon: circuitIcon, rarity: "редкая" },
  { id: "soft-crown", title: "Главная героиня", description: "Открыта комната всех доказательств.", icon: crownIcon, rarity: "легендарная" },
];

export const achievementById = Object.fromEntries(achievements.map((achievement) => [achievement.id, achievement])) as Record<AchievementId, Achievement>;
