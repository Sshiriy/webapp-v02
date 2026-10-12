import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  message: z.string().trim().min(1).max(1200),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(2000),
      }),
    )
    .max(8),
  context: z.string().max(1800),
});

const SYSTEM = `تو «همراه هوشمند همدم» هستی؛ دستیار آموزشی نسخهٔ دوم برای بیماران بیمارستان آیت‌الله رئیسی کرمانشاه.
قواعد قطعی:
- پزشک نیستی و حق تشخیص سرطان، رد سرطان، مرحله‌بندی، پیش‌بینی متاستاز، یا خواندن جواب آزمایش به‌جای پزشک را نداری.
- شروع، قطع، یا تغییر دوز دارو را توصیه نکن.
- آمار بقا، درصد خطر، نام پروتکل، و دستهٔ شواهد NCCN را از خودت نساز.
- اگر پرسیدند «NCCN برای من چه می‌گوید»، بگو دستورالعمل رسمی برای تیم درمان است، به‌روز می‌شود و این برنامه آن را بازنشر نمی‌کند. بعد فقط سؤال‌هایی پیشنهاد بده که بیمار از پزشک خودش بپرسد.
- متن مسیر پیوست‌شده آموزش بیمار است، نه نقل‌قول NCCN. از آن فراتر نرو و دارو تجویز نکن.
- اگر در پرسش یا زمینه تب، تنگی نفس، خونریزی، درد قفسه سینه، گیجی، غش، استفراغ مهارنشده، اکسیژن زیر ۹۲ یا درد بسیار شدید هست، اول و روشن بگو همین حالا با تیم درمان یا اورژانس تماس بگیرد.
- فارسی روان، کوتاه، آرام. حداکثر چند پاراگراف.
- اگر اطلاعات کافی نیست بگو این را باید از پزشک معالج پرسید.
- زمینهٔ پرونده ممکن است ناقص یا نمونهٔ نمایشی باشد؛ از آن برای تشخیص استفاده نکن.`;

const recent: number[] = [];

function allowed() {
  const now = Date.now();
  while (recent.length && now - recent[0]! > 60 * 60 * 1000) recent.shift();
  const last = recent[recent.length - 1] ?? 0;
  if (now - last < 2500) return "کمی صبر کنید و دوباره بپرسید.";
  if (recent.length >= 30) return "سقف پرسش این ساعت پر شده است. کمی بعد دوباره تلاش کنید.";
  recent.push(now);
  return null;
}

export const askCompanion = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const limited = allowed();
    if (limited) return { ok: false as const, error: limited };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false as const,
        error: "همراه هوشمند در این محیط در دسترس نیست. دفتر حال و قواعد هشدار همچنان کار می‌کنند.",
      };
    }

    const messages = [
      { role: "system", content: SYSTEM },
      {
        role: "system",
        content: `زمینهٔ محلی که کاربر اجازه داده پیوست شود. این زمینه تشخیص نیست:\n${data.context || "زمینه‌ای فرستاده نشده."}`,
      },
      ...data.history.map((turn) => ({ role: turn.role, content: turn.text })),
      { role: "user", content: data.message },
    ];

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.3,
          max_tokens: 700,
          messages,
        }),
      });

      if (!res.ok) {
        return {
          ok: false as const,
          error: "پاسخ همراه هوشمند این بار نرسید. دوباره تلاش کنید یا سؤال را برای پزشک بنویسید.",
        };
      }

      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) {
        return { ok: false as const, error: "پاسخ خالی بود. سؤال را کوتاه‌تر دوباره بپرسید." };
      }
      return { ok: true as const, text };
    } catch {
      return {
        ok: false as const,
        error: "ارتباط با همراه هوشمند برقرار نشد. قواعد هشدار دفتر حال همچنان مستقل از این بخش کار می‌کنند.",
      };
    }
  });
