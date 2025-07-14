import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.tsx",
    "./src/components/*.tsx",
    "./src/app/**/*.tsx",
    "./src/app/*.tsx",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [heroui()],
};
export default config;
