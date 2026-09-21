/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: {
            primary: "var(--app-bg-primary)",
            secondary: "var(--app-bg-secondary)",
            tertiary: "var(--app-bg-tertiary)",
          },
          accent: {
            DEFAULT: "var(--app-accent-primary)",
            hover: "var(--app-accent-hover)",
            subtle: "var(--app-accent-subtle)",
            tint: "var(--app-accent-tint)",
          },
          label: {
            primary: "var(--app-label-primary)",
            secondary: "var(--app-label-secondary)",
            tertiary: "var(--app-label-tertiary)",
            quaternary: "var(--app-label-quaternary)",
          },
          status: {
            danger: "var(--app-status-danger)",
            positive: "var(--app-status-positive)",
            info: "var(--app-status-info)",
            orange: "var(--app-status-orange)",
            yellow: "var(--app-status-yellow)",
          },
          fill: {
            f1: "var(--app-fill-f1)",
            f2: "var(--app-fill-f2)",
            f3: "var(--app-fill-f3)",
          },
          separator: "var(--app-separator)",
        },
      },
      borderRadius: {
        "app-sm": "8px",
        "app-md": "10px",
        "app-lg": "12px",
        "app-xl": "16px",
      },
      fontFamily: {
        sans: ["Tajawal", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-logical")],
};
