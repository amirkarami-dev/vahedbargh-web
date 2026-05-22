import mockAnnouncementService from "./mock/announcements";
import mockMeetingService from "./mock/meetings";
import mockDocumentService from "./mock/documents";
import mockStatsService from "./mock/stats";
import mockSettingsService from "./mock/settings";
import mockEngineersService from "./mock/engineers";
import mockProjectsService from "./mock/projects";
import mockAccountingService from "./mock/accounting";
import mockTariffsService from "./mock/tariffs";
import mockSupportService from "./mock/support";
import mockQuotasService from "./mock/quotas";

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

async function getSettingsService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/settings");
    return mod.default;
  }
  return mockSettingsService;
}

async function getEngineersService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/engineers");
    return mod.default;
  }
  return mockEngineersService;
}

async function getProjectsService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/projects");
    return mod.default;
  }
  return mockProjectsService;
}

async function getAccountingService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/accounting");
    return mod.default;
  }
  return mockAccountingService;
}

async function getTariffsService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/tariffs");
    return mod.default;
  }
  return mockTariffsService;
}

async function getSupportService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/support");
    return mod.default;
  }
  return mockSupportService;
}

async function getQuotasService() {
  if (provider === "supabase") {
    const mod = await import("./supabase/quotas");
    return mod.default;
  }
  return mockQuotasService;
}

export { getAnnouncementService, getMeetingService, getDocumentService, getStatsService, getSettingsService };
export { getEngineersService, getProjectsService, getAccountingService, getTariffsService, getSupportService, getQuotasService };
export { mockAnnouncementService, mockMeetingService, mockDocumentService, mockStatsService, mockSettingsService };
