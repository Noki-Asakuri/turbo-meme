import "~/styles/globals.css";

import { Provider } from "./_components/Provider";

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";

import { Toaster } from "react-hot-toast";

const jetBrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "Dall-e Image Generator",
	description: "Generate images from text using Dall-e from OpenAI.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
	colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`font-sans ${jetBrainsMono.variable}`}>
				<Provider cookies={cookies().toString()}>{children}</Provider>
				<Toaster
					position="top-right"
					toastOptions={{
						style: {
							borderRadius: "1rem",
							background: "#333",
							color: "#fff",
						},
					}}
				/>
			</body>
		</html>
	);
}
