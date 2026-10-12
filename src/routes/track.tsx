import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button, Card, Field, PageIntro, TextArea, TextInput, Select } from "@/components/ui";
import { LevelChip } from "@/components/shell";
import { assessReview, assessSymptom } from "@/lib/flags";
import { faNum, formatFa, formatFaShort, todayISO } from "@/lib/format";
import {
  checkupKinds,
  orderedSymptoms,
  useCare,
  type CheckupKind,
  type Symptom,
  type WeightChange,
} from "@/lib/store";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "پیگیری | همدم" }] }),
  component: TrackPage,
});

const emptyDraft = (): Omit<Symptom, "id"> => ({
  date: todayISO(),
  pain: 0,
  fatigue: 0,
  nausea: 0,
  appetite: 7,
  mood: 5,
  fever: false,
  breath: false,
  bleeding: false,
  vomiting: false,
  confusion: false,
  weight: "stable",
  note: "",
});

function TrackPage() {
  const symptoms = useCare((state) => state.symptoms);
  const checkups = useCare((state) => state.checkups);
  const addSymptom = useCare((state) => state.addSymptom);
  const removeSymptom = useCare((state) => state.removeSymptom);
  const addCheckup = useCare((state) => state.addCheckup);
  const updateCheckup = useCare((state) => state.updateCheckup);
  const removeCheckup = useCare((state) => state.removeCheckup);
  const vitals = useCare((state) => state.vitals);
  const addVital = useCare((state) => state.addVital);
  const removeVital = useCare((state) => state.removeVital);
  const [draft, setDraft] = useState(emptyDraft);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO);
  const [kind, setKind] = useState<CheckupKind>("visit");
  const [place, setPlace] = useState("بیمارستان آیت‌الله رئیسی");
  const [vDate, setVDate] = useState(todayISO);
  const [spo2, setSpo2] = useState("");
  const [pulse, setPulse] = useState("");
  const [temp, setTemp] = useState("");
  const [vNote, setVNote] = useState("");

  const chart = orderedSymptoms(symptoms).map((item) => ({
    name: formatFaShort(item.date),
    درد: item.pain,
    خستگی: item.fatigue,
    تهوع: item.nausea,
  }));

  const flags = [
    ["fever", "تب"],
    ["breath", "تنگی نفس"],
    ["bleeding", "خونریزی"],
    ["vomiting", "استفراغ شدید"],
    ["confusion", "گیجی یا غش"],
  ] as const;

  return (
    <div className="grid gap-8">
      <PageIntro
        kicker="پیگیری"
        title="دفتر حال و تقویم مراجعه."
        lede="عددها برای یادآوری سر ویزیت‌اند. اکسیژن و دمای خانگی را خودتان می‌نویسید؛ دستگاه پزشکی به برنامه وصل نیست و قاعدهٔ هشدار تشخیص نمی‌دهد."
      />

      <Card>
        <h2 className="text-lg font-bold">ثبت حال</h2>
        <form
          className="mt-4 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            addSymptom(draft);
            setDraft(emptyDraft());
            toast.success("حال امروز در پروندهٔ این دستگاه ثبت شد");
          }}
        >
          <Field label="تاریخ">
            <TextInput
              type="date"
              required
              value={draft.date}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Scale
              label="درد"
              hint="۰ یعنی ندارم، ۱۰ یعنی شدیدترین"
              value={draft.pain}
              onChange={(pain) => setDraft({ ...draft, pain })}
            />
            <Scale
              label="خستگی"
              value={draft.fatigue}
              onChange={(fatigue) => setDraft({ ...draft, fatigue })}
            />
            <Scale
              label="تهوع"
              value={draft.nausea}
              onChange={(nausea) => setDraft({ ...draft, nausea })}
            />
            <Scale
              label="اشتها"
              hint="۱۰ یعنی اشتهای همیشگی"
              value={draft.appetite}
              onChange={(appetite) => setDraft({ ...draft, appetite })}
            />
            <Scale
              label="حال روحی"
              hint="۰ خیلی پایین، ۱۰ پایدار"
              value={draft.mood}
              onChange={(mood) => setDraft({ ...draft, mood })}
            />
            <Field label="وزن از دید خودتان">
              <Select
                value={draft.weight}
                onChange={(event) =>
                  setDraft({ ...draft, weight: event.target.value as WeightChange })
                }
              >
                <option value="stable">تقریباً ثابت</option>
                <option value="down">کم شده</option>
                <option value="up">زیاد شده</option>
              </Select>
            </Field>
          </div>
          <fieldset>
            <legend className="text-sm font-medium">اگر امروز بوده، علامت بزنید</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {flags.map(([key, label]) => (
                <label key={key} className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3">
                  <input
                    type="checkbox"
                    checked={draft[key]}
                    onChange={(event) => setDraft({ ...draft, [key]: event.target.checked })}
                    className="size-4 accent-cypress"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="یادداشت آزاد" hint="محل درد، عدد تب، دارویی که جا افتاده">
            <TextArea
              value={draft.note}
              onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            />
          </Field>
          <Preview assessment={assessSymptom({ ...draft, id: "draft" })} />
          <Button type="submit">ثبت در دفتر</Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">روند ثبت‌ها</h2>
        {chart.length < 2 ? (
          <p className="mt-3 text-sm leading-7 text-muted">با دو ثبت در روزهای مختلف، نمودار درد و خستگی کشیده می‌شود.</p>
        ) : (
          <div className="mt-4 h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fill: "var(--color-muted)", fontSize: 12 }} width={28} />
                <Tooltip />
                <Line type="monotone" dataKey="درد" stroke="var(--color-copper)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="خستگی" stroke="var(--color-cypress)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="تهوع" stroke="var(--color-muted)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <ul className="mt-4 grid gap-3">
          {[...symptoms]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((item) => {
              const assessment = assessSymptom(item);
              return (
                <li key={item.id} className="rounded-xl border border-line px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{formatFa(item.date)}</p>
                    <LevelChip level={assessment.level} />
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    درد {faNum(item.pain)} · خستگی {faNum(item.fatigue)} · تهوع {faNum(item.nausea)}
                  </p>
                  {item.note ? <p className="mt-2 text-sm leading-6">{item.note}</p> : null}
                  <button
                    type="button"
                    onClick={() => removeSymptom(item.id)}
                    className="mt-2 text-sm text-copper"
                  >
                    حذف این ثبت
                  </button>
                </li>
              );
            })}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">دما، اکسیژن، ضربان</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          اگر پالس‌اکسی‌متر خانگی دارید عدد را کنار حال نفس بنویسید. انگشت سرد یا لاک ناخن عدد را خراب می‌کند.
        </p>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!spo2.trim() && !pulse.trim() && !temp.trim()) return;
            addVital({ date: vDate, spo2: spo2.trim(), pulse: pulse.trim(), temp: temp.trim(), note: vNote.trim() });
            setSpo2("");
            setPulse("");
            setTemp("");
            setVNote("");
            toast.success("علائم خانگی ثبت شد");
          }}
        >
          <Field label="تاریخ">
            <TextInput type="date" required value={vDate} onChange={(event) => setVDate(event.target.value)} />
          </Field>
          <Field label="اکسیژن">
            <TextInput inputMode="numeric" value={spo2} onChange={(event) => setSpo2(event.target.value)} placeholder="۹۷" />
          </Field>
          <Field label="ضربان">
            <TextInput inputMode="numeric" value={pulse} onChange={(event) => setPulse(event.target.value)} placeholder="۸۰" />
          </Field>
          <Field label="دما">
            <TextInput inputMode="decimal" value={temp} onChange={(event) => setTemp(event.target.value)} placeholder="۳۶.۸" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="یادداشت">
              <TextInput value={vNote} onChange={(event) => setVNote(event.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">ثبت علائم خانگی</Button>
          </div>
        </form>
        <ul className="mt-4 grid gap-2">
          {vitals.map((item) => {
            const level = assessReview({
              pain: 0,
              temp: item.temp,
              spo2: item.spo2,
              pulse: item.pulse,
              flags: [],
            });
            return (
              <li key={item.id} className="rounded-xl border border-line px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{formatFa(item.date)}</p>
                  <LevelChip level={level.level} />
                </div>
                <p className="mt-1 text-muted">
                  {item.spo2 ? `اکسیژن ${item.spo2}` : "اکسیژن —"}
                  {item.pulse ? ` · ضربان ${item.pulse}` : ""}
                  {item.temp ? ` · دما ${item.temp}` : ""}
                </p>
                {item.note ? <p className="mt-1">{item.note}</p> : null}
                <button type="button" className="mt-2 text-copper" onClick={() => removeVital(item.id)}>
                  حذف
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">تقویم پیگیری</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            addCheckup({ title: title.trim(), date, kind, place: place.trim(), done: false, note: "" });
            setTitle("");
            toast.success("به تقویم اضافه شد");
          }}
        >
          <Field label="عنوان">
            <TextInput value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="ویزیت، آزمایش، تصویربرداری" />
          </Field>
          <Field label="تاریخ">
            <TextInput type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
          </Field>
          <Field label="نوع">
            <Select value={kind} onChange={(event) => setKind(event.target.value as CheckupKind)}>
              {checkupKinds.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="محل">
            <TextInput value={place} onChange={(event) => setPlace(event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit">افزودن نوبت</Button>
          </div>
        </form>
        <ul className="mt-5 grid gap-3">
          {[...checkups]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line px-4 py-3">
                <label className="flex min-h-11 flex-1 items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(event) => updateCheckup(item.id, { done: event.target.checked })}
                    className="size-4 accent-cypress"
                  />
                  <span>
                    <span className="block font-medium">{item.title}</span>
                    <span className="text-sm text-muted">
                      {formatFa(item.date)} · {checkupKinds.find((kindItem) => kindItem.id === item.kind)?.label}
                      {item.place ? ` · ${item.place}` : ""}
                    </span>
                  </span>
                </label>
                <button type="button" onClick={() => removeCheckup(item.id)} className="text-sm text-copper">
                  حذف
                </button>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}

function Scale({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium">
        {label}
        <span className="tabular-nums text-cypress">{faNum(value)}</span>
      </span>
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-cypress"
      />
    </label>
  );
}

function Preview({ assessment }: { assessment: ReturnType<typeof assessSymptom> }) {
  return (
    <div className="rounded-xl bg-paper px-4 py-3 text-sm leading-6">
      <LevelChip level={assessment.level} />
      <p className="mt-2 font-medium">{assessment.title}</p>
    </div>
  );
}
