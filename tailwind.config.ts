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
        navy: {
          DEFAULT: "#1F4E79",
          50: "#E8F0F7",
          100: "#D0E1EF",
          200: "#A1C3DF",
          300: "#72A5CF",
          400: "#4387BF",
          500: "#1F4E79",
          600: "#1A4267",
          700: "#153555",
          800: "#102943",
          900: "#0B1C2E",
        },
        sand: {
          DEFAULT: "#F7F5F2",
          50: "#FBFAF8",
          100: "#F7F5F2",
          200: "#EFEBE5",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(31, 78, 121, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
