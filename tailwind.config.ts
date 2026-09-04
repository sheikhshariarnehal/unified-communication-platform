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
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.85)",
          glass: "rgba(255, 255, 255, 0.78)",
          subtle: "rgba(248, 250, 252, 0.7)",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        coral: {
          50: "#fff1f2",
          500: "#f43f5e",
          600: "#e11d48",
        }
      },
      borderRadius: {
        "3xl": "28px",
        "4xl": "36px",
      },
      boxShadow: {
        glass: "0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        "glass-hover": "0 14px 40px -5px rgba(0, 0, 0, 0.07), 0 6px 12px -2px rgba(0, 0, 0, 0.03)",
      }
    },
  },
  plugins: [],
};

export default config;
