import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface PostMedia {
  data: string; // Base64 encoded data or URL
  mimeType: string;
  altText?: string;
}

export interface PostContent {
  text: string;
  media?: PostMedia[];
  mediaId?: string | null;
  mediaPreview?: string | null;
}

export interface Draft {
  id: string;
  createdAt: string;
  updatedAt: string;
  posts: PostContent[];
}

interface DraftsState {
  drafts: Draft[];
  isModalOpen: boolean;
  autosave: { posts: PostContent[] } | null;
  addDraft: (posts: PostContent[]) => void;
  updateDraft: (id: string, posts: PostContent[]) => void;
  deleteDraft: (id: string) => void;
  setModalOpen: (isOpen: boolean) => void;
  saveAutoSave: (posts: PostContent[]) => void;
  clearAutoSave: () => void;
  saveDraft: (posts: PostContent[]) => string;
}

export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      drafts: [],
      isModalOpen: false,
      autosave: null,

      addDraft: (posts) => {
        const newDraft: Draft = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          posts,
        };

        set((state) => ({
          drafts: [newDraft, ...state.drafts],
        }));

        return newDraft.id;
      },

      saveDraft: (posts) => {
        const newDraft: Draft = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          posts,
        };

        set((state) => ({
          drafts: [newDraft, ...state.drafts],
        }));

        return newDraft.id;
      },

      updateDraft: (id, posts) => {
        set((state) => ({
          drafts: state.drafts.map((draft) =>
            draft.id === id
              ? {
                  ...draft,
                  posts,
                  updatedAt: new Date().toISOString(),
                }
              : draft,
          ),
        }));
      },

      deleteDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((draft) => draft.id !== id),
        }));
      },

      setModalOpen: (isOpen) => {
        set({ isModalOpen: isOpen });
      },

      saveAutoSave: (posts) => {
        set({ autosave: { posts } });
      },

      clearAutoSave: () => {
        set({ autosave: null });
      },
    }),
    {
      name: "crosspost-drafts",
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence across browser sessions
    },
  ),
);
