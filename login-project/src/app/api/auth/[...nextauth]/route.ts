import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const noStore = (response: Response) => {
	response.headers.set("Cache-Control", "private, no-store, max-age=0");
	return response;
};

export async function GET(request: NextRequest) {
	return noStore(await handlers.GET(request));
}

export async function POST(request: NextRequest) {
	return noStore(await handlers.POST(request));
}