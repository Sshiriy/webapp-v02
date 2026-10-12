import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { getPathway, phaseLabel, phases, stagesFor } from "@/lib/nccn";
import { useCare, type CarePhase } from "@/lib/store";

export const Route = createFileRoute("/nccn/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${getPathway(params.slug)?.title ?? "مسیر"} | همدم` }],
  }),
  component: PathwayPage,
});

function PathwayPage() {
  const { slug } = Route.useParams();
  const pathway = getPathway(slug);
  const profile = useCare((state) => state.profile);
  const setVisit = useCare((state) => state.setVisit);
  const visit = useCare((state) => state.visit);
  const [phase, setPhase] = useState<CarePhase>(profile.phase || "unsure");
  const synced = useRef(profile.onboarded);

  useEffect(() => {
    if (synced.current || !profile.onboarded) return;
    synced.current = true;
    setPhase(profile.phase);
  }, [profile]);

  if (!pathway) {
    return (
      <div className="py-10">
        <h1 className="text-2xl font-extrabold">این مسیر در نسخهٔ دوم نیست.</h1>
        <Link to="/nccn" className="mt-4 inline-block font-semibold text-cypress">
          بازگشت به مسیرها
        </Link>
      </div>
    );
  }

  const stages = stagesFor(pathway, phase);

  function keepQuestions(questions: string[]) {
    const block = questions.map((item) => `• ${item}`).join("\n");
    if (visit.questions.includes(questions[0] ?? "___")) {
      toast("این سؤال‌ها قبلاً در فرم پیش‌ویزیت هست");
      return;
    }
    setVisit({
      ...visit,
      questions: [visit.questions.trim(), block].filter(Boolean).join("\n"),
    });
    toast.success("به فرم پیش از ویزیت اضافه شد");
  }

  return (
    <article className="grid gap-6">
      <div>
        <Link to="/nccn" className="text-sm font-medium text-cypress">
          مسیرها
        </Link>
        <p className="mt-4 text-sm font-medium text-copper">آموزش بیمار · الهام از ساختار گفتگو، نه متن NCCN</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{pathway.title}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">{pathway.summary}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {phases.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPhase(item.id)}
            className={
              phase === item.id
                ? "shrink-0 rounded-full bg-cypress px-4 py-2 text-sm font-semibold text-paper"
                : "shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="text-sm leading-7 text-muted">{phases.find((item) => item.id === phase)?.hint}</p>

      {stages.map((stage) => (
        <Card key={stage.phase}>
          <p className="text-xs font-semibold text-copper">{phaseLabel(stage.phase)}</p>
          <h2 className="mt-1 text-xl font-bold">{stage.title}</h2>
          <p className="mt-2 leading-7 text-muted">{stage.intent}</p>
          <div className="mt-5 grid gap-4">
            {stage.topics.map((topic) => (
              <section key={topic.title} className="border-s-2 border-cypress ps-4">
                <h3 className="font-bold">{topic.title}</h3>
                <p className="mt-1 text-sm leading-7 text-muted">{topic.body}</p>
              </section>
            ))}
          </div>
          <h3 className="mt-5 font-bold">سؤال‌هایی که می‌توانید ببرید</h3>
          <ul className="mt-2 grid gap-2 text-sm leading-7">
            {stage.questions.map((item) => (
              <li key={item} className="rounded-xl bg-paper px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <Button className="mt-4" tone="quiet" onClick={() => keepQuestions(stage.questions)}>
            افزودن به فرم پیش‌ویزیت
          </Button>
        </Card>
      ))}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-bold">واژه‌هایی که در گزارش می‌آیند</h2>
          <ul className="mt-3 grid gap-3">
            {pathway.markers.map((item) => (
              <li key={item.title}>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-7 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">به نوبت بعدی نسپارید</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-7">
            {pathway.redFlags.map((item) => (
              <li key={item} className="rounded-xl bg-copper-soft px-3 py-2 text-copper">
                {item}
              </li>
            ))}
          </ul>
          <h3 className="mt-5 font-bold">موضوع‌های پیگیری</h3>
          <ul className="mt-2 grid gap-2 text-sm leading-7 text-muted">
            {pathway.followThemes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/checkup"
          className="inline-flex min-h-11 items-center rounded-xl bg-cypress px-4 text-sm font-semibold text-paper"
        >
          چکاپ آموزشی همین مسیر
        </Link>
        <Link
          to="/learn/$slug"
          params={{ slug: pathway.slug }}
          className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold"
        >
          برگهٔ آموزش {pathway.title}
        </Link>
      </div>
    </article>
  );
}
