import { nextui } from "@nextui-org/react";

import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	content: ["./src/**/*.tsx", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", ...fontFamily.sans],
			},
			container: {
				center: true,
				padding: { DEFAULT: "0.5rem", sm: "1rem" },
			},
		},
	},
	darkMode: "class",
	plugins: [nextui()],
} satisfies Config;