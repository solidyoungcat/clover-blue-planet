import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../shared/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
          950: "#082F49",
        },
        sand: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
          dark: "#B45309",
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', '"Noto Serif SC"', "Georgia", "serif"],
        sans: ["Inter", '"Noto Sans SC"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      boxShadow: {
        // 发光效果
        "glow-sm": "0 0 8px -2px rgba(56, 189, 248, 0.3)",
        "glow": "0 0 16px -4px rgba(56, 189, 248, 0.4)",
        "glow-lg": "0 0 24px -6px rgba(56, 189, 248, 0.5)",
        "glow-sand": "0 0 16px -4px rgba(245, 158, 11, 0.4)",
        // 按钮阴影
        "btn": "0 2px 8px rgba(2, 132, 199, 0.15)",
        "btn-hover": "0 4px 16px rgba(2, 132, 199, 0.3)",
      },
      borderRadius: {
        "xl": "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px -2px rgba(56, 189, 248, 0.3)" },
          "50%": { boxShadow: "0 0 20px -4px rgba(56, 189, 248, 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        // 玻璃态
        ".glass": {
          background: "rgba(12, 74, 110, 0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(56, 189, 248, 0.1)",
        },
        ".glass-light": {
          background: "rgba(12, 74, 110, 0.3)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(56, 189, 248, 0.06)",
        },
        // 按钮基础样式
        ".btn-ocean": {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.5rem 1rem",
          fontSize: "0.8125rem",
          fontWeight: "500",
          borderRadius: "0.75rem",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          background: "rgba(12, 74, 110, 0.5)",
          color: "#BAE6FD",
          cursor: "pointer",
          transition: "all 200ms ease-out",
          userSelect: "none",
        },
        ".btn-ocean:hover": {
          background: "rgba(2, 132, 199, 0.3)",
          borderColor: "rgba(56, 189, 248, 0.5)",
          boxShadow: "0 0 16px -4px rgba(56, 189, 248, 0.4)",
          transform: "translateY(-1px)",
        },
        ".btn-ocean:active": {
          transform: "translateY(0)",
          boxShadow: "0 0 8px -2px rgba(56, 189, 248, 0.3)",
        },
        // 主按钮（强调）
        ".btn-primary": {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.5rem 1.25rem",
          fontSize: "0.8125rem",
          fontWeight: "600",
          borderRadius: "0.75rem",
          border: "1px solid rgba(56, 189, 248, 0.5)",
          background: "linear-gradient(135deg, rgba(2, 132, 199, 0.6), rgba(14, 165, 233, 0.4))",
          color: "#FFFFFF",
          cursor: "pointer",
          transition: "all 200ms ease-out",
          boxShadow: "0 2px 8px rgba(2, 132, 199, 0.2)",
          userSelect: "none",
        },
        ".btn-primary:hover": {
          background: "linear-gradient(135deg, rgba(2, 132, 199, 0.8), rgba(14, 165, 233, 0.6))",
          borderColor: "rgba(56, 189, 248, 0.7)",
          boxShadow: "0 0 24px -4px rgba(56, 189, 248, 0.5)",
          transform: "translateY(-2px)",
        },
        ".btn-primary:active": {
          transform: "translateY(0)",
          boxShadow: "0 0 8px -2px rgba(56, 189, 248, 0.3)",
        },
        // 小尺寸按钮
        ".btn-sm": {
          padding: "0.375rem 0.75rem",
          fontSize: "0.75rem",
          borderRadius: "0.625rem",
        },
        // 卡片
        ".card-ocean": {
          background: "rgba(14, 58, 84, 0.5)",
          border: "1px solid rgba(30, 90, 122, 0.4)",
          borderRadius: "0.75rem",
          transition: "all 250ms ease-out",
        },
        ".card-ocean:hover": {
          borderColor: "rgba(56, 189, 248, 0.3)",
          boxShadow: "0 0 20px -4px rgba(56, 189, 248, 0.15)",
        },
      });
    }),
  ],
} satisfies Config;
