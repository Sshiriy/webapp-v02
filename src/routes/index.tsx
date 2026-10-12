import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Route as RouteIcon, ShieldCheck, Stethoscope } from "lucide-react";
import { Disclaimer, Card } from "@/components/ui";
import { LevelChip } from "@/components/shell";
import { assessReview, latestAssessment, trendNote } from "@/lib/flags";
import { formatFa, relativeDay, safeTel } from "@/lib/format";
import { getPathway, phaseLabel } from "@/lib/nccn";
import { cancerLabel, upcomingCheckups, useCare } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "همدم | بیمارستان آیت‌الله رئیسی" }] }),
  component: Home,
});

const paths = [
  { title: "مسیر گفتگو", text: "شش سرطان شایع طرح؛ سؤال‌هایی که سر ویزیت جا می‌مانند، بدون بازنشر NCCN.", to: "/nccn" },
  { title: "چکاپ آموزشی", text: "درد، تب، اکسیژن و هشدار شفاف. تشخیص و پیش‌بینی متاستاز ندارد.", to: "/checkup" },
  { title: "پیگیری", text: "دفتر حال، علائم حیاتی خانگی و تقویم آزمایش و تزریق.", to: "/track" },
] as const;

function Home() {
  const profile = useCare((state) => state.profile);
  if (!profile.onboarded) return <Landing />;
  return <Dashboard />;
}

function Landing() {
  const loadDemo = useCare((state) => state.loadDemo);
  return (
    <div className="grid gap-8">
      <Disclaimer />
      <section className="grid items-end gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-sm font-medium text-copper">مرکز رشد فناوری سلامت · نسخهٔ دوم</p>
          <h1 className="mt-3 max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            نقشهٔ درمان، برای فاصلهٔ بین دو ویزیت.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
            همدم برای بیماران بیمارستان آیت‌الله رئیسی است. نسخهٔ دوم مسیر گفتگو با تیم درمان را — به زبان بیمار و
            جدا از متن مجوزدار NCCN — کنار دفتر حال، چکاپ و حمایت می‌گذارد.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/file"
              className="inline-flex min-h-11 items-center rounded-xl bg-cypress px-4 text-sm font-semibold text-paper"
            >
              ساخت پرونده روی این دستگاه
            </Link>
            <button
              type="button"
              onClick={loadDemo}
              className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold"
            >
              دیدن با نمونهٔ نمایشی
            </button>
          </div>
        </div>
        <Card className="bg-cypress text-paper">
          <p className="text-sm text-foam">نسخهٔ دوم چه چیزی اضافه کرده</p>
          <ul className="mt-4 grid gap-3 text-sm leading-6">
            <li>نقشهٔ سؤال برای پستان، روده، ریه، پروستات، کبد و پوست.</li>
            <li>چکاپ آموزشی با قاعدهٔ روشن تب، درد، اکسیژن و علامت عصبی.</li>
            <li>ثبت دمای خانگی، ضربان و پالس‌اکسی‌متر؛ بدون ادعای اتصال دستگاه پزشکی.</li>
            <li>همراه هوشمند که متن مسیر را توضیح می‌دهد و تشخیص نمی‌دهد.</li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {paths.map((item) => (
          <Link key={item.to} to={item.to} className="rounded-card border border-line bg-surface p-5">
            <h2 className="text-lg font-bold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
          </Link>
        ))}
      </section>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ShieldCheck className="size-6 shrink-0 text-cypress" strokeWidth={1.75} />
        <p className="text-sm leading-7 text-muted">
          شبکهٔ عصبی تشخیص سرطان و پیش‌بینی متاستاز هنوز در محصول بیمار نیست. دلیلش را در محدودهٔ نسخه بخوانید.
        </p>
        <Link to="/scope" className="text-sm font-semibold text-cypress sm:ms-auto">
          محدودهٔ نسخهٔ دوم
        </Link>
      </Card>
    </div>
  );
}

function Dashboard() {
  const profile = useCare((state) => state.profile);
  const symptoms = useCare((state) => state.symptoms);
  const checkups = useCare((state) => state.checkups);
  const reviews = useCare((state) => state.reviews);
  const vitals = useCare((state) => state.vitals);
  const clearAll = useCare((state) => state.clearAll);
  const assessment = latestAssessment(symptoms);
  const trend = trendNote(symptoms);
  const next = upcomingCheckups(checkups)[0];
  const tel = safeTel(profile.clinicPhone);
  const latest = [...symptoms].sort((a, b) => b.date.localeCompare(a.date))[0];
  const review = [...reviews].sort((a, b) => b.date.localeCompare(a.date))[0];
  const vital = [...vitals].sort((a, b) => b.date.localeCompare(a.date))[0];
  const pathway = getPathway(profile.cancerId);
  const reviewAssessment = review ? assessReview(review) : null;

  return (
    <div className="grid gap-6">
      <Disclaimer />
      {profile.demo ? (
        <p className="text-sm leading-6 text-copper">
          این پرونده نمونهٔ نمایشی و ساختگی است.{" "}
          <button type="button" onClick={clearAll} className="font-semibold underline">
            پاک کردن و شروع واقعی
          </button>
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">پروندهٔ این دستگاه</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{profile.name || "بدون نام"}</h1>
              <p className="mt-2 text-sm text-muted">
                {cancerLabel(profile)}
                {` · ${phaseLabel(profile.phase)}`}
                {profile.city ? ` · ${profile.city}` : ""}
                {profile.doctor ? ` · ${profile.doctor}` : ""}
              </p>
            </div>
            <LevelChip level={reviewAssessment?.level ?? assessment.level} />
          </div>
          <h2 className="mt-6 text-xl font-bold">{(reviewAssessment ?? assessment).title}</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {(reviewAssessment ?? assessment).reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          {trend ? <p className="mt-3 text-sm font-medium text-cypress">{trend}</p> : null}
          {assessment.level === "urgent" || reviewAssessment?.level === "urgent" ? (
            <div className="mt-4">
              {tel ? (
                <a
                  href={tel}
                  className="inline-flex min-h-11 items-center rounded-xl bg-copper px-4 text-sm font-semibold text-paper"
                >
                  تماس با شماره‌ای که خودتان ذخیره کرده‌اید
                </a>
              ) : (
                <Link to="/file" className="text-sm font-semibold text-copper">
                  شمارهٔ درمانگاه را در پرونده بنویسید تا دکمهٔ تماس فعال شود
                </Link>
              )}
            </div>
          ) : null}
        </Card>

        <Card className="flex flex-col">
          <p className="text-sm text-muted">نوبت پیش رو</p>
          {next ? (
            <>
              <p className="mt-3 text-2xl font-extrabold tabular-nums">{relativeDay(next.date)}</p>
              <p className="mt-1 font-medium">{next.title}</p>
              <p className="text-sm text-muted">
                {formatFa(next.date)}
                {next.place ? ` · ${next.place}` : ""}
              </p>
            </>
          ) : (
            <p className="mt-3 leading-7 text-muted">نوبت آینده‌ای در تقویم نیست.</p>
          )}
          <Link to="/track" className="mt-auto pt-4 text-sm font-semibold text-cypress">
            دفتر پیگیری
          </Link>
        </Card>
      </section>

      {pathway ? (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <RouteIcon className="size-5 shrink-0 text-cypress" strokeWidth={1.75} />
          <div>
            <h2 className="font-bold">مسیر {pathway.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">{pathway.summary}</p>
          </div>
          <Link to="/nccn/$slug" params={{ slug: pathway.slug }} className="text-sm font-semibold text-cypress sm:ms-auto">
            باز کردن نقشه
          </Link>
        </Card>
      ) : (
        <Card>
          <h2 className="font-bold">مسیر گفتگو هنوز انتخاب نشده</h2>
          <p className="mt-2 text-sm leading-7 text-muted">نوع را در پرونده مشخص کنید تا سؤال‌های همان سرطان بیاید.</p>
          <Link to="/nccn" className="mt-3 inline-block text-sm font-semibold text-cypress">
            دیدن هر شش مسیر
          </Link>
        </Card>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <Link to="/checkup" className="rounded-card border border-line bg-surface p-4">
          <Stethoscope className="size-5 text-cypress" strokeWidth={1.75} />
          <h2 className="mt-3 font-bold">چکاپ آموزشی</h2>
          <p className="mt-1 text-sm text-muted">
            {review ? `آخرین چکاپ ${formatFa(review.date)}` : "هنوز چکاپی ثبت نشده"}
          </p>
        </Link>
        <Link to="/visit" className="rounded-card border border-line bg-surface p-4">
          <ClipboardList className="size-5 text-cypress" strokeWidth={1.75} />
          <h2 className="mt-3 font-bold">پیش از ویزیت</h2>
          <p className="mt-1 text-sm text-muted">سؤال‌های مسیر را این‌جا جمع کنید.</p>
        </Link>
        <Link to="/track" className="rounded-card border border-line bg-surface p-4">
          <p className="text-sm font-semibold text-cypress">علائم خانگی</p>
          <h2 className="mt-3 font-bold">{vital ? `اکسیژن ${vital.spo2 || "—"}` : "ثبت نشده"}</h2>
          <p className="mt-1 text-sm text-muted">
            {latest ? `حال ${formatFa(latest.date)}` : "دفتر حال خالی است"}
            {vital?.temp ? ` · دما ${vital.temp}` : ""}
          </p>
        </Link>
      </section>
    </div>
  );
}
