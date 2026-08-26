import { CATEGORIES } from "@roster/shared";

const ACCENT: Record<string, string> = {
  rebalancing: "border-brass text-brass",
  "grid-trading": "border-teal text-teal",
  "yield-optimisation": "border-moss text-moss",
  "health-factor": "border-coral text-coral",
};

export function CategoryPill({
  slug,
  active,
  onClick,
}: {
  slug: (typeof CATEGORIES)[number]["slug"];
  active: boolean;
  onClick: () => void;
}) {
  const category = CATEGORIES.find((c) => c.slug === slug)!;
  return (
    <button
      onClick={onClick}
      className={`rounded border px-3.5 py-2 font-data text-[11px] uppercase tracking-[0.1em] transition-opacity ${ACCENT[slug]} ${
        active ? "opacity-100" : "opacity-50 hover:opacity-80"
      }`}
    >
      {category.name}
    </button>
  );
}
