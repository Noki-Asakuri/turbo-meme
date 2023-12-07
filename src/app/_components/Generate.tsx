"use client";

import { userInputStore } from "~/store/state";
import { api } from "~/trpc/react";

import { PasswordInput } from "./PasswordInput";

import { Button, ButtonGroup, Image, Input, Select, SelectItem, Textarea, cn } from "@nextui-org/react";

import toast from "react-hot-toast";
import { useStore } from "zustand";

export const Generate = () => {
	const state = useStore(userInputStore, (state) => state);
	const isOpenAI = state.url.startsWith("https://api.openai.com");

	const generate = api.images.create.useMutation({
		onError: ({ message }) => toast.error(message),
		onSuccess: (data) => {
			if (!window.indexedDB) return toast.error(`Your browser doesn't support IndexedDB`);

			const request = indexedDB.open("images", 3);
			const id = data.url.split("/").pop()!;

			request.onupgradeneeded = (event) => {
				// @ts-expect-error TS doesn't know about `result`
				const db = event.target!.result as IDBDatabase;

				if (!db.objectStoreNames.contains("images")) {
					const store = db.createObjectStore("images", { autoIncrement: true });
					store.createIndex("id", "id", { unique: true });
				}
			};

			request.onsuccess = () => {
				const transaction = request.result.transaction("images", "readwrite");
				const store = transaction.objectStore("images");

				store.put({ id, date: new Date(), base64: data.b64_json }, id.slice(0, -4));
			};
		},
	});

	return (
		<main className="container max-w-7xl @container/main">
			<div className="min-h-screen space-y-4 py-4">
				<section className="flex w-full flex-col gap-4">
					<Input
						name="url"
						type="url"
						isRequired
						label="Endpoint URL"
						labelPlacement="outside"
						placeholder="Enter your proxy url here"
						value={state.url}
						defaultValue={"https://api.openai.com/v1"}
						onValueChange={state.setUrl}
					/>

					<PasswordInput
						name="password"
						label={isOpenAI ? "OpenAI key" : "Proxy tokens"}
						labelPlacement="outside"
						placeholder={isOpenAI ? "Enter your OpenAI key" : "Enter your proxy tokens"}
						value={state.password}
						defaultValue={""}
						isRequired={isOpenAI}
						onValueChange={state.setPassword}
					/>
				</section>

				<hr />

				<section className="flex flex-col gap-4 lg:flex-row">
					<section className="order-2 space-y-2 lg:order-1 lg:w-1/2">
						<div className="grid grid-cols-2 gap-2 @md/main:grid-cols-3">
							<Select
								label="Model"
								value={state.model}
								disallowEmptySelection
								labelPlacement="outside"
								defaultSelectedKeys={[state.model]}
								className="col-span-2 @md/main:col-span-1"
								onChange={(e) => state.setModel(e.target.value as typeof state.model)}
							>
								<SelectItem key="dall-e-3">Dall-e-3</SelectItem>
								<SelectItem key="dall-e-2">Dall-e-2</SelectItem>
							</Select>

							<Select
								label="Quality"
								value={state.quality}
								disallowEmptySelection
								labelPlacement="outside"
								isDisabled={state.model === "dall-e-2"}
								defaultSelectedKeys={[state.quality]}
								onChange={(e) => state.setQuality(e.target.value as typeof state.quality)}
							>
								<SelectItem key="standard">Standard</SelectItem>
								<SelectItem key="hd">HD</SelectItem>
							</Select>

							<Select
								label="Style"
								labelPlacement="outside"
								disallowEmptySelection
								value={state.style}
								isDisabled={state.model === "dall-e-2"}
								defaultSelectedKeys={[state.style]}
								onChange={(e) => state.setStyle(e.target.value as typeof state.style)}
							>
								<SelectItem key="vivid">Vivid</SelectItem>
								<SelectItem key="natural">Natural</SelectItem>
							</Select>

							<Select
								label="Response Format"
								labelPlacement="outside"
								disallowEmptySelection
								value={state.response_format}
								disabledKeys={!isOpenAI ? ["url"] : undefined}
								defaultSelectedKeys={[state.response_format]}
								onChange={(e) =>
									state.setResponseFormat(e.target.value as typeof state.response_format)
								}
							>
								<SelectItem key="url">URL</SelectItem>
								<SelectItem key="b64_json">Base64 JSON</SelectItem>
							</Select>

							<Select
								label="Image Size"
								labelPlacement="outside"
								disallowEmptySelection
								defaultSelectedKeys={[state.size]}
								value={state.size}
								items={
									state.model === "dall-e-2"
										? [{ key: "256x256" }, { key: "512x512" }, { key: "1024x1024" }]
										: [{ key: "1024x1024" }, { key: "1792x1024" }, { key: "1024x1792" }]
								}
								onChange={(e) => state.setSize(e.target.value as typeof state.size)}
							>
								{(item) => <SelectItem key={item.key}>{item.key}</SelectItem>}
							</Select>

							<Input
								name="user"
								label="User"
								value={state.user}
								isDisabled={!isOpenAI}
								labelPlacement="outside"
								placeholder="Enter your name"
								onValueChange={state.setUser}
								className="col-span-2 @md/main:col-span-1"
							/>
						</div>

						<Textarea
							name="prompt"
							label="Prompt"
							isRequired
							labelPlacement="outside"
							placeholder="Enter your prompts here"
							defaultValue={""}
							classNames={{ input: "resize-y" }}
							value={state.prompt}
							onValueChange={state.setPrompt}
						/>
					</section>

					<section className="order-1 lg:order-2 lg:w-1/2">
						<div className="flex w-full flex-col items-center gap-2">
							<ButtonGroup fullWidth radius="lg">
								<Button className="w-1/3" color="warning" onPress={() => state.reset()}>
									Reset
								</Button>
								<Button
									color="primary"
									onPress={() => generate.mutate(state)}
									isLoading={generate.isLoading}
								>
									{generate.isLoading ? "Generating..." : "Generate"}
								</Button>
							</ButtonGroup>

							<div
								className={cn(
									"order-1 aspect-video w-full lg:order-2 lg:aspect-square",
									"flex items-start justify-center",
									{ "rounded-large border border-default shadow-large": !generate.isSuccess },
								)}
							>
								{generate.isSuccess && (
									<Image
										removeWrapper
										alt={generate.data.revised_prompt}
										src={`data:image/png;base64,${generate.data.b64_json}`}
										style={{
											aspectRatio: `${generate.data.size.width} / ${generate.data.size.height}`,
										}}
									/>
								)}
							</div>
						</div>
					</section>
				</section>
			</div>
		</main>
	);
};
