import { NextResponse } from "next/server";
import { getDocumentService } from "@/services";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const service = await getDocumentService();
  const data = await service.getAll({
    category: category as import("@/types").DocumentCategory | undefined,
    search,
  });

  return NextResponse.json(data);
}
