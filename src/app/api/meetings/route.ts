import { NextResponse } from "next/server";
import { mockMeetingService } from "@/services";

export async function GET() {
  const data = await mockMeetingService.getAll();
  return NextResponse.json(data);
}
