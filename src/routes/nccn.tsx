import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Disclaimer, PageIntro } from "@/components/ui";
import { pathways } from "@/lib/nccn";
import { cancerLabel, useCare } from "@/lib/store";

export const Route = createFileRoute("/nccn")({
  head: () => ({ meta: [{ title: "مسیر آموزشی | همدم" }] }),
  component: NccnIndex,
});

function NccnIndex() {
  const profile = useCare((state) => state.profile);
  const mine = pathways.find((item) => item.slug === profile.cancerId);

  return (
    <div className="grid gap-8">
      <PageIntro
        kicker="نسخهٔ دوم · نقشهٔ گفتگو"
        title="آنچه بیمار از ساختار مسیر درمان می‌شنود."
        lede="NCCN شبکهٔ ملی جامع سرطان است و دستورالعمل‌های بالینی‌اش برای تیم درمان نوشته می‌شود، مرتب عوض می‌شود و مجوز بازنشر ندارد. همدم آن متن را کپی نمی‌کند. این صفحه‌ها نقشهٔ سؤال‌اند تا سر ویزیت بدانید معمولاً چه موضوع‌هایی روی میز است."
      />
      <Disclaimer />
      {mine ? (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-muted">هم‌راستا با پروندهٔ این دستگاه</p>
            <h2 className="mt-1 text-xl font-bold">مسیر {mine.title}</h2>
            <p className="mt-1 text-sm text-muted">{cancerLabel(profile)}</p>
          </div>
          <Link
            to="/nccn/$slug"
            params={{ slug: mine.slug }}
            className="inline-flex min-h-11 items-center rounded-xl bg-cypress px-4 text-sm font-semibold text-paper sm:ms-auto"
          >
            باز کردن مسیر من
          </Link>
        </Card>
      ) : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {pathways.map((item) => (
          <li key={item.slug}>
            <Link
              to="/nccn/$slug"
              params={{ slug: item.slug }}
              className="block h-full rounded-card border border-line bg-surface p-5"
            >
              <p className="text-xs font-medium text-copper">{item.english}</p>
              <h2 className="mt-1 text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted">{item.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Card>
        <h2 className="text-lg font-bold">این نقشه چه چیزی نیست</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-7 text-muted">
          <li>دستهٔ شواهد، نام پروتکل، یا نسخهٔ رسمی NCCN نیست.</li>
          <li>مرحلهٔ بیماری شما را از روی فرم حدس نمی‌زند.</li>
          <li>جای کمیتهٔ درمان بیمارستان آیت‌الله رئیسی را نمی‌گیرد.</li>
        </ul>
        <Link to="/scope" className="mt-4 inline-block text-sm font-semibold text-cypress">
          محدودهٔ نسخهٔ دوم
        </Link>
      </Card>
    </div>
  );
}
