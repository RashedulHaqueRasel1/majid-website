import { ArrowRight, type LucideIcon } from "lucide-react";

export interface HeroQuickCheck {
  icon: LucideIcon;
  keyword: string;
  label: string;
}

interface HeroQuickChecksProps {
  checks: HeroQuickCheck[];
  onSelect: (keyword: string) => void;
}

export function HeroQuickChecks({ checks, onSelect }: HeroQuickChecksProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {checks.map(({ icon: Icon, keyword, label }) => (
        <button
          key={keyword}
          type="button"
          onClick={() => onSelect(keyword)}
          className="group relative flex min-h-36 min-w-0 cursor-pointer flex-col items-center justify-between overflow-hidden rounded-2xl border border-hero-border/80 bg-hero-panel p-3 text-center text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.06)] outline-none backdrop-blur-md transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-hero-accent/70 hover:bg-hero-surface hover:shadow-[0_16px_38px_rgba(132,204,22,0.14)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-hero-ring focus-visible:ring-offset-2 focus-visible:ring-offset-hero-canvas motion-reduce:transform-none sm:min-h-40 sm:p-4"
        >
          <span
            aria-hidden="true"
            className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-hero-glow-lime opacity-0 blur-2xl transition-opacity duration-200 group-hover:opacity-100"
          />

          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-hero-accent/15 bg-hero-accent-soft text-hero-emphasis shadow-[0_8px_20px_rgba(132,204,22,0.12)] transition-[background-color,color,transform] duration-200 group-hover:scale-105 group-hover:bg-hero-accent group-hover:text-hero-accent-foreground motion-reduce:transform-none sm:h-14 sm:w-14">
            <Icon
              aria-hidden="true"
              className="h-5 w-5 sm:h-6 sm:w-6"
              strokeWidth={2.1}
            />
          </span>

          <span className="relative my-2 flex min-h-10 min-w-0 items-center justify-center text-sm font-bold leading-snug sm:text-base">
            {label}
          </span>

          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hero-border bg-hero-surface text-hero-emphasis shadow-sm transition-[border-color,background-color,color,transform] duration-200 group-hover:translate-x-0.5 group-hover:border-hero-accent group-hover:bg-hero-accent group-hover:text-hero-accent-foreground motion-reduce:transform-none">
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
              strokeWidth={2.25}
            />
          </span>
        </button>
      ))}
    </div>
  );
}
