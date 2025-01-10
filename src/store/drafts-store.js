import { create } from "zustand";

const STORAGE_KEY = "crosspost_drafts";
const AUTOSAVE_KEY = "crosspost_autosave";
const MODE_KEY = "crosspost_mode";

const loadFromStorage = (key) => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    console.error(`Failed to load from ${key}:`, err);
    return null;
  }
};

const saveToStorage = (key, data) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save to ${key}:`, err);
  }
};

export const useDraftsStore = create((set, get) => ({
  drafts: loadFromStorage(STORAGE_KEY) || [],
  autosave: loadFromStorage(AUTOSAVE_KEY),
  isThreadMode: loadFromStorage(MODE_KEY) || false,
  isModalOpen: false,

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  setThreadMode: (isThreadMode) => {
    saveToStorage(MODE_KEY, isThreadMode);
    set({ isThreadMode });
  },

  saveDraft: (posts) => {
    const draft = {
      id: Date.now(),
      posts,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newDrafts = [draft, ...state.drafts];
      saveToStorage(STORAGE_KEY, newDrafts);
      return { drafts: newDrafts };
    });
  },

  deleteDraft: (id) => {
    set((state) => {
      const newDrafts = state.drafts.filter((d) => d.id !== id);
      saveToStorage(STORAGE_KEY, newDrafts);
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
    saveToStorage(AUTOSAVE_KEY, autosave);
    set({ autosave });
  },

  clearAutoSave: () => {
    localStorage.removeItem(AUTOSAVE_KEY);
    set({ autosave: null });
  },
}));
