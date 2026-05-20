import { NextResponse } from "next/server";
import { getAnnouncementService } from "@/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const priority = searchParams.get("priority") as "urgent" | "important" | "info" | null;
  const search = searchParams.get("search") ?? undefined;

  const service = await getAnnouncementService();
  const data = await service.getAll({
    priority: priority ?? undefined,
    search,
  });

  return NextResponse.json(data);
}
