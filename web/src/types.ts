export type ThemeId = "sakura" | "hoshizora" | "hachimitsu";

export type Destination = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type DatePlan = {
  id: string;
  date: Date;
  title: string;
  memo: string;
  destinations: Destination[];
  createdAt: Date;
  updatedAt: Date;
};

export type UserProfile = {
  displayName: string;
  coupleId?: string | null;
  themeId: ThemeId;
  createdAt: Date;
};

export type CoupleProfile = {
  id: string;
  inviteCode: string;
  memberIds: string[];
  createdAt: Date;
};

export type Route = "loading" | "setup" | "signedOut" | "pairing" | "main";
export type Tab = "calendar" | "schedule" | "settings";

export const THEMES: Record<
  ThemeId,
  { name: string; tagline: string; dark: boolean }
> = {
  sakura: { name: "さくら", tagline: "やわらかいピンクとクリーム", dark: false },
  hoshizora: { name: "ほしぞら", tagline: "深いネイビーと氷のような青", dark: true },
  hachimitsu: { name: "はちみつ", tagline: "アイボリーとテラコッタ", dark: false },
};

export function blankPlan(day = new Date()): DatePlan {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  return {
    id: crypto.randomUUID(),
    date: start,
    title: "",
    memo: "",
    destinations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function displayTitle(plan: DatePlan) {
  const t = plan.title.trim();
  return t || "デート";
}
