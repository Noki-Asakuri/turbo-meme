"use client";

import { userInputStore } from "~/store/state";

import { PasswordInput } from "./PasswordInput";

import { Input } from "@nextui-org/react";

import { useStore } from "zustand";

const TopInput = () => {
	const state = useStore(userInputStore, (state) => state);
	const isOpenAI = state.url.startsWith("https://api.openai.com");

	return (
		<section className="flex w-full flex-col gap-4">
			<Input
				name="url"
				type="url"
				isRequired
				label="Endpoint URL"
				labelPlacement="outside"
				placeholder="Enter your proxy url here"
				value={state.url}
				onValueChange={state.setUrl}
			/>

			<PasswordInput
				name="password"
				label={isOpenAI ? "OpenAI key" : "Proxy tokens"}
				labelPlacement="outside"
				placeholder={isOpenAI ? "Enter your OpenAI key" : "Enter your proxy tokens"}
				value={state.password}
				onValueChange={state.setPassword}
			/>
		</section>
	);
};

export default TopInput;
