import { useState, useEffect } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortablePost({ post, index, onTextChange, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `post-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 sm:px-4 -mx-4 sm:mx-0"
    >
      <div className="flex-none w-8">
        <div
          {...attributes}
          {...listeners}
          className="sticky top-0 h-[150px] w-8 flex items-center justify-center cursor-grab bg-gray-50 rounded-lg border-2 border-gray-800 shadow-[2px_2px_0_rgba(0,0,0,1)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </div>
      </div>
      <div className="flex-1">
        <textarea
          value={post.text}
          onChange={(e) => onTextChange(index, e.target.value)}
          placeholder={`Thread part ${index + 1}`}
          maxLength={280}
          className="w-full min-h-[150px] px-4 py-4 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-[2px_2px_0_rgba(0,0,0,1)]"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-500">
            {post.text.length}/280 characters
          </span>
          <Button
            onClick={() => onRemove(index)}
            variant="destructive"
            size="sm"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

// This "widget" handles all of the editing for post content
// Calls "onSubmit" with an array of post objects

export function ComposePost({ onSubmit }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [isThreadMode, setIsThreadMode] = useState(false);
  const [posts, setPosts] = useState([{ text: "", image: null }]);
  const [error, setError] = useState("");
  const { setModalOpen, saveDraft, saveAutoSave, clearAutoSave, autosave } =
    useDraftsStore();

  // Load auto-saved content on mount
  useEffect(() => {
    if (autosave?.posts?.length > 0) {
      setPosts(autosave.posts);
      setIsThreadMode(autosave.posts.length > 1);
    }
  }, []);

  // Auto-save every 5 seconds if content has changed
  useEffect(() => {
    const timer = setInterval(() => {
      saveAutoSave(posts);
    }, 5000);

    return () => {
      clearInterval(timer);
      saveAutoSave(posts);
    };
  }, [posts, saveAutoSave]);

  const handleTextChange = (index, value) => {
    const newPosts = [...posts];
    newPosts[index] = { ...newPosts[index], text: value };
    setPosts(newPosts);
  };

  const addThread = () => {
    setPosts([...posts, { text: "", image: null }]);
  };

  const removeThread = (index) => {
    if (posts.length > 1) {
      const newPosts = posts.filter((_, i) => i !== index);
      setPosts(newPosts);
    }
  };

  const toggleMode = () => {
    setIsThreadMode(!isThreadMode);
    if (!isThreadMode) {
      // Converting single post to multiple
      const text = posts[0].text;
      // Only split if there's actual content and it contains ---
      if (text.trim() && text.includes("---")) {
        const threads = text
          .split("---")
          .map((t) => t.trim())
          .filter((t) => t)
          .map((text) => ({ text, image: null }));
        setPosts(threads.length > 0 ? threads : [{ text: "", image: null }]);
      }
    } else {
      // Converting multiple posts to single
      const combinedText = posts
        .map((p) => p.text)
        .filter((t) => t.trim())
        .join("\n---\n");
      setPosts([{ text: combinedText, image: null }]);
    }
  };

  const handleSubmit = async () => {
    const nonEmptyPosts = posts.filter((p) => p.text.trim());
    if (nonEmptyPosts.length === 0) {
      setError("Please enter your post text");
      return;
    }
    try {
      setError("");
      // If not in thread mode, just submit the first post's content
      const finalPosts = isThreadMode ? nonEmptyPosts : [posts[0]];
      await onSubmit(finalPosts);
      setPosts([{ text: "", image: null }]);
      clearAutoSave();
    } catch (err) {
      setError("Failed to send post");
      console.error("Post error:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2 mb-2">
        <Button onClick={() => setModalOpen(true)} size="sm">
          Drafts
        </Button>
        <Button onClick={toggleMode} size="sm">
          {isThreadMode ? "Single Post Mode" : "Thread Mode"}
        </Button>
      </div>

      {isThreadMode ? (
        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (over && active.id !== over.id) {
                const oldIndex = parseInt(active.id.split("-")[1]);
                const newIndex = parseInt(over.id.split("-")[1]);
                setPosts((posts) => arrayMove(posts, oldIndex, newIndex));
              }
            }}
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
            maxLength={280 * 10} // Allow for multiple tweets worth in single mode
            className="w-full min-h-[150px] px-4 py-4 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-[2px_2px_0_rgba(0,0,0,1)]"
          />
          {/* Future image upload UI would go here */}
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
            onClick={() => saveDraft(posts)}
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
