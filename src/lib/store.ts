import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayISO } from "@/lib/format";

export type Sex = "female" | "male" | "unspecified";
export type WeightChange = "stable" | "down" | "up";
export type CheckupKind = "visit" | "lab" | "imaging" | "infusion" | "other";
export type CarePhase = "new" | "active" | "follow" | "unsure";

export type Profile = {
  name: string;
  age: string;
  sex: Sex;
  cancerId: string;
  cancerNote: string;
  diagnosisYear: string;
  doctor: string;
  city: string;
  clinicPhone: string;
  phase: CarePhase;
  demo: boolean;
  onboarded: boolean;
};

export type FamilyMember = {
  id: string;
  relation: string;
  condition: string;
  ageAt: string;
  note: string;
};

export type Symptom = {
  id: string;
  date: string;
  pain: number;
  fatigue: number;
  nausea: number;
  appetite: number;
  mood: number;
  fever: boolean;
  breath: boolean;
  bleeding: boolean;
  vomiting: boolean;
  confusion: boolean;
  weight: WeightChange;
  note: string;
};

export type Checkup = {
  id: string;
  title: string;
  date: string;
  kind: CheckupKind;
  place: string;
  done: boolean;
  note: string;
};

export type VisitForm = {
  sinceLast: string;
  meds: string;
  newSymptoms: string;
  questions: string;
  mood: number;
  painNow: number;
};

export type Vital = {
  id: string;
  date: string;
  spo2: string;
  pulse: string;
  temp: string;
  note: string;
};

export type Review = {
  id: string;
  date: string;
  cancerId: string;
  phase: CarePhase;
  pain: number;
  temp: string;
  spo2: string;
  pulse: string;
  flags: string[];
  note: string;
};

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export const cancerOptions = [
  { id: "unknown", label: "هنوز مشخص نیست" },
  { id: "breast", label: "پستان" },
  { id: "colorectal", label: "روده بزرگ" },
  { id: "lung", label: "ریه" },
  { id: "prostate", label: "پروستات" },
  { id: "liver", label: "کبد" },
  { id: "skin", label: "پوست" },
  { id: "other", label: "نوع دیگر" },
] as const;

export const checkupKinds: { id: CheckupKind; label: string }[] = [
  { id: "visit", label: "ویزیت پزشک" },
  { id: "lab", label: "آزمایش" },
  { id: "imaging", label: "تصویربرداری" },
  { id: "infusion", label: "جلسهٔ درمان" },
  { id: "other", label: "سایر" },
];

export const emptyProfile: Profile = {
  name: "",
  age: "",
  sex: "unspecified",
  cancerId: "unknown",
  cancerNote: "",
  diagnosisYear: "",
  doctor: "",
  city: "کرمانشاه",
  clinicPhone: "",
  phase: "unsure",
  demo: false,
  onboarded: false,
};

export const emptyVisit: VisitForm = {
  sinceLast: "",
  meds: "",
  newSymptoms: "",
  questions: "",
  mood: 5,
  painNow: 0,
};

type CareState = {
  profile: Profile;
  family: FamilyMember[];
  symptoms: Symptom[];
  checkups: Checkup[];
  visit: VisitForm;
  vitals: Vital[];
  reviews: Review[];
  chat: ChatTurn[];
  saveProfile: (profile: Profile) => void;
  addFamily: (member: Omit<FamilyMember, "id">) => void;
  removeFamily: (id: string) => void;
  addSymptom: (symptom: Omit<Symptom, "id">) => void;
  removeSymptom: (id: string) => void;
  addCheckup: (checkup: Omit<Checkup, "id">) => void;
  updateCheckup: (id: string, patch: Partial<Checkup>) => void;
  removeCheckup: (id: string) => void;
  setVisit: (visit: VisitForm) => void;
  addVital: (vital: Omit<Vital, "id">) => void;
  removeVital: (id: string) => void;
  addReview: (review: Omit<Review, "id">) => void;
  addChat: (turn: Omit<ChatTurn, "id">) => void;
  clearChat: () => void;
  loadDemo: () => void;
  clearAll: () => void;
};

function uid() {
  return crypto.randomUUID();
}

function shiftISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${day}`;
}

const initial = {
  profile: emptyProfile,
  family: [] as FamilyMember[],
  symptoms: [] as Symptom[],
  checkups: [] as Checkup[],
  visit: emptyVisit,
  vitals: [] as Vital[],
  reviews: [] as Review[],
  chat: [] as ChatTurn[],
};

export const useCare = create<CareState>()(
  persist(
    (set) => ({
      ...initial,
      saveProfile: (profile) => set({ profile }),
      addFamily: (member) =>
        set((state) => ({ family: [{ ...member, id: uid() }, ...state.family] })),
      removeFamily: (id) =>
        set((state) => ({ family: state.family.filter((item) => item.id !== id) })),
      addSymptom: (symptom) =>
        set((state) => ({ symptoms: [{ ...symptom, id: uid() }, ...state.symptoms] })),
      removeSymptom: (id) =>
        set((state) => ({ symptoms: state.symptoms.filter((item) => item.id !== id) })),
      addCheckup: (checkup) =>
        set((state) => ({ checkups: [{ ...checkup, id: uid() }, ...state.checkups] })),
      updateCheckup: (id, patch) =>
        set((state) => ({
          checkups: state.checkups.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        })),
      removeCheckup: (id) =>
        set((state) => ({ checkups: state.checkups.filter((item) => item.id !== id) })),
      setVisit: (visit) => set({ visit }),
      addVital: (vital) =>
        set((state) => ({ vitals: [{ ...vital, id: uid() }, ...state.vitals] })),
      removeVital: (id) =>
        set((state) => ({ vitals: state.vitals.filter((item) => item.id !== id) })),
      addReview: (review) =>
        set((state) => ({ reviews: [{ ...review, id: uid() }, ...state.reviews] })),
      addChat: (turn) => set((state) => ({ chat: [...state.chat, { ...turn, id: uid() }] })),
      clearChat: () => set({ chat: [] }),
      loadDemo: () =>
        set({
          profile: {
            name: "سارا مرادی",
            age: "۴۶",
            sex: "female",
            cancerId: "breast",
            cancerNote: "",
            diagnosisYear: "۱۴۰۳",
            doctor: "تیم درمان بیمارستان آیت‌الله رئیسی",
            city: "کرمانشاه",
            clinicPhone: "",
            phase: "active",
            demo: true,
            onboarded: true,
          },
          family: [
            {
              id: uid(),
              relation: "مادر",
              condition: "سرطان پستان",
              ageAt: "۵۸",
              note: "نمونهٔ نمایشی؛ سابقهٔ واقعی نیست.",
            },
          ],
          symptoms: [
            {
              id: uid(),
              date: shiftISO(-10),
              pain: 3,
              fatigue: 4,
              nausea: 2,
              appetite: 7,
              mood: 6,
              fever: false,
              breath: false,
              bleeding: false,
              vomiting: false,
              confusion: false,
              weight: "stable",
              note: "روز آرام پس از جلسهٔ درمان. نمونهٔ نمایشی.",
            },
            {
              id: uid(),
              date: shiftISO(-6),
              pain: 4,
              fatigue: 6,
              nausea: 5,
              appetite: 5,
              mood: 5,
              fever: false,
              breath: false,
              bleeding: false,
              vomiting: false,
              confusion: false,
              weight: "stable",
              note: "تهوع عصرها بیشتر بود.",
            },
            {
              id: uid(),
              date: shiftISO(-1),
              pain: 6,
              fatigue: 7,
              nausea: 4,
              appetite: 4,
              mood: 4,
              fever: false,
              breath: false,
              bleeding: false,
              vomiting: false,
              confusion: false,
              weight: "down",
              note: "درد بازو کمی بیشتر شده. وزن را دقیق نسنجیده‌ام.",
            },
          ],
          checkups: [
            {
              id: uid(),
              title: "آزمایش خون پیش از جلسه",
              date: shiftISO(-4),
              kind: "lab",
              place: "آزمایشگاه بیمارستان",
              done: true,
              note: "نتیجه نزد پزشک است. این یادداشت ساختگی است.",
            },
            {
              id: uid(),
              title: "ویزیت انکولوژی",
              date: shiftISO(5),
              kind: "visit",
              place: "بیمارستان آیت‌الله رئیسی",
              done: false,
              note: "",
            },
            {
              id: uid(),
              title: "جلسهٔ درمان",
              date: shiftISO(6),
              kind: "infusion",
              place: "بخش درمان",
              done: false,
              note: "",
            },
          ],
          visit: {
            sinceLast: "خستگی عصرها بیشتر شده و آستین سمت جراحی کمی سفت است.",
            meds: "داروهای ضدتهوع را دو شب جا انداخته‌ام.",
            newSymptoms: "کاهش اشتها. تب نداشته‌ام.",
            questions: "آیا تورم بازو نیاز به مراجعهٔ جدا دارد؟ آزمایش بعدی کی است؟",
            mood: 4,
            painNow: 6,
          },
          vitals: [
            {
              id: uid(),
              date: shiftISO(-6),
              spo2: "98",
              pulse: "76",
              temp: "36.7",
              note: "عصر، در حال استراحت. نمونهٔ نمایشی.",
            },
            {
              id: uid(),
              date: shiftISO(-1),
              spo2: "97",
              pulse: "88",
              temp: "37.1",
              note: "بعد از پیاده‌روی کوتاه کمی تندتر بود.",
            },
          ],
          reviews: [
            {
              id: uid(),
              date: shiftISO(-1),
              cancerId: "breast",
              phase: "active",
              pain: 6,
              temp: "37.1",
              spo2: "97",
              pulse: "88",
              flags: [],
              note: "چکاپ آموزشی نمونه. تب واقعی نداشته‌ام.",
            },
          ],
          chat: [],
        }),
      clearAll: () => set({ ...initial, visit: { ...emptyVisit }, profile: { ...emptyProfile } }),
    }),
    { name: "hamdam-v2", skipHydration: true, partialize: (state) => ({
      profile: state.profile,
      family: state.family,
      symptoms: state.symptoms,
      checkups: state.checkups,
      visit: state.visit,
      vitals: state.vitals,
      reviews: state.reviews,
      chat: state.chat,
    }) },
  ),
);

export function cancerLabel(profile: Profile) {
  const known = cancerOptions.find((item) => item.id === profile.cancerId)?.label;
  if (profile.cancerId === "other" && profile.cancerNote.trim()) return profile.cancerNote.trim();
  return known ?? "نامشخص";
}

export function upcomingCheckups(checkups: Checkup[]) {
  const today = todayISO();
  return [...checkups]
    .filter((item) => !item.done && item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function orderedSymptoms(symptoms: Symptom[]) {
  return [...symptoms].sort((a, b) => a.date.localeCompare(b.date));
}
