import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { z } from "zod";

const endpointInputs = z
	.object({
		url: z
			.string()
			.url()
			.transform((val) => (val.endsWith("/") ? val.slice(0, -1) : val))
			.refine((url) => url.endsWith("/v1"), { message: "Url must end with /v1" }),

		password: z.string().optional(),
	})
	.refine(
		(input) => {
			if (input.url.startsWith("https://api.openai.com/v1")) {
				return input.password?.startsWith("sk-");
			}
			return true;
		},
		{ message: "Password must start with sk-", path: ["password"] },
	)
	.transform((val) => ({
		url: val.url + "/images/generations",
		password: "Bearer " + val.password,
		isOpenAI: val.url.startsWith("https://api.openai.com"),
	}));

const size = z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]);

const generateData = z.object({
	model: z.union([z.literal("dall-e-3"), z.literal("dall-e-2")]).default("dall-e-2"),
	prompt: z.string().min(1),
	n: z.number().positive().default(1),
	quality: z.union([z.literal("standard"), z.literal("hd")]).default("standard"),
	response_format: z.union([z.literal("b64_json"), z.literal("url")]).default("url"),
	size: size.default("1024x1024"),
	style: z.union([z.literal("vivid"), z.literal("natural")]).default("vivid"),
	user: z.string().optional(),
});

const generateInputs = endpointInputs.and(generateData).superRefine((input, ctx) => {
	if (!input.url.startsWith("https://api.openai.com")) {
		if (input.response_format === "url") {
			ctx.addIssue({
				code: "invalid_literal",
				expected: "b64_json",
				received: "url",
				message: "Response format must be Base64 JSON when using a proxy",
			});
		}

		if (input.n > 1) {
			ctx.addIssue({
				code: "too_big",
				inclusive: true,
				maximum: 1,
				type: "number",
				message: "Max number of images for proxy is 1",
			});
		}
	}

	switch (true) {
		case input.model === "dall-e-3": {
			const validSizes = ["1024x1024", "1792x1024", "1024x1792"];

			if (!validSizes.includes(input.size)) {
				ctx.addIssue({
					code: "unrecognized_keys",
					keys: validSizes,
					message: "Valid sizes for model dall-e-3 are 1024x1024, 1792x1024, 1024x1792",
				});
			}

			if (input.n > 1) {
				ctx.addIssue({
					code: "too_big",
					inclusive: true,
					maximum: 1,
					type: "number",
					message: "Max number of images for model dall-e-3 is 1",
				});
			}

			if (input.prompt.length > 4000) {
				ctx.addIssue({
					code: "too_big",
					inclusive: true,
					maximum: 4000,
					type: "string",
					message: "Max length for model dall-e-3 is 4000",
				});
			}

			break;
		}

		case input.model === "dall-e-2": {
			const validSizes = ["256x256", "512x512", "1024x1024"];

			if (!validSizes.includes(input.size)) {
				ctx.addIssue({
					code: "unrecognized_keys",
					keys: validSizes,
					message: "Valid sizes for model dall-e-2 are 256x256, 512x512, 1024x1024",
				});
			}

			if (input.prompt.length > 1000) {
				ctx.addIssue({
					code: "too_big",
					inclusive: true,
					maximum: 1000,
					type: "string",
					message: "Max length for model dall-e-2 is 1000",
				});
			}

			break;
		}
	}
});

export const images = createTRPCRouter({
	create: publicProcedure.input(generateInputs).mutation(async ({ input }) => {
		console.log(input);

		const size = input.size.split("x");
		const body: Record<string, unknown> = {
			model: input.model,
			prompt: input.prompt,
			n: input.n,
			quality: input.quality,
			response_format: input.response_format,
			size: input.size,
			style: input.style,
			user: input.user,
		};

		if (input.model === "dall-e-2") {
			delete body.quality;
			delete body.style;
		}

		if (!input.isOpenAI) {
			delete body.user;
		}

		const res = await fetch(input.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: input.password,
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const { error } = (await res
				.json()
				.catch(() => ({ error: { code: res.status, message: res.statusText } }))) as {
				error: { code: number | string; message: string };
			};

			throw new Error(`Error ${res.status}: ${error.message}`);
		}

		const { data } = (await res.json()) as {
			data: {
				revised_prompt: string;
				url: string;
				b64_json?: string;
			}[];
		};

		return { ...data.at(0)!, size: { width: parseInt(size.at(0)!), height: parseInt(size.at(1)!) } };
	}),
});
