import { NextResponse } from "next/server";
import { mockAnnouncementService } from "@/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priority = searchParams.get("priority") as "urgent" | "important" | "info" | null;
  const search = searchParams.get("search") ?? undefined;

  const data = await mockAnnouncementService.getAll({
    priority: priority ?? undefined,
    search,
  });

  return NextResponse.json(data);
}
