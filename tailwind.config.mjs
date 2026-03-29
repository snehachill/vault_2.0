/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./component/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        twinkle: "twinkle 1.8s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": {
            boxShadow:
              "0 0 20px 6px rgba(34,197,94,0.6), 0 0 50px 14px rgba(34,197,94,0.3), 0 0 90px 28px rgba(34,197,94,0.15)",
          },
          "50%": {
            boxShadow:
              "0 0 32px 10px rgba(34,197,94,0.8), 0 0 70px 22px rgba(34,197,94,0.45), 0 0 120px 40px rgba(34,197,94,0.22)",
          },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.15", transform: "scale(0.6) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1.2) rotate(20deg)" },
        },
      },
      colors: {
        accent: "#3B82F6",
        "accent-dark": "#1D4ED8",
        coin: "#F59E0B",
        "text-main": "#FFFFFF",
        "text-muted": "#94A3B8",
        border: "#2E3A4E",
        card: "#020617",
        surface: "#020617",
      },
      borderRadius: {
        card: "16px",
        button: "12px",
        modal: "24px",
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
      boxShadow: {
        "blue-glow": "0 0 40px rgba(59,130,246,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
