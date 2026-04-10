import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        bg: {
          primary: "#0C0B0A",
          card: "#141312",
          cardHover: "#1A1918",
          input: "#141312",
          overlay: "#0F0E0D",
        },
        text: {
          primary: "#F5F0E8",
          secondary: "#D4CFC6",
          muted: "#8A8478",
          subtle: "#6B6560",
          faint: "#4A4540",
          ghost: "#3A3835",
        },
        border: {
          primary: "#1F1E1C",
          subtle: "#1A1918",
          input: "#2A2825",
          hover: "#3A3835",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
