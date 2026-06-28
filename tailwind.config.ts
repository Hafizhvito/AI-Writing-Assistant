import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        overlay: "var(--bg-overlay)",
        hover: "var(--bg-hover)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-light": "var(--accent-light)",
        border: "var(--border-default)",
        danger: "var(--danger)",
        success: "var(--success)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};
export default config;
