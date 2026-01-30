// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // 確保這一行存在
  ],
  theme: {
    extend: {
      boxShadow: {
        "glass-inset": "inset 0 0 0 1px rgba(255, 255, 255, 0.3)",
        "glass-sm": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      },
    },
  },
  // ...
};
