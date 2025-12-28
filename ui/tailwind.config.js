/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["'Clash Display'", "system-ui", "sans-serif"],
        mono: ["'Space Grotesk'", "monospace"],
      },
      colors: {
        background: "#05060a",
        foreground: "#f5faff",
        primary: {
          DEFAULT: "#f97316",
          foreground: "#05060a",
        },
        secondary: {
          DEFAULT: "#121527",
          foreground: "#c3cdf3",
        },
        accent: {
          DEFAULT: "#7c3aed",
          foreground: "#f5faff",
        },
        card: {
          DEFAULT: "#0a0c18",
          foreground: "#f5faff",
        },
        muted: {
          DEFAULT: "#1a1d2f",
          foreground: "#8c95bf",
        },
        border: "#1e2138",
      },
      borderRadius: {
        lg: "1rem",
        md: "0.6rem",
        sm: "0.4rem",
      },
      boxShadow: {
        glow: "0 20px 45px rgba(124, 58, 237, 0.25)",
        card: "0 18px 60px rgba(5, 6, 10, 0.8)",
      },
      backgroundImage: {
        grid: "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 0), linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 0)",
      },
      animation: {
        pulseSlow: "pulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
