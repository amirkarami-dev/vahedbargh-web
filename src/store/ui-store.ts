import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfirmDialog { open: boolean; title: string; description: string; onConfirm: () => void; }

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  confirmDialog: ConfirmDialog | null;
  openConfirm: (opts: Omit<ConfirmDialog, "open">) => void;
  closeConfirm: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      confirmDialog: null,
      openConfirm: (opts) => set({ confirmDialog: { ...opts, open: true } }),
      closeConfirm: () => set({ confirmDialog: null }),
    }),
    { name: "kurdnezam-ui", partialize: (s) => ({ sidebarOpen: s.sidebarOpen }) }
  )
);
