import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        story: {
          blue: "#2410A4",
          "blue-hover": "#1B0C80",
          "blue-light": "#EEF0FF",
          red: "#C9281D",
          "red-dark": "#8F1712",
          "red-light": "#FDF2F0",
          ink: "#050505",
          "ink-light": "#1A1721",
          paper: "#FAF8F3",
          "paper-warm": "#F4EFE6",
          lavender: "#EEF0FF",
          "lavender-light": "#F7F8FF",
          muted: "#696572",
          border: "#E8E4DC",
          "border-dark": "#27272A",
        },
        fable: {
          forest: "#064c37",
          "forest-dark": "#043527",
          "forest-deep": "#022419",
          sky: "#43a1d7",
          cream: "#f7f4ee",
          ink: "#161015",
          plum: "#292229",
          graphite: "#3f383d",
          star: "#f6c445",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Fraunces", "Georgia", "serif"],
        inter: ["var(--font-inter)", "Inter", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Geist Mono", "monospace"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(5, 5, 5, 0.04)",
        card: "0 10px 30px -10px rgba(5, 5, 5, 0.06)",
        "card-hover": "0 20px 40px -15px rgba(36, 16, 164, 0.12)",
        player: "0 25px 60px -15px rgba(0, 0, 0, 0.6)",
        "fable-pill": "0 4px 20px 0 rgba(0, 0, 0, 0.4)",
        "fable-cover": "0 2px 8px 0 rgba(0, 0, 0, 0.25)",
      },
      borderRadius: {
        pill: "9999px",
        stadium: "60px",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
