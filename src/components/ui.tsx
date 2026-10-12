import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-card border border-line bg-surface px-5 py-5 shadow-[0_1px_0_rgba(28,42,39,0.04),0_16px_40px_rgba(28,42,39,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "quiet" | "copper";
};

export function Button({ tone = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" && "bg-cypress text-paper hover:bg-cypress-deep",
        tone === "quiet" && "border border-line bg-surface text-ink hover:bg-foam",
        tone === "copper" && "bg-copper text-paper hover:bg-cypress-deep",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint ? <span className="mt-1 block text-sm text-muted">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const control =
  "w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none ring-cypress placeholder:text-muted/70 focus:ring-2";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(control, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(control, "min-h-28 resize-y leading-7", props.className)} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cx(control, "min-h-11", className)}>
      {children}
    </select>
  );
}

export function PageIntro({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="max-w-2xl">
      <p className="text-sm font-medium text-copper">{kicker}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
      {lede ? <p className="mt-3 text-lg leading-8 text-muted">{lede}</p> : null}
    </header>
  );
}

export function Disclaimer() {
  return (
    <p className="rounded-xl border border-line bg-foam px-4 py-3 text-sm leading-6 text-cypress-deep">
      همدم ابزار اطلاع‌رسانی و پیگیری است، نه تشخیص، نه نسخه‌نویسی، و نه جایگزین ویزیت پزشک یا اورژانس.
    </p>
  );
}
