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

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      drafts: [],
      autosave: null,
      isThreadMode: false,
      isModalOpen: false,
    };
  }

  return {
    drafts: loadFromStorage(STORAGE_KEY) || [],
    autosave: loadFromStorage(AUTOSAVE_KEY),
    isThreadMode: loadFromStorage(MODE_KEY) || false,
    isModalOpen: false,
  };
};

export const useDraftsStore = create((set, get) => ({
  ...getInitialState(),

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

  setThreadMode: (isThreadMode) => {
    try {
      saveToStorage(MODE_KEY, isThreadMode);
      set({ isThreadMode });
    } catch (err) {
      console.error("Failed to save thread mode:", err);
      // Still update state even if storage fails
      set({ isThreadMode });
    }
  },

  saveDraft: (posts) => {
    try {
      // Validate posts
      if (
        !Array.isArray(posts) ||
        posts.length === 0 ||
        posts.every((p) => !p?.text?.trim())
      ) {
        return;
      }

      // Clean posts data before saving
      const cleanPosts = posts.map((post) => ({
        text: post.text || "",
        mediaId: post.mediaId || null,
        mediaPreview: post.mediaPreview || null,
      }));

      const draft = {
        id: Date.now(),
        posts: cleanPosts,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        const newDrafts = [draft, ...state.drafts];
        saveToStorage(STORAGE_KEY, newDrafts);
        return { drafts: newDrafts };
      });
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  },

  deleteDraft: (id) => {
    try {
      set((state) => {
        const newDrafts = state.drafts.filter((d) => d.id !== id);
        saveToStorage(STORAGE_KEY, newDrafts);
        return { drafts: newDrafts };
      });
    } catch (err) {
      console.error("Failed to delete draft:", err);
    }
  },

  saveAutoSave: (posts) => {
    try {
      // Validate posts
      if (
        !Array.isArray(posts) ||
        posts.length === 0 ||
        posts.every((p) => !p?.text?.trim())
      ) {
        localStorage.removeItem(AUTOSAVE_KEY);
        set({ autosave: null });
        return;
      }

      // Clean posts data before saving
      const cleanPosts = posts.map((post) => ({
        text: post.text || "",
        mediaId: post.mediaId || null,
        mediaPreview: post.mediaPreview || null,
      }));

      const autosave = {
        posts: cleanPosts,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(AUTOSAVE_KEY, autosave);
      set({ autosave });
    } catch (err) {
      console.error("Failed to save autosave:", err);
      // Attempt to clear autosave on error
      try {
        localStorage.removeItem(AUTOSAVE_KEY);
        set({ autosave: null });
      } catch {} // Ignore any errors during cleanup
    }
  },

  clearAutoSave: () => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
      set({ autosave: null });
    } catch (err) {
      console.error("Failed to clear autosave:", err);
      // Still clear state even if storage fails
      set({ autosave: null });
    }
  },
}));
