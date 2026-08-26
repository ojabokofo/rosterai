import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1116",
        "ink-elevated": "#171B22",
        paper: "#F2EFE6",
        "paper-muted": "#9C9890",
        brass: "#C99A3F",
        teal: "#3FA9A0",
        moss: "#7A8B5C",
        coral: "#C4573B",
      },
      fontFamily: {
        display: ["var(--font-slab)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        data: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
