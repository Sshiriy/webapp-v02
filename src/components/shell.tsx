import { Link } from "@tanstack/react-router";
import {
  Activity,
  HeartHandshake,
  FlaskConical,
  House,
  MessagesSquare,
  Route,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { cx } from "@/components/ui";
import { emptyProfile, emptyVisit, useCare, type Profile } from "@/lib/store";

const nav = [
  { to: "/", label: "خانه", icon: House, exact: true },
  { to: "/nccn", label: "مسیر", icon: Route, exact: false },
  { to: "/checkup", label: "چکاپ", icon: Stethoscope, exact: false },
  { to: "/track", label: "پیگیری", icon: Activity, exact: false },
  { to: "/support", label: "حمایت", icon: HeartHandshake, exact: false },
] as const;

const desktopNav = [
  ...nav,
  { to: "/learn", label: "آموزش", exact: false },
  { to: "/visit", label: "پیش‌ویزیت", exact: false },
  { to: "/research", label: "آزمایش پژوهشی", icon: FlaskConical, exact: false },
] as const;

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <circle cx="16" cy="16" r="13.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 7.2c.2 2.4-.2 4.2-1.4 6.1-1.1 1.7-1.8 3-1.8 4.6a3.2 3.2 0 0 0 6.4 0c0-1.6-.7-2.9-1.8-4.6-1.2-1.9-1.6-3.7-1.4-6.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const current = useCare.getState();
    const dirty =
      current.profile.onboarded ||
      current.profile.name.length > 0 ||
      current.symptoms.length > 0 ||
      current.checkups.length > 0 ||
      current.family.length > 0 ||
      current.vitals.length > 0 ||
      current.reviews.length > 0 ||
      current.chat.length > 0 ||
      current.visit.sinceLast.length > 0 ||
      current.visit.questions.length > 0;
    if (dirty) return;
    try {
      const raw = localStorage.getItem("hamdam-v2") ?? localStorage.getItem("hamdam-v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        state?: Partial<
          Pick<
            ReturnType<typeof useCare.getState>,
            "profile" | "family" | "symptoms" | "checkups" | "visit" | "chat" | "vitals" | "reviews"
          >
        >;
      };
      const saved = parsed.state;
      if (!saved) return;
      const profile = {
        ...emptyProfile,
        ...(saved.profile ?? {}),
        phase: saved.profile?.phase ?? "unsure",
      } as Profile;
      useCare.setState({
        profile,
        family: saved.family ?? [],
        symptoms: saved.symptoms ?? [],
        checkups: saved.checkups ?? [],
        visit: saved.visit ?? emptyVisit,
        chat: saved.chat ?? [],
        vitals: saved.vitals ?? [],
        reviews: saved.reviews ?? [],
      });
    } catch {
      /* پروندهٔ خراب را نادیده می‌گیریم */
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cypress text-paper">
              <Mark className="size-7" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-extrabold leading-none tracking-tight">همدم</span>
              <span className="mt-1 block truncate text-xs text-muted">
                بیمارستان آیت‌الله رئیسی · کرمانشاه
              </span>
            </span>
          </Link>
          <nav className="ms-auto hidden items-center gap-1 lg:flex">
            {desktopNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                className="rounded-full px-3 py-2 text-sm"
                activeProps={{ className: "bg-foam font-semibold text-cypress" }}
                inactiveProps={{ className: "text-muted" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ms-auto flex items-center gap-2 lg:ms-0">
            <Link
              to="/companion"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-medium"
              activeProps={{ className: "border-cypress bg-foam font-semibold text-cypress" }}
            >
              <MessagesSquare className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">همراه هوشمند</span>
            </Link>
            <Link
              to="/file"
              aria-label="پرونده"
              className="grid size-11 place-items-center rounded-full border border-line bg-surface"
              activeProps={{ className: "border-cypress bg-foam text-cypress" }}
            >
              <UserRound className="size-5" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 lg:pb-10">{children}</main>

      <footer className="no-print mx-auto hidden w-full max-w-5xl px-4 pb-8 text-sm text-muted lg:block">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p>نسخهٔ دوم · داده فقط روی همین دستگاه می‌ماند.</p>
          <Link to="/scope" className="font-medium text-cypress">
            محدودهٔ بالینی این نسخه
          </Link>
        </div>
      </footer>

      <nav className="no-print fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="flex min-h-16 flex-col items-center justify-center gap-1 text-[11px]"
                  activeProps={{ className: "font-semibold text-cypress" }}
                  inactiveProps={{ className: "text-muted" }}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Toaster
        position="top-center"
        dir="rtl"
        toastOptions={{
          style: {
            fontFamily: "Vazirmatn, sans-serif",
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-line)",
          },
        }}
      />
    </div>
  );
}

export function LevelChip({ level }: { level: "urgent" | "soon" | "steady" | "empty" }) {
  const label = {
    urgent: "تماس امروز",
    soon: "مطرح در ویزیت",
    steady: "پیگیری معمول",
    empty: "بدون ثبت",
  }[level];
  return (
    <span
      className={cx(
        "inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold",
        level === "urgent" && "bg-copper-soft text-copper",
        level === "soon" && "bg-foam text-cypress",
        (level === "steady" || level === "empty") && "bg-paper text-muted ring-1 ring-line",
      )}
    >
      {label}
    </span>
  );
}
