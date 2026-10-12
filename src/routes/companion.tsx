import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Disclaimer, PageIntro, TextArea } from "@/components/ui";
import { askCompanion } from "@/lib/companion.functions";
import { latestAssessment } from "@/lib/flags";
import { formatFa } from "@/lib/format";
import { getPathway, phaseLabel } from "@/lib/nccn";
import { cancerLabel, upcomingCheckups, useCare } from "@/lib/store";

export const Route = createFileRoute("/companion")({
  head: () => ({ meta: [{ title: "همراه هوشمند | همدم" }] }),
  component: CompanionPage,
});

const suggestions = [
  "فرق دستورالعمل NCCN با این نقشهٔ سؤال چیست؟",
  "تب در طول درمان را چطور برای بخش توضیح دهم؟",
  "واژهٔ گیرندهٔ هورمونی را بدون توصیهٔ دارو توضیح بده.",
  "حال این هفته‌ام را برای پزشک در پنج خط خلاصه کن، بدون تشخیص.",
];

function CompanionPage() {
  const profile = useCare((state) => state.profile);
  const symptoms = useCare((state) => state.symptoms);
  const checkups = useCare((state) => state.checkups);
  const visit = useCare((state) => state.visit);
  const reviews = useCare((state) => state.reviews);
  const chat = useCare((state) => state.chat);
  const addChat = useCare((state) => state.addChat);
  const clearChat = useCare((state) => state.clearChat);
  const [message, setMessage] = useState("");
  const [attach, setAttach] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setError(null);
    setMessage("");
    addChat({ role: "user", text: trimmed });
    const history = chat.slice(-6).map((turn) => ({ role: turn.role, text: turn.text }));
    try {
      const result = await askCompanion({
        data: {
          message: trimmed,
          history,
          context: attach ? buildContext() : "کاربر نخواسته زمینهٔ پرونده پیوست شود.",
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      addChat({ role: "assistant", text: result.text });
    } catch {
      setError("پرسش فرستاده نشد. دوباره تلاش کنید، یا سؤال را برای پزشک بنویسید.");
    } finally {
      setPending(false);
    }
  }

  function buildContext() {
    const assessment = latestAssessment(symptoms);
    const next = upcomingCheckups(checkups)[0];
    const latest = [...symptoms].sort((a, b) => b.date.localeCompare(a.date))[0];
    const pathway = getPathway(profile.cancerId);
    const review = [...reviews].sort((a, b) => b.date.localeCompare(a.date))[0];
    return [
      profile.demo ? "این پرونده نمونهٔ نمایشی و ساختگی است." : "پروندهٔ محلی کاربر.",
      profile.onboarded
        ? `نام: ${profile.name || "ناگفته"}. نوع ثبت‌شده: ${cancerLabel(profile)}. مرحلهٔ خوداظهار: ${phaseLabel(profile.phase)}.`
        : "پرونده کامل نشده.",
      pathway
        ? `خلاصهٔ مسیر آموزشی ${pathway.title} که بازنشر NCCN نیست: ${pathway.summary} هشدارهای همین برگه: ${pathway.redFlags.join("؛ ")}.`
        : "مسیر آموزشی انتخاب نشده.",
      `جمع‌بندی قاعدهٔ هشدار روی آخرین ثبت حال: ${assessment.title}`,
      latest
        ? `آخرین حال ${formatFa(latest.date)}: درد ${latest.pain}، خستگی ${latest.fatigue}، تهوع ${latest.nausea}. یادداشت: ${latest.note || "ندارد"}`
        : "حال ثبت نشده.",
      review ? `آخرین چکاپ ${formatFa(review.date)} با درد ${review.pain}. یادداشت: ${review.note || "ندارد"}` : "",
      next ? `نوبت بعدی: ${next.title} در ${formatFa(next.date)}` : "نوبت آینده ثبت نشده.",
      visit.questions ? `سؤال‌های پیش‌ویزیت: ${visit.questions}` : "",
    ]
      .filter(Boolean)
      .join("\n")
      .slice(0, 1800);
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-5">
      <PageIntro
        kicker="همراه هوشمند"
        title="سؤال آموزشی بپرسید، نه تشخیص."
        lede="نسخهٔ دوم می‌تواند نقشهٔ مسیر را ساده کند. پاسخ مدل ممکن است اشتباه باشد و دستورالعمل NCCN نیست. علامت فوری را به چت نسپارید."
      />
      <Disclaimer />
      <label className="flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={attach}
          onChange={(event) => setAttach(event.target.checked)}
          className="size-4 accent-cypress"
        />
        خلاصهٔ پروندهٔ همین دستگاه به سؤال پیوست شود
      </label>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            disabled={pending}
            onClick={() => void send(item)}
            className="rounded-full border border-line bg-surface px-3 py-2 text-start text-sm leading-6"
          >
            {item}
          </button>
        ))}
      </div>
      <ol className="grid gap-4">
        {chat.map((turn) => (
          <li key={turn.id} className="border-s-2 border-line ps-4">
            <p className="text-xs font-semibold text-copper">{turn.role === "user" ? "شما" : "همدم"}</p>
            <p className="mt-1 whitespace-pre-wrap leading-8">{turn.text}</p>
          </li>
        ))}
        {pending ? <li className="text-sm text-muted">در حال نوشتن پاسخ…</li> : null}
      </ol>
      {error ? <p className="rounded-xl bg-copper-soft px-4 py-3 text-sm leading-7 text-copper">{error}</p> : null}
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(message);
        }}
      >
        <TextArea
          value={message}
          maxLength={1200}
          placeholder="مثلاً: پرتودرمانی با شیمی‌درمانی چه فرقی دارد؟"
          onChange={(event) => setMessage(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending || !message.trim()}>
            پرسیدن
          </Button>
          {chat.length ? (
            <Button tone="quiet" onClick={clearChat}>
              پاک کردن گفتگو
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
