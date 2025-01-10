import { useState, useEffect, useCallback } from "react";
import { useDraftsStore } from "../store/drafts-store";
import { DraftsModal } from "./drafts-modal";
import { Button } from "./ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePost } from "./sortable-post";
import { usePostMedia } from "../hooks/use-post-media";
import { usePostManagement } from "../hooks/use-post-management";

export function ComposePost({ onSubmit }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [posts, setPosts] = useState([{ text: "", mediaId: null, mediaPreview: null }]);
  const [error, setError] = useState("");
  const { 
    setModalOpen, 
    saveDraft, 
    saveAutoSave, 
    clearAutoSave, 
    autosave,
    isThreadMode,
    setThreadMode
  } = useDraftsStore();

  // Memoized draft save handler
  const handleSaveDraft = useCallback(() => {
    saveDraft(posts);
  }, [saveDraft, posts]);

  // Load auto-saved content on mount and handle cleanup
  useEffect(() => {
    if (autosave?.posts?.length > 0) {
      setPosts(autosave.posts);
    }

    return () => {
      cleanupMediaPreviews();
      cleanup();
    };
  }, [autosave, cleanupMediaPreviews, cleanup]);

  // Custom hooks
  const { handleMediaUpload, removeMedia, cleanupMediaPreviews, recreateMediaPreviews } = usePostMedia(setPosts, setError, saveAutoSave);
  const { 
    handleTextChange, 
    addThread, 
    removeThread, 
    cleanup,
    convertToThread,
    convertToSingle
  } = usePostManagement(
    posts, 
    setPosts, 
    saveAutoSave
  );

  // Memoized handlers
  const handleModalOpen = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const handleModeToggle = useCallback(() => {
    if (isThreadMode) {
      convertToSingle();
      setThreadMode(false);
    } else {
      convertToThread(posts[0].text);
      setThreadMode(true);
    }
    // Recreate previews and save after mode switch
    setTimeout(() => {
      recreateMediaPreviews();
      // Use latest posts state when saving
      setPosts(currentPosts => {
        saveAutoSave(currentPosts);
        return currentPosts;
      });
    }, 0);
  }, [isThreadMode, convertToSingle, convertToThread, posts, setThreadMode, recreateMediaPreviews, saveAutoSave]);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.split("-")[1]);
      const newIndex = parseInt(over.id.split("-")[1]);
      setPosts((posts) => arrayMove(posts, oldIndex, newIndex));
    }
  }, []);

  const handleMediaInputClick = useCallback(() => {
    document.getElementById('media-upload-single').click();
  }, []);

  const handleSingleMediaUpload = useCallback((e) => {
    handleMediaUpload(0, e.target.files[0]);
  }, [handleMediaUpload]);

  const handleSingleMediaRemove = useCallback(() => {
    removeMedia(0);
  }, [removeMedia]);

  const handleSubmit = useCallback(async () => {
    const nonEmptyPosts = posts.filter((p) => p.text.trim());
    if (nonEmptyPosts.length === 0) {
      setError("Please enter your post text");
      return;
    }
    try {
      setError("");
      await onSubmit(nonEmptyPosts);
      setPosts([{ text: "", mediaId: null, mediaPreview: null }]);
      clearAutoSave();
    } catch (err) {
      setError("Failed to send post");
      console.error("Post error:", err);
    }
  }, [clearAutoSave, onSubmit, posts, setError]);

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2 mb-2">
        <Button onClick={handleModalOpen} size="sm">
          Drafts
        </Button>
        <Button onClick={handleModeToggle} size="sm">
          {isThreadMode ? "Single Post Mode" : "Thread Mode"}
        </Button>
      </div>

      {isThreadMode ? (
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={posts.map((_, i) => `post-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              {posts.map((post, index) => (
                <SortablePost
                  key={`post-${index}`}
                  post={post}
                  index={index}
                  onTextChange={handleTextChange}
                  onMediaUpload={handleMediaUpload}
                  onMediaRemove={removeMedia}
                  onRemove={posts.length > 1 ? removeThread : undefined}
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button onClick={addThread} className="w-full" size="sm">
            + Add Thread
          </Button>
        </div>
      ) : (
        <div className="sm:px-4 -mx-4 sm:mx-0">
          <textarea
            value={posts[0].text}
            onChange={(e) => handleTextChange(0, e.target.value)}
            placeholder="What's happening?"
            maxLength={280 * posts.length} // Allow for multiple tweets worth in single mode
            className="w-full min-h-[150px] px-4 py-4 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-[2px_2px_0_rgba(0,0,0,1)]"
          />
          <div className="mt-2">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleSingleMediaUpload}
              className="hidden"
              id="media-upload-single"
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleMediaInputClick}
                size="sm"
                variant="outline"
                disabled={posts[0].mediaId !== null}
              >
                Add Media
              </Button>
              {posts[0].mediaPreview && (
                <div className="relative">
                  <img 
                    src={posts[0].mediaPreview} 
                    alt="Preview" 
                    className="h-10 w-10 object-cover rounded"
                  />
                  <Button
                    onClick={handleSingleMediaRemove}
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center gap-2">
        <span className="text-sm text-gray-500">
          {isThreadMode
            ? `${posts.length} parts`
            : `${posts[0].text.length} characters`}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={handleSaveDraft}
            disabled={posts.every((p) => !p.text.trim())}
          >
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={posts.every((p) => !p.text.trim())}
          >
            Post
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <DraftsModal onSelect={setPosts} />
    </div>
  );
}
