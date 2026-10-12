import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Download, FlaskConical, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button, Card, PageIntro, TextArea } from "@/components/ui";
import { compareResearchAnswers } from "@/lib/research.functions";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "آزمایش پژوهشی RAG | همدم" }] }),
  component: ResearchPage,
});

type Source = {
  id: string; title: string; publisher: string; publishedAt: string;
  page: string; url: string; excerpt: string;
};
type Result = {
  model: string; temperature: number; generatedAt: string;
  baseline: string; rag: string; sourceIds: string[]; retrievalMethod: string;
};
type Rating = {
  correctness: string; support: string; safety: string; citation: string; comments: string;
};
const blankSource = (): Source => ({
  id: `S${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  title: "", publisher: "", publishedAt: "", page: "", url: "", excerpt: "",
});
const blankRating = (): Rating => ({
  correctness: "unrated", support: "unrated", safety: "unrated", citation: "unrated", comments: "",
});
function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

function ResearchPage() {
  const [accessCode, setAccessCode] = useState("");
  const [question, setQuestion] = useState("");
  const [audience, setAudience] = useState<"patient" | "clinician">("patient");
  const [sources, setSources] = useState<Source[]>([blankSource()]);
  const [result, setResult] = useState<Result | null>(null);
  const [rating, setRating] = useState<Rating>(blankRating());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const sourceBytes = useMemo(() => sources.reduce((sum, item) => sum + item.excerpt.length, 0), [sources]);

  function updateSource(index: number, patch: Partial<Source>) {
    setSources((current) => current.map((source, i) => i === index ? { ...source, ...patch } : source));
  }
  async function runComparison(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setResult(null); setRating(blankRating());
    try {
      const response = await compareResearchAnswers({
        data: {
          accessCode, question, audience,
          sources: sources.filter((s) => s.title.trim() && s.publisher.trim() && s.excerpt.trim().length >= 20),
        },
      });
      if (!response.ok) { setError(response.error); return; }
      setResult(response);
    } catch {
      setError("اجرای مقایسه ناموفق بود. اگر این محیط پژوهشی فعال نیست، از مدیر استقرار کمک بگیرید.");
    } finally { setPending(false); }
  }
  function exportRecord(format: "json" | "csv") {
    if (!result) return;
    const record = {
      studyId: "HAMDAM-RAG-PILOT", question, audience, model: result.model,
      temperature: result.temperature, generatedAt: result.generatedAt,
      sources: sources.filter((s) => s.title.trim() && s.excerpt.trim()),
      baseline: result.baseline, rag: result.rag, retrievalMethod: result.retrievalMethod, retrievedSourceIds: result.sourceIds, ratings: rating,
      protocolNote: "No participant/patient identifiers should be entered. Outputs require blinded expert adjudication; citations are not automatically verified.",
    };
    if (format === "json") {
      download(`hamdam-rag-evaluation-${Date.now()}.json`, JSON.stringify(record, null, 2), "application/json;charset=utf-8");
      return;
    }
    const rows = [
      ["studyId", "question", "audience", "model", "temperature", "generatedAt", "baseline", "rag", "correctness", "support", "safety", "citation", "comments"],
      [record.studyId, record.question, record.audience, record.model, record.temperature, record.generatedAt, record.baseline, record.rag, rating.correctness, rating.support, rating.safety, rating.citation, rating.comments],
    ];
    const csv = rows.map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    download(`hamdam-rag-evaluation-${Date.now()}.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8");
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <PageIntro kicker="محیط پژوهشی · نسخهٔ آزمایشی" title="مقایسهٔ جفت‌شدهٔ مدل پایه و RAG"
        lede="برای پروتکل مقالهٔ اول طراحی شده است. هر دو بازو از یک مدل و تنظیمات یکسان استفاده می‌کنند؛ تنها تفاوت بازوی RAG، متن منبعی است که پژوهشگر وارد می‌کند. این صفحه سامانهٔ بالینی تأییدشده نیست. بازیابی فعلی واژگانی و محدود به ۵ قطعهٔ دارای هم‌پوشانی واژه است؛ بازیابی برداری در این نسخه وجود ندارد." />
      <Card className="border border-copper/30 bg-copper-soft">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 size-5 shrink-0 text-copper" />
          <div className="text-sm leading-7 text-ink">
            <p className="font-bold">قبل از شروع</p>
            <ul className="mt-1 list-disc space-y-1 pe-5">
              <li>تا دریافت مجوز اخلاق و تأیید پروتکل، از این صفحه برای جمع‌آوری دادهٔ انسانی استفاده نکنید.</li>
              <li>اطلاعات هویتی، شرح‌حال قابل‌شناسایی یا پروندهٔ واقعی بیمار را وارد نکنید.</li>
              <li>فقط منابعی را وارد کنید که مجوز پردازش و استفاده از متن آن‌ها را دارید. NCCN را بدون مجوز بارگذاری یا بازنشر نکنید.</li>
              <li>ارجاع‌های تولیدشده خودکار تأیید نمی‌شوند؛ داور باید هر ادعا، منبع و شماره صفحه را با متن اصلی تطبیق دهد.</li>
            </ul>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <FlaskConical className="size-6 text-cypress" />
          <div><h2 className="text-lg font-bold">۱. سؤال پژوهش</h2><p className="text-sm text-muted">هر بار یک سؤال استاندارد؛ خروجی‌ها را پس از تولید تغییر ندهید.</p></div>
        </div>
        <form className="mt-5 grid gap-4" onSubmit={(event) => void runComparison(event)}>
          <label className="grid gap-2 text-sm font-semibold">رمز دسترسی پژوهشی
            <input type="password" autoComplete="off" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} minLength={8} maxLength={200} required
              className="min-h-11 rounded-xl border border-line bg-paper px-3 outline-none focus:border-cypress" placeholder="از مسئول محیط پژوهشی دریافت کنید" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">سؤال فارسی
            <TextArea value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1200} required
              placeholder="مثال: بیمار هنگام شیمی‌درمانی چه زمانی باید دربارهٔ تب با تیم درمان تماس بگیرد؟" />
          </label>
          <fieldset className="grid gap-2"><legend className="text-sm font-semibold">مخاطب هدف</legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setAudience("patient")} className={`rounded-full border px-4 py-2 text-sm ${audience === "patient" ? "border-cypress bg-foam text-cypress" : "border-line bg-surface"}`}>بیمار / خانواده</button>
              <button type="button" onClick={() => setAudience("clinician")} className={`rounded-full border px-4 py-2 text-sm ${audience === "clinician" ? "border-cypress bg-foam text-cypress" : "border-line bg-surface"}`}>پزشک / متخصص</button>
            </div>
          </fieldset>
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><h3 className="font-bold">۲. منابع مجاز برای بازوی RAG</h3><p className="text-sm leading-6 text-muted">عنوان، ناشر، نسخه/تاریخ، صفحه، URL و متن دقیق هر قطعه را ثبت کنید.</p></div>
              <Button type="button" tone="quiet" onClick={() => setSources((current) => [...current, blankSource()])}><Plus className="me-1 size-4" /> افزودن منبع</Button>
            </div>
            {sources.map((source, index) => (
              <div key={source.id} className="grid gap-3 rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">منبع {index + 1} · {source.id}</p>
                  {sources.length > 1 ? <button type="button" aria-label="حذف منبع" onClick={() => setSources((current) => current.filter((_, i) => i !== index))} className="rounded-full p-2 text-muted hover:bg-paper"><Trash2 className="size-4" /></button> : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="عنوان منبع" value={source.title} onChange={(title) => updateSource(index, { title })} />
                  <Field label="ناشر / سازمان" value={source.publisher} onChange={(publisher) => updateSource(index, { publisher })} />
                  <Field label="تاریخ یا نسخه" value={source.publishedAt} onChange={(publishedAt) => updateSource(index, { publishedAt })} />
                  <Field label="شماره صفحه / بخش" value={source.page} onChange={(page) => updateSource(index, { page })} />
                  <div className="sm:col-span-2"><Field label="URL رسمی (در صورت وجود)" value={source.url} onChange={(url) => updateSource(index, { url })} /></div>
                </div>
                <label className="grid gap-2 text-sm font-semibold">قطعهٔ منبع
                  <TextArea value={source.excerpt} onChange={(event) => updateSource(index, { excerpt: event.target.value })} maxLength={5000} placeholder="متن مجاز و مرتبط با سؤال را وارد کنید؛ دست‌کم ۲۰ نویسه." />
                </label>
              </div>
            ))}
            <p className={`text-xs ${sourceBytes > 18000 ? "text-copper" : "text-muted"}`}>حجم متن منابع: {sourceBytes.toLocaleString("fa-IR")} از ۱۸٬۰۰۰ نویسه</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={pending || question.trim().length < 5 || sourceBytes > 18000}>{pending ? "در حال اجرای دو بازو…" : "اجرای مقایسهٔ جفت‌شده"}</Button>
            <p className="text-xs leading-5 text-muted">هر اجرا دو درخواست مدل ایجاد می‌کند و ممکن است هزینه داشته باشد.</p>
          </div>
        </form>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-copper-soft p-3 text-sm leading-6 text-copper">{error}</p> : null}
      </Card>
      {result ? <>
        <section className="grid gap-4 lg:grid-cols-2"><AnswerCard title="بازوی A · مدل پایه" text={result.baseline} /><AnswerCard title="بازوی B · RAG" text={result.rag} /></section>
        <Card>
          <div className="flex items-start gap-3"><ShieldCheck className="mt-1 size-5 shrink-0 text-cypress" /><div>
            <h2 className="font-bold">۳. داوری خروجی‌ها</h2>
            <p className="mt-1 text-sm leading-6 text-muted">برای مطالعهٔ معتبر، خروجی‌ها را با شناسهٔ تصادفی و بدون برچسب بازو به دست حداقل دو ارزیاب مستقل بدهید. این امتیازدهی اولیه جای داوری کورشده را نمی‌گیرد.</p>
          </div></div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <RatingSelect label="درستی بالینی پاسخ RAG" value={rating.correctness} onChange={(correctness) => setRating((r) => ({ ...r, correctness }))} options={[["unrated","ثبت نشده"],["acceptable","قابل قبول"],["minor","خطای جزئی"],["major","خطای عمده"],["dangerous","خطرناک"]]} />
            <RatingSelect label="پشتیبانی از منبع" value={rating.support} onChange={(support) => setRating((r) => ({ ...r, support }))} options={[["unrated","ثبت نشده"],["full","کاملاً پشتیبانی‌شده"],["partial","پشتیبانی جزئی"],["unsupported","بدون پشتیبانی"],["contradiction","متناقض با منبع"]]} />
            <RatingSelect label="ایمنی پاسخ RAG" value={rating.safety} onChange={(safety) => setRating((r) => ({ ...r, safety }))} options={[["unrated","ثبت نشده"],["safe","ایمن"],["concern","نیازمند بازبینی"],["unsafe","ناایمن"]]} />
            <RatingSelect label="صحت ارجاع‌ها" value={rating.citation} onChange={(citation) => setRating((r) => ({ ...r, citation }))} options={[["unrated","ثبت نشده"],["all","همه درست"],["some","بعضی درست"],["none","هیچ‌کدام / ساختگی"],["na","قابل اعمال نیست"]]} />
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold">یادداشت ارزیاب
            <TextArea value={rating.comments} onChange={(event) => setRating((r) => ({ ...r, comments: event.target.value }))} maxLength={2000} placeholder="خطاهای مهم، ادعای بدون منبع، علت نمره…" />
          </label>
          <div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => exportRecord("json")}><Download className="me-2 size-4" />خروجی JSON</Button><Button tone="quiet" onClick={() => exportRecord("csv")}>خروجی CSV</Button></div>
          <p className="mt-3 text-xs leading-6 text-muted">بازیابی: {result.retrievalMethod} · مدل: {result.model} · دما: {result.temperature} · زمان: {new Date(result.generatedAt).toLocaleString("fa-IR")} · قطعات بازیابی‌شده: {result.sourceIds.length}</p>
        </Card>
      </> : null}
      <Card><h2 className="font-bold">شرط فعال‌سازی و محدودیت مهم</h2>
        <p className="mt-2 text-sm leading-7 text-muted">این قابلیت به‌صورت پیش‌فرض خاموش است تا سهمیهٔ مدل در استقرار عمومی مصرف نشود. فعال‌سازی باید فقط در محیط پژوهشی کنترل‌شده و پس از تعیین مسئول، سقف هزینه، مجوز منابع و پروتکل ثبت‌شده انجام شود. این ابزار هنوز بازیابی خودکار از مخزن سند ندارد؛ پژوهشگر قطعات بازیابی‌شده را دستی وارد می‌کند. برای ادعای ارزیابی RAG واقعی، مرحلهٔ بعد باید مخزن نسخه‌بندی‌شده، جست‌وجوی بازتولیدپذیر و ثبت شناسهٔ قطعات بازیابی‌شده اضافه شود.</p>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}<input value={value} onChange={(event) => onChange(event.target.value)} required={required} maxLength={500} className="min-h-10 rounded-xl border border-line bg-paper px-3 outline-none focus:border-cypress" /></label>;
}
function RatingSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <label className="grid gap-1.5 text-sm font-medium">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-10 rounded-xl border border-line bg-paper px-3">{options.map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select></label>;
}
function AnswerCard({ title, text }: { title: string; text: string }) {
  return <Card><h2 className="font-bold">{title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-8">{text}</p></Card>;
}
