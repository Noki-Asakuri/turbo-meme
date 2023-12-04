import { createEnv } from "@t3-oss/env-nextjs";

import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
	},
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},
	experimental__runtimeEnv: {},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
