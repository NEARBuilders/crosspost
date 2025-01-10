import { create } from "zustand";

const STORAGE_KEY = "crosspost_drafts";
const AUTOSAVE_KEY = "crosspost_autosave";

const loadDrafts = (key = STORAGE_KEY) => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error("Failed to load drafts:", err);
    return [];
  }
};

const saveDrafts = (drafts, key = STORAGE_KEY) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(drafts));
  } catch (err) {
    console.error("Failed to save drafts:", err);
  }
};

export const useDraftsStore = create((set, get) => ({
  drafts: loadDrafts(),
  autosave: loadDrafts(AUTOSAVE_KEY),
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

  saveAutoSave: (posts) => {
    if (posts.every((p) => !p.text.trim())) {
      // If all posts are empty, clear autosave
      localStorage.removeItem(AUTOSAVE_KEY);
      set({ autosave: null });
      return;
    }

    const autosave = {
      posts,
      updatedAt: new Date().toISOString(),
    };
    saveDrafts(autosave, AUTOSAVE_KEY);
    set({ autosave });
  },

  clearAutoSave: () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    set({ autosave: null });
  },
}));
