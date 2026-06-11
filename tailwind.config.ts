import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        critical: "#dc2626",
        high: "#f97316",
        medium: "#eab308",
        low: "#16a34a",
        info: "#2563eb"
      }
    }
  },
  plugins: []
};

export default config;
