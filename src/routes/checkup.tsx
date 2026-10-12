import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Disclaimer, Field, PageIntro, Select, TextArea, TextInput } from "@/components/ui";
import { LevelChip } from "@/components/shell";
import { askCompanion } from "@/lib/companion.functions";
import { assessReview } from "@/lib/flags";
import { faNum, todayISO } from "@/lib/format";
import { getPathway, phaseLabel, phases, stagesFor } from "@/lib/nccn";
import { cancerOptions, useCare, type CarePhase } from "@/lib/store";

export const Route = createFileRoute("/checkup")({
  head: () => ({ meta: [{ title: "چکاپ آموزشی | همدم" }] }),
  component: CheckupPage,
});

const flagOptions = [
  ["fever", "تب یا لرز"],
  ["breath", "تنگی نفس تازه"],
  ["chest", "درد قفسه سینه"],
  ["bleeding", "خونریزی غیرمعمول"],
  ["vomiting", "استفراغ مهارنشده"],
  ["confusion", "گیجی یا غش"],
  ["neuro", "ضعف یک‌طرفه یا اختلال گفتار"],
  ["headache", "سردرد ناگهانی شدید"],
] as const;

function CheckupPage() {
  const profile = useCare((state) => state.profile);
  const addReview = useCare((state) => state.addReview);
  const addSymptom = useCare((state) => state.addSymptom);
  const addVital = useCare((state) => state.addVital);
  const addChat = useCare((state) => state.addChat);
  const saveProfile = useCare((state) => state.saveProfile);
  const [cancerId, setCancerId] = useState(getPathway(profile.cancerId)?.slug ?? "breast");
  const [phase, setPhase] = useState<CarePhase>(profile.phase || "unsure");
  const synced = useRef(profile.onboarded);
  const [pain, setPain] = useState(0);
  const [temp, setTemp] = useState("");
  const [spo2, setSpo2] = useState("");
  const [pulse, setPulse] = useState("");
  const [flags, setFlags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const pathway = getPathway(cancerId);
  const assessment = assessReview({ pain, temp, spo2, pulse, flags });
  const stages = pathway ? stagesFor(pathway, phase) : [];

  useEffect(() => {
    if (synced.current || !profile.onboarded) return;
    synced.current = true;
    const slug = getPathway(profile.cancerId)?.slug;
    if (slug) setCancerId(slug);
    setPhase(profile.phase);
  }, [profile]);

  function toggle(id: string) {
    setFlags((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setDone(false);
  }

  function save() {
    if (!pathway) return;
    addReview({
      date: todayISO(),
      cancerId: pathway.slug,
      phase,
      pain,
      temp,
      spo2,
      pulse,
      flags,
      note,
    });
    addSymptom({
      date: todayISO(),
      pain,
      fatigue: 0,
      nausea: 0,
      appetite: 7,
      mood: 5,
      fever: flags.includes("fever"),
      breath: flags.includes("breath"),
      bleeding: flags.includes("bleeding"),
      vomiting: flags.includes("vomiting"),
      confusion: flags.includes("confusion") || flags.includes("neuro"),
      weight: "stable",
      note: note.trim() || "ثبت‌شده از چکاپ آموزشی.",
    });
    if (temp.trim() || spo2.trim() || pulse.trim()) {
      addVital({ date: todayISO(), temp, spo2, pulse, note: note.trim() });
    }
    if (profile.onboarded) {
      saveProfile({ ...profile, cancerId: pathway.slug, phase });
    }
    setDone(true);
    toast.success("چکاپ روی همین دستگاه ماند");
  }

  async function explain() {
    if (!pathway || pending) return;
    setPending(true);
    setAiError(null);
    const questions = stages.flatMap((stage) => stage.questions).slice(0, 4);
    const prompt = [
      "این جمع‌بندی چکاپ آموزشی را برای پزشک در پنج خط بنویس. تشخیص نده.",
      `نوع: ${pathway.title}. مرحلهٔ خوداظهار: ${phaseLabel(phase)}.`,
      `جمع‌بندی قاعده: ${assessment.title}. دلایل: ${assessment.reasons.join(" ")}`,
      note ? `یادداشت بیمار: ${note}` : "",
      `سؤال‌های آماده: ${questions.join(" / ")}`,
    ]
      .filter(Boolean)
      .join("\n");
    addChat({ role: "user", text: prompt });
    try {
      const result = await askCompanion({
        data: {
          message: prompt,
          history: [],
          context: `مسیر آموزشی ${pathway.title}. ${pathway.summary} هشدارها: ${pathway.redFlags.join("؛ ")}`,
        },
      });
      if (!result.ok) {
        setAiError(result.error);
        return;
      }
      addChat({ role: "assistant", text: result.text });
      toast.success("متن در همراه هوشمند ذخیره شد");
    } catch {
      setAiError("ارتباط برقرار نشد. سؤال‌ها را از فرم پیش‌ویزیت بخوانید.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-6">
      <PageIntro
        kicker="چکاپ آموزشی"
        title="حال امروز را کنار نقشهٔ مسیر بگذارید."
        lede="این چکاپ سرطان را تشخیص نمی‌دهد و متاستاز را پیش‌بینی نمی‌کند. قاعده‌اش شفاف است: فقط علامت، دما، اکسیژن و دردی که خودتان وارد می‌کنید."
      />
      <Disclaimer />
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="مسیر گفتگو">
            <Select
              value={cancerId}
              onChange={(event) => {
                setCancerId(event.target.value);
                setDone(false);
              }}
            >
              {cancerOptions
                .filter((item) => getPathway(item.id))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="کجای مسیر هستید؟">
            <Select
              value={phase}
              onChange={(event) => {
                setPhase(event.target.value as CarePhase);
                setDone(false);
              }}
            >
              {phases.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <label className="mt-5 block">
          <span className="flex items-baseline justify-between text-sm font-medium">
            درد الان
            <span className="tabular-nums text-cypress">{faNum(pain)}</span>
          </span>
          <input
            type="range"
            min={0}
            max={10}
            value={pain}
            onChange={(event) => {
              setPain(Number(event.target.value));
              setDone(false);
            }}
            className="mt-3 w-full accent-cypress"
          />
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="دما" hint="اگر گرفتید">
            <TextInput
              inputMode="decimal"
              value={temp}
              placeholder="۳۶٫۸"
              onChange={(event) => {
                setTemp(event.target.value);
                setDone(false);
              }}
            />
          </Field>
          <Field label="اکسیژن" hint="پالس‌اکسی‌متر خانگی">
            <TextInput
              inputMode="numeric"
              value={spo2}
              placeholder="۹۷"
              onChange={(event) => {
                setSpo2(event.target.value);
                setDone(false);
              }}
            />
          </Field>
          <Field label="ضربان">
            <TextInput
              inputMode="numeric"
              value={pulse}
              placeholder="۸۰"
              onChange={(event) => {
                setPulse(event.target.value);
                setDone(false);
              }}
            />
          </Field>
        </div>
        <fieldset className="mt-4">
          <legend className="text-sm font-medium">اگر همین حالا هست</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {flagOptions.map(([id, label]) => (
              <label key={id} className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3 text-sm">
                <input
                  type="checkbox"
                  checked={flags.includes(id)}
                  onChange={() => toggle(id)}
                  className="size-4 accent-cypress"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-4">
          <Field label="یک خط برای پزشک">
            <TextArea
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setDone(false);
              }}
            />
          </Field>
        </div>
        <div className="mt-4 rounded-xl bg-paper px-4 py-3">
          <LevelChip level={assessment.level} />
          <p className="mt-2 font-semibold">{assessment.title}</p>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-muted">
            {assessment.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={save}>ثبت چکاپ</Button>
          <Button tone="quiet" disabled={pending} onClick={() => void explain()}>
            {pending ? "در حال نوشتن…" : "پنج خط برای پزشک"}
          </Button>
        </div>
        {aiError ? <p className="mt-3 text-sm leading-7 text-copper">{aiError}</p> : null}
        {done ? (
          <p className="mt-3 text-sm text-cypress">
            در دفتر پیگیری هم نشست.{" "}
            <Link to="/companion" className="font-semibold underline">
              متن همراه هوشمند
            </Link>
          </p>
        ) : null}
      </Card>

      {pathway ? (
        <Card>
          <h2 className="text-lg font-bold">برای ویزیت {pathway.title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            این‌ها توصیهٔ درمانی نیستند. سؤال‌هایی‌اند که در مرحلهٔ «{phaseLabel(phase)}» معمولاً جا می‌مانند.
          </p>
          <ul className="mt-4 grid gap-2 text-sm leading-7">
            {stages.flatMap((stage) => stage.questions).map((item) => (
              <li key={item} className="rounded-xl border border-line px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <Link to="/nccn/$slug" params={{ slug: pathway.slug }} className="mt-4 inline-block text-sm font-semibold text-cypress">
            شرح همین مسیر
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
