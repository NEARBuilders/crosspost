import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface SortablePostProps {
  post: {
    text: string;
    mediaId: string | null;
    mediaPreview: string | null;
  };
  index: number;
  onTextChange: (index: number, text: string) => void;
  onRemove?: (index: number) => void;
  onMediaUpload: (index: number, file: File) => void;
  onMediaRemove: (index: number) => void;
}

function SortablePostComponent({
  post,
  index,
  onTextChange,
  onRemove,
  onMediaUpload,
  onMediaRemove,
}: SortablePostProps) {
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
    <div ref={setNodeRef} style={style} className="flex gap-2 w-full">
      <div className="flex-none w-8">
        <div
          {...attributes}
          {...listeners}
          className="sticky top-0 h-[150px] w-8 flex items-center justify-center cursor-grab bg-gray-50 rounded-lg base-component touch-manipulation"
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
      <div className="flex-1 w-full">
        <Textarea
          value={post.text}
          onChange={(e) => onTextChange(index, e.target.value)}
          placeholder={`Thread part ${index + 1}`}
          className={`min-h-[150px] w-full rounded-lg resize-none focus:ring-2 focus:ring-blue-500 ${
            post.text.length > 280 ? "border-destructive" : ""
          }`}
        />
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex flex-row flex-wrap gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onMediaUpload(index, e.target.files[0]);
                  }
                }}
                className="hidden"
                id={`media-upload-${index}`}
              />
              <Button
                onClick={() =>
                  document.getElementById(`media-upload-${index}`)?.click()
                }
                size="sm"
                disabled={post.mediaId !== null}
              >
                Add Media
              </Button>
              {post.mediaPreview && (
                <>
                  <div className="relative">
                    <img
                      src={post.mediaPreview}
                      alt="Preview"
                      className="h-10 w-10 object-cover rounded"
                    />
                    <Button
                      onClick={() => onMediaRemove(index)}
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    >
                      ×
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-sm ${post.text.length > 280 ? "text-destructive" : "text-gray-500"}`}
              >
                {post.text.length}/280 characters
              </span>
              <Button onClick={() => onTextChange(index, "")} size="sm">
                Clear
              </Button>
              {onRemove && (
                <Button
                  onClick={() => onRemove(index)}
                  variant="destructive"
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SortablePost = memo(SortablePostComponent);
