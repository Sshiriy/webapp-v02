import type { Symptom } from "@/lib/store";

export type Level = "urgent" | "soon" | "steady" | "empty";

export type Assessment = {
  level: Level;
  title: string;
  reasons: string[];
};

const copy: Record<Level, string> = {
  urgent: "امروز با تیم درمان تماس بگیرید",
  soon: "برای ویزیت نزدیک آماده شود",
  steady: "در محدودهٔ پیگیری معمول این ثبت",
  empty: "هنوز حالی ثبت نشده است",
};

export function assessSymptom(symptom: Symptom): Assessment {
  const urgent: string[] = [];
  if (symptom.fever) {
    urgent.push(
      "تب علامت خورده است. در بسیاری از برنامه‌های شیمی‌درمانی، تب دلیل تماس همان روز است؛ آستانهٔ دقیق را از تیم خودتان بپرسید.",
    );
  }
  if (symptom.breath) urgent.push("تنگی نفس یا سختی تنفس ثبت شده است.");
  if (symptom.bleeding) urgent.push("خونریزی غیرمعمول ثبت شده است.");
  if (symptom.vomiting) urgent.push("استفراغ شدید یا مهارنشده ثبت شده است.");
  if (symptom.confusion) urgent.push("گیجی، غش یا کاهش هوشیاری ثبت شده است.");
  if (symptom.pain >= 8) urgent.push("شدت درد ۸ یا بالاتر است.");
  if (urgent.length) return { level: "urgent", title: copy.urgent, reasons: urgent };

  const soon: string[] = [];
  if (symptom.pain >= 5) {
    soon.push("درد قابل‌توجه است. اگر رو به افزایش باشد زودتر از نوبت خبر دهید.");
  }
  if (symptom.nausea >= 7) soon.push("تهوع بالا ثبت شده است.");
  if (symptom.fatigue >= 8) soon.push("خستگی خیلی شدید ثبت شده است.");
  if (symptom.appetite <= 2) soon.push("اشتها خیلی کم شده است.");
  if (symptom.mood <= 2) {
    soon.push("حال روحی خیلی پایین است. حمایت روانی بخشی از درمان است، نه حاشیهٔ آن.");
  }
  if (symptom.weight === "down") {
    soon.push("کاهش وزن علامت خورده است. اگر عدد کیلو را دارید، همان را به پزشک بگویید.");
  }
  if (soon.length) return { level: "soon", title: copy.soon, reasons: soon };

  return {
    level: "steady",
    title: copy.steady,
    reasons: [
      "در این ثبت، مورد فوری‌ای که خودتان علامت زده باشید دیده نمی‌شود. این به معنی بی‌خطر بودن قطعی نیست.",
    ],
  };
}

export function latestAssessment(symptoms: Symptom[]): Assessment {
  if (!symptoms.length) {
    return {
      level: "empty",
      title: copy.empty,
      reasons: ["با ثبت حال امروز، قواعد هشدار چیزی برای گفتن پیدا می‌کنند."],
    };
  }
  const latest = [...symptoms].sort((a, b) => b.date.localeCompare(a.date))[0];
  return assessSymptom(latest);
}

export function trendNote(symptoms: Symptom[]) {
  if (symptoms.length < 2) return null;
  const ordered = [...symptoms].sort((a, b) => b.date.localeCompare(a.date));
  const [latest, previous] = ordered;
  if (!latest || !previous || latest.date === previous.date) return null;
  if (latest.pain - previous.pain >= 2) {
    return "درد نسبت به ثبت قبلی دست‌کم دو درجه بیشتر شده است.";
  }
  if (previous.pain - latest.pain >= 2) {
    return "درد نسبت به ثبت قبلی کمتر شده است.";
  }
  return null;
}

const reviewCopy: Record<string, string> = {
  fever: "تب یا لرز علامت خورده است. در بسیاری از برنامه‌های داروهای شیمی‌درمانی این تماس همان روز است.",
  breath: "تنگی نفس تازه ثبت شده است.",
  chest: "درد قفسهٔ سینه ثبت شده است.",
  bleeding: "خونریزی غیرمعمول ثبت شده است.",
  vomiting: "استفراغ شدید یا مهارنشده ثبت شده است.",
  confusion: "گیجی، غش یا کاهش هوشیاری ثبت شده است.",
  neuro: "ضعف یک‌طرفه، اختلال گفتار یا بینایی ثبت شده است. این را به تماس فوری بسپارید.",
  headache: "سردرد ناگهانی و شدید ثبت شده است.",
};

function readNumber(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function assessReview(input: {
  pain: number;
  temp: string;
  spo2: string;
  pulse: string;
  flags: string[];
}): Assessment {
  const urgent: string[] = [];
  for (const flag of input.flags) {
    const line = reviewCopy[flag];
    if (line) urgent.push(line);
  }
  if (input.pain >= 8) urgent.push("شدت درد ۸ یا بالاتر است.");
  const temp = readNumber(input.temp);
  if (temp !== null && temp >= 38) {
    urgent.push("دمای ۳۸ یا بالاتر ثبت شده است. آستانهٔ دقیق بخش خودتان بر این عدد مقدم است.");
  }
  const spo2 = readNumber(input.spo2);
  if (spo2 !== null && spo2 >= 50 && spo2 < 92) {
    urgent.push("اشباع اکسیژن زیر ۹۲ ثبت شده است. انگشت سرد عدد را خراب می‌کند، ولی این عدد یا تنگی نفس تماس همان روز می‌خواهد.");
  }
  const pulse = readNumber(input.pulse);
  if (pulse !== null && pulse >= 30 && pulse <= 220 && (pulse >= 150 || pulse < 45)) {
    urgent.push("ضربان خیلی تند یا خیلی کند ثبت شده است. اگر با سرگیجه یا تنگی نفس همراه است معطل نکنید.");
  }
  if (urgent.length) return { level: "urgent", title: copy.urgent, reasons: urgent };

  const soon: string[] = [];
  if (input.pain >= 5) soon.push("درد قابل‌توجه است. اگر رو به افزایش باشد زودتر از نوبت خبر دهید.");
  if (temp !== null && temp >= 37.5 && temp < 38) {
    soon.push("دما کمی بالاست. اگر در پنجرهٔ شیمی‌درمانی هستید، آستانهٔ بخش را همان امروز چک کنید.");
  }
  if (spo2 !== null && spo2 >= 92 && spo2 < 95) {
    soon.push("اکسیژن مرزی ثبت شده است. حال تنفس را کنار عدد به تیم بگویید.");
  }
  if (pulse !== null && pulse >= 120 && pulse < 150) {
    soon.push("ضربان تند ثبت شده است. اگر پایدار ماند یا با تپش و تنگی نفس باشد خبر دهید.");
  }
  if (soon.length) return { level: "soon", title: copy.soon, reasons: soon };
  if (!input.flags.length && temp === null && spo2 === null && pulse === null && input.pain === 0) {
    return {
      level: "empty",
      title: "علامت فوری‌ای علامت نخورده",
      reasons: ["این جمع‌بندی فقط همین فرم است. حال واقعی‌تان اگر فرق دارد، همان را مبنا قرار دهید."],
    };
  }
  return {
    level: "steady",
    title: copy.steady,
    reasons: ["در این چکاپ، مورد فوری‌ای که خودتان علامت زده باشید دیده نمی‌شود. این بی‌خطر بودن قطعی نیست."],
  };
}
