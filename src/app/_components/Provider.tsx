"use client";

import { TRPCReactProvider } from "~/trpc/react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { NextUIProvider } from "@nextui-org/react";

import type { ReactNode } from "react";

export const Provider = ({ cookies, children }: { cookies: string; children: ReactNode }) => {
	return (
		<TRPCReactProvider cookies={cookies}>
			<NextUIProvider>
				<NextThemesProvider attribute="class" defaultTheme="dark">
					{children}
				</NextThemesProvider>
			</NextUIProvider>
		</TRPCReactProvider>
	);
};
