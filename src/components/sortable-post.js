import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";

function SortablePostComponent({ post, index, onTextChange, onRemove, onMediaUpload, onMediaRemove }) {
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
    <div ref={setNodeRef} style={style} className="flex gap-2 sm:px-4 -mx-4 sm:mx-0">
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
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {post.text.length}/280 characters
            </span>
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
          
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => onMediaUpload(index, e.target.files[0])}
              className="hidden"
              id={`media-upload-${index}`}
            />
            <Button
              onClick={() => document.getElementById(`media-upload-${index}`).click()}
              size="sm"
              variant="outline"
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
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                  >
                    ×
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const SortablePost = memo(SortablePostComponent);
