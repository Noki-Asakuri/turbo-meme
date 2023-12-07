// import { Generate } from "./_components/Generate";
import dynamic from "next/dynamic";

const Generate = dynamic(
	() => import("./_components/Generate").then((conpoment) => ({ default: conpoment.Generate })),
	{ ssr: false },
);

export const runtime = "edge";

export default function Home() {
	return <Generate />;
}
