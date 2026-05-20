import { NextResponse } from "next/server";
import { getMeetingService } from "@/services";

export async function GET() {
  const service = await getMeetingService();
  const data = await service.getAll();
  return NextResponse.json(data);
}
