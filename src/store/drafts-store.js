import { create } from "zustand";

const STORAGE_KEY = "crosspost_drafts";

const loadDrafts = () => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Failed to load drafts:", err);
    return [];
  }
};

const saveDrafts = (drafts) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.error("Failed to save drafts:", err);
  }
};

export const useDraftsStore = create((set, get) => ({
  drafts: loadDrafts(),
  isModalOpen: false,

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  saveDraft: (posts) => {
    const draft = {
      id: Date.now(),
      posts,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newDrafts = [draft, ...state.drafts];
      saveDrafts(newDrafts);
      return { drafts: newDrafts };
    });
  },

  deleteDraft: (id) => {
    set((state) => {
      const newDrafts = state.drafts.filter((d) => d.id !== id);
      saveDrafts(newDrafts);
      return { drafts: newDrafts };
    });
  },
}));
