import { create } from "zustand";
import { persist } from "zustand/middleware";

export type State = {
	url: string;
	password: string;
	prompt: string;

	model: "dall-e-2" | "dall-e-3";
	size: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
	response_format: "url" | "b64_json";
	quality: "standard" | "hd";
	style: "vivid" | "natural";
	user?: string;
};

export type Actions = {
	setUrl: (url: string) => void;
	setPassword: (password: string) => void;
	setPrompt: (prompt: string) => void;

	setModel: (model: State["model"]) => void;
	setSize: (size: State["size"]) => void;
	setQuality: (quality: State["quality"]) => void;
	setStyle: (style: State["style"]) => void;
	setUser: (user: State["user"]) => void;
	setResponseFormat: (response_format: State["response_format"]) => void;

	reset: () => void;
};

const defaultValue: State = {
	url: "https://api.openai.com/",
	password: "",
	prompt: "",
	model: "dall-e-2",
	size: "1024x1024",
	response_format: "url",
	quality: "standard",
	style: "vivid",
	user: undefined,
};

export const userInputStore = create<State & Actions>()(
	persist(
		(set) => ({
			...defaultValue,

			setPassword: (password: string) => set({ password }),
			setUrl: (url: string) => set({ url }),
			setPrompt: (prompt: string) => set({ prompt }),

			setModel: (model: State["model"]) => set({ model }),
			setSize: (size: State["size"]) => set({ size }),
			setQuality: (quality: State["quality"]) => set({ quality }),
			setStyle: (style: State["style"]) => set({ style }),
			setUser: (user: State["user"]) => set({ user }),
			setResponseFormat: (response_format: State["response_format"]) => set({ response_format }),

			reset: () => set(defaultValue),
		}),
		{ name: "userInput" },
	),
);
