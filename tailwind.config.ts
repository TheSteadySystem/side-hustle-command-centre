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
        // Light theme. Ink text on Stone bg. Bronze accent.
        bg: {
          primary: "#E8E4DC",   // Stone, page bg
          card: "#F4F0E7",      // Surface, panels/cards
          cardHover: "#EDE8DC", // slightly darker hover
          input: "#F4F0E7",     // form inputs
          overlay: "#FBF7EC",   // elevated surface
        },
        text: {
          primary: "#1E1E24",   // Ink, headings / primary
          secondary: "#3A3A44", // body copy
          muted: "#6B6A75",     // descriptions
          subtle: "#908F99",    // meta / captions
          faint: "#B0AFB8",     // footer / least emphasis
          ghost: "#C5C4CC",     // disabled / decorative
        },
        border: {
          primary: "#D8D4C8",   // subtle border on Stone
          subtle: "#E0DDD2",
          input: "#C4C1BB",
          hover: "#AFADA8",
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
