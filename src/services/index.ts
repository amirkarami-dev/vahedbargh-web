import mockAnnouncementService from "./mock/announcements";
import mockMeetingService from "./mock/meetings";
import mockDocumentService from "./mock/documents";
import mockStatsService from "./mock/stats";

const provider = process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";

async function getAnnouncementService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/announcements");
    return mod.default;
  }
  return mockAnnouncementService;
}

async function getMeetingService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/meetings");
    return mod.default;
  }
  return mockMeetingService;
}

async function getDocumentService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/documents");
    return mod.default;
  }
  return mockDocumentService;
}

async function getStatsService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/stats");
    return mod.default;
  }
  return mockStatsService;
}

export { getAnnouncementService, getMeetingService, getDocumentService, getStatsService };
export { mockAnnouncementService, mockMeetingService, mockDocumentService, mockStatsService };
