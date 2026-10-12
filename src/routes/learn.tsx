import { createFileRoute, Link } from "@tanstack/react-router";
import { articles } from "@/lib/articles";
import { PageIntro } from "@/components/ui";

export const Route = createFileRoute("/learn")({
  head: () => ({ meta: [{ title: "آموزش | همدم" }] }),
  component: Learn,
});

function Learn() {
  const cancers = articles.filter((article) => article.kind === "cancer");
  const guides = articles.filter((article) => article.kind === "guide");
  return (
    <div className="grid gap-8">
      <PageIntro
        kicker="آموزش"
        title="آنچه بین تشخیص و تصمیم، ارزش دانستن دارد."
        lede="متن‌ها عمومی و محافظه‌کارند. نقشهٔ سؤال هر سرطان در بخش مسیر است و دستورالعمل مجوزدار NCCN اینجا بازنشر نشده. برنامهٔ واقعی درمان را تیم بیمارستان آیت‌الله رئیسی می‌نویسد."
      />
      <section>
        <h2 className="text-sm font-semibold text-copper">راهنماهای مشترک</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {guides.map((article) => (
            <li key={article.slug}>
              <Link
                to="/learn/$slug"
                params={{ slug: article.slug }}
                className="block h-full rounded-card border border-line bg-surface p-5"
              >
                <h3 className="text-lg font-bold">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{article.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold text-copper">به تفکیک نوع</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {cancers.map((article) => (
            <li key={article.slug}>
              <Link
                to="/learn/$slug"
                params={{ slug: article.slug }}
                className="block h-full rounded-card border border-line bg-paper p-5"
              >
                <p className="text-xs text-muted">{article.kicker}</p>
                <h3 className="mt-1 text-lg font-bold">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{article.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
