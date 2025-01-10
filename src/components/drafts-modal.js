import { motion, AnimatePresence } from "framer-motion";
import { useDraftsStore } from "../store/drafts-store";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";

export function DraftsModal({ onSelect }) {
  const { drafts, isModalOpen, setModalOpen, deleteDraft } = useDraftsStore();

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl border-2 border-gray-800 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Drafts</h2>
            <Button
              onClick={() => setModalOpen(false)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </Button>
          </div>

          {drafts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No drafts saved yet</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="border-2 border-gray-800 p-4 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(draft.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          onSelect(draft.posts);
                          setModalOpen(false);
                        }}
                        size="sm"
                      >
                        Load
                      </Button>
                      <Button
                        onClick={() => deleteDraft(draft.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-800">
                    {draft.posts.map((post, i) => (
                      <div key={i} className="mb-2">
                        {post.text.substring(0, 100)}
                        {post.text.length > 100 ? "..." : ""}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
