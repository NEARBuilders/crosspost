import * as React from "react";
import { motion } from "framer-motion";
import { useDraftsStore, PostContent } from "../store/drafts-store";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { ModalWindowControls } from "./modal-window-controls";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface DraftsModalProps {
  onSelect: (posts: PostContent[]) => void;
}

export function DraftsModal({
  onSelect,
}: DraftsModalProps): React.ReactElement {
  const { drafts, isModalOpen, setModalOpen, deleteDraft } = useDraftsStore();

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="border-none bg-transparent p-0 shadow-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-[calc(100%-0.5rem)] sm:w-full max-w-2xl mx-auto border-2 border-gray-800 bg-white shadow-[2px_2px_0_rgba(0,0,0,1)] sm:shadow-[4px_4px_0_rgba(0,0,0,1)]"
        >
          <ModalWindowControls onClose={() => setModalOpen(false)} />
          <div className="p-3 sm:p-6">
            <DialogHeader>
              <VisuallyHidden.Root>
                <DialogTitle className="font-mono text-2xl font-bold">
                  Drafts
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  View and manage your saved draft posts
                </DialogDescription>
              </VisuallyHidden.Root>
            </DialogHeader>

            {drafts.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No drafts saved yet
              </p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  View and manage your saved draft posts
                </p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="border-2 border-gray-800 p-3 sm:p-4 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-50"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
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
              </>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
