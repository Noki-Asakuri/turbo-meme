"use client";

import { Input, type InputProps } from "@nextui-org/react";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export const PasswordInput = (props: InputProps) => {
	const [hidden, setHidden] = useState(true);

	return (
		<Input
			{...props}
			type={hidden ? "password" : "text"}
			endContent={
				<button onClick={() => setHidden((prev) => !prev)}>
					{hidden ? <EyeOff size={16} /> : <Eye size={16} />}
				</button>
			}
		/>
	);
};
