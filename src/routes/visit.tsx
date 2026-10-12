import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Disclaimer, Field, PageIntro, TextArea } from "@/components/ui";
import { faNum, formatFa, todayISO } from "@/lib/format";
import { cancerLabel, useCare } from "@/lib/store";

export const Route = createFileRoute("/visit")({
  head: () => ({ meta: [{ title: "پیش از ویزیت | همدم" }] }),
  component: VisitPage,
});

function VisitPage() {
  const profile = useCare((state) => state.profile);
  const saved = useCare((state) => state.visit);
  const setVisit = useCare((state) => state.setVisit);
  const [form, setForm] = useState(saved);

  useEffect(() => {
    setForm(saved);
  }, [saved]);

  return (
    <div className="grid gap-6">
      <PageIntro
        kicker="پیش از ویزیت"
        title="قبل از اتاق پزشک، حال‌تان را مرتب کنید."
        lede="این فرم برای تیم درمان بیمارستان فرستاده نمی‌شود. روی همین دستگاه می‌ماند تا سر ویزیت از رویش بخوانید یا چاپ کنید."
      />
      <Disclaimer />
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setVisit(form);
            toast.success("فرم روی این دستگاه ذخیره شد");
          }}
        >
          <Field label="از ویزیت قبل چه عوض شده؟">
            <TextArea
              value={form.sinceLast}
              onChange={(event) => setForm({ ...form, sinceLast: event.target.value })}
            />
          </Field>
          <Field label="دارو؛ آنچه خوردم و آنچه جا افتاد">
            <TextArea value={form.meds} onChange={(event) => setForm({ ...form, meds: event.target.value })} />
          </Field>
          <Field label="علامت تازه">
            <TextArea
              value={form.newSymptoms}
              onChange={(event) => setForm({ ...form, newSymptoms: event.target.value })}
            />
          </Field>
          <Field label="سؤال‌هایی که باید بپرسم">
            <TextArea
              value={form.questions}
              onChange={(event) => setForm({ ...form, questions: event.target.value })}
            />
          </Field>
          <label className="text-sm font-medium">
            <span className="flex justify-between">
              درد الآن <span className="tabular-nums text-cypress">{faNum(form.painNow)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={10}
              value={form.painNow}
              onChange={(event) => setForm({ ...form, painNow: Number(event.target.value) })}
              className="mt-3 w-full accent-cypress"
            />
          </label>
          <label className="text-sm font-medium">
            <span className="flex justify-between">
              حال روحی <span className="tabular-nums text-cypress">{faNum(form.mood)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={10}
              value={form.mood}
              onChange={(event) => setForm({ ...form, mood: Number(event.target.value) })}
              className="mt-3 w-full accent-cypress"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit">ذخیره</Button>
            <Button tone="quiet" onClick={() => window.print()}>
              چاپ برای همراه بردن
            </Button>
          </div>
        </form>

        <Card className="h-fit">
          <p className="text-sm text-copper">برگهٔ خواندنی برای پزشک</p>
          <h2 className="mt-2 text-2xl font-extrabold">{profile.name || "بیمار"}</h2>
          <p className="mt-1 text-sm text-muted">
            {cancerLabel(profile)} · {formatFa(todayISO())}
            {profile.demo ? " · نمونهٔ نمایشی" : ""}
          </p>
          <dl className="mt-5 grid gap-4 text-sm leading-7">
            <Item term="از ویزیت قبل" text={form.sinceLast} />
            <Item term="دارو" text={form.meds} />
            <Item term="علامت تازه" text={form.newSymptoms} />
            <Item term="سؤال‌ها" text={form.questions} />
            <Item term="درد الآن" text={faNum(form.painNow)} />
            <Item term="حال روحی" text={faNum(form.mood)} />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Item({ term, text }: { term: string; text: string }) {
  return (
    <div>
      <dt className="font-semibold">{term}</dt>
      <dd className="text-muted">{text.trim() || "—"}</dd>
    </div>
  );
}
