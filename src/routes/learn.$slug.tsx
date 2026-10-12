import { createFileRoute, Link } from "@tanstack/react-router";
import { getArticle } from "@/lib/articles";
import { getPathway } from "@/lib/nccn";

export const Route = createFileRoute("/learn/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${getArticle(params.slug)?.title ?? "آموزش"} | همدم` }],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const article = getArticle(slug);
  const pathway = getPathway(slug);

  if (!article) {
    return (
      <div className="py-10">
        <h1 className="text-2xl font-extrabold">این صفحه در آموزش همدم نیست.</h1>
        <Link to="/learn" className="mt-4 inline-block font-semibold text-cypress">
          بازگشت به فهرست
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/learn" className="text-sm font-medium text-cypress">
        آموزش
      </Link>
      <p className="mt-4 text-sm font-medium text-copper">{article.kicker}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{article.title}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">{article.summary}</p>
      {pathway ? (
        <Link to="/nccn/$slug" params={{ slug }} className="mt-4 inline-block text-sm font-semibold text-cypress">
          نقشهٔ سؤال‌های همین سرطان در نسخهٔ دوم
        </Link>
      ) : null}
      <div className="mt-8 grid gap-8">
        {article.sections.map((section) => (
          <section key={section.heading} className="border-s-2 border-cypress ps-4">
            <h2 className="text-xl font-bold">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-8 text-ink">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 grid gap-2 text-sm leading-7 text-muted">
                {section.bullets.map((item) => (
                  <li key={item} className="rounded-xl bg-surface px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
      <section className="mt-8 rounded-card bg-foam px-5 py-5">
        <h2 className="font-bold text-cypress-deep">برای پزشک بنویسید</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-7">
          {article.askDoctor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
