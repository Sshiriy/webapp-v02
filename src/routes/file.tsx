import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Field, PageIntro, Select, TextInput } from "@/components/ui";
import { cancerOptions, useCare, type CarePhase, type Profile, type Sex } from "@/lib/store";
import { phases } from "@/lib/nccn";

export const Route = createFileRoute("/file")({
  head: () => ({ meta: [{ title: "پرونده | همدم" }] }),
  component: FilePage,
});

function FilePage() {
  const profile = useCare((state) => state.profile);
  const saveProfile = useCare((state) => state.saveProfile);
  const family = useCare((state) => state.family);
  const addFamily = useCare((state) => state.addFamily);
  const removeFamily = useCare((state) => state.removeFamily);
  const clearAll = useCare((state) => state.clearAll);
  const [draft, setDraft] = useState<Profile>(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);
  const [relation, setRelation] = useState("مادر");
  const [condition, setCondition] = useState("");
  const [ageAt, setAgeAt] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="grid gap-6">
      <PageIntro
        kicker="پرونده"
        title="اطلاعاتی که فقط روی این دستگاه می‌ماند."
        lede="نسخهٔ دوم هم حساب ابری ندارد. نام، مرحلهٔ خوداظهار، سابقهٔ خانوادگی و شمارهٔ درمانگاه فقط روی همین دستگاه می‌ماند."
      />
      <Card>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            saveProfile({ ...draft, onboarded: true, demo: false });
            toast.success("پرونده ذخیره شد");
          }}
        >
          <Field label="نام و نام خانوادگی">
            <TextInput
              required
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </Field>
          <Field label="سن">
            <TextInput value={draft.age} onChange={(event) => setDraft({ ...draft, age: event.target.value })} />
          </Field>
          <Field label="جنسیت">
            <Select
              value={draft.sex}
              onChange={(event) => setDraft({ ...draft, sex: event.target.value as Sex })}
            >
              <option value="female">زن</option>
              <option value="male">مرد</option>
              <option value="unspecified">ترجیح می‌دهم نگویم</option>
            </Select>
          </Field>
          <Field label="نوع سرطان، اگر گفته شده">
            <Select
              value={draft.cancerId}
              onChange={(event) => setDraft({ ...draft, cancerId: event.target.value })}
            >
              {cancerOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          {draft.cancerId === "other" ? (
            <Field label="نامی که پزشک گفته">
              <TextInput
                value={draft.cancerNote}
                onChange={(event) => setDraft({ ...draft, cancerNote: event.target.value })}
              />
            </Field>
          ) : null}
          <Field label="کجای مسیر هستید؟" hint="برای چیدن سؤال‌هاست، نه مرحله‌بندی پزشکی.">
            <Select
              value={draft.phase}
              onChange={(event) => setDraft({ ...draft, phase: event.target.value as CarePhase })}
            >
              {phases.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="سال شروع پیگیری">
            <TextInput
              value={draft.diagnosisYear}
              onChange={(event) => setDraft({ ...draft, diagnosisYear: event.target.value })}
            />
          </Field>
          <Field label="پزشک یا تیم درمان">
            <TextInput
              value={draft.doctor}
              onChange={(event) => setDraft({ ...draft, doctor: event.target.value })}
            />
          </Field>
          <Field label="شهر">
            <TextInput value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
          </Field>
          <Field label="شمارهٔ درمانگاه" hint="اختیاری. فقط برای دکمهٔ تماس خودتان، جایی منتشر نمی‌شود.">
            <TextInput
              inputMode="tel"
              value={draft.clinicPhone}
              onChange={(event) => setDraft({ ...draft, clinicPhone: event.target.value })}
              placeholder="مثلاً شمارهٔ بخش"
            />
          </Field>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button type="submit">ذخیرهٔ پرونده</Button>
            <Button
              tone="quiet"
              onClick={() => {
                if (window.confirm("همهٔ داده‌های همدم از این دستگاه پاک شود؟")) clearAll();
              }}
            >
              پاک کردن همهٔ داده‌های این دستگاه
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">سابقه در خانواده</h2>
        <p className="mt-2 text-sm leading-7 text-muted">
          این فهرست خطر کسی را حساب نمی‌کند. فقط کمک می‌کند سر ویزیت چیزی را از قلم نیندازید.
        </p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!condition.trim()) return;
            addFamily({ relation, condition: condition.trim(), ageAt, note });
            setCondition("");
            setAgeAt("");
            setNote("");
            toast.success("به سابقهٔ خانوادگی اضافه شد");
          }}
        >
          <Field label="نسبت">
            <Select value={relation} onChange={(event) => setRelation(event.target.value)}>
              {["مادر", "پدر", "خواهر", "برادر", "فرزند", "مادربزرگ", "پدربزرگ", "سایر"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field label="بیماری، همان‌طور که می‌دانید">
            <TextInput required value={condition} onChange={(event) => setCondition(event.target.value)} />
          </Field>
          <Field label="سن تقریبی هنگام بیماری">
            <TextInput value={ageAt} onChange={(event) => setAgeAt(event.target.value)} />
          </Field>
          <Field label="یادداشت">
            <TextInput value={note} onChange={(event) => setNote(event.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit">افزودن</Button>
          </div>
        </form>
        <ul className="mt-4 grid gap-2">
          {family.map((member) => (
            <li key={member.id} className="flex items-start justify-between gap-3 rounded-xl border border-line px-3 py-3 text-sm">
              <p>
                <span className="font-semibold">{member.relation}</span>
                {" · "}
                {member.condition}
                {member.ageAt ? ` · سن ${member.ageAt}` : ""}
                {member.note ? <span className="mt-1 block text-muted">{member.note}</span> : null}
              </p>
              <button type="button" className="text-copper" onClick={() => removeFamily(member.id)}>
                حذف
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
