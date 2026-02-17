import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "500px",
        "content-md": "800px",
        "content-lg": "1060px",
      },
      colors: {
        border: "var(--color-border)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        muted: "var(--color-muted)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04)",
        "soft-lg": "0 4px 12px rgba(0,0,0,0.06)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};

export default config;
