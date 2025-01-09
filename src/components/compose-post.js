import { useState } from "react";

// This "widget" handles all of the editing for post content
// Calls "onSubmit" with an array of post objects

export function ComposePost({ onSubmit }) {
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [posts, setPosts] = useState([{ text: "", image: null }]);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError("Failed to send post");
      console.error("Post error:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end mb-2">
        <button
          onClick={toggleMode}
          className="text-sm px-3 py-1 border-2 border-gray-800 hover:bg-gray-100 shadow-[2px_2px_0_rgba(0,0,0,1)]"
        >
          {isThreadMode ? "Single Post Mode" : "Thread Mode"}
        </button>
      </div>

      {isThreadMode ? (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div key={index} className="relative">
              <textarea
                value={post.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                placeholder={`Thread part ${index + 1}`}
                maxLength={280}
                className="w-full min-h-[150px] p-4 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-[2px_2px_0_rgba(0,0,0,1)]"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-500">
                  {post.text.length}/280 characters
                </span>
                {posts.length > 1 && (
                  <button
                    onClick={() => removeThread(index)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              {/* Future image upload UI would go here */}
            </div>
          ))}
          <button
            onClick={addThread}
            className="w-full py-2 border-2 border-gray-800 hover:bg-gray-100 shadow-[2px_2px_0_rgba(0,0,0,1)] text-sm"
          >
            + Add Thread
          </button>
        </div>
      ) : (
        <div>
          <textarea
            value={posts[0].text}
            onChange={(e) => handleTextChange(0, e.target.value)}
            placeholder="What's happening?"
            maxLength={280 * 10} // Allow for multiple tweets worth in single mode
            className="w-full min-h-[150px] p-4 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-[2px_2px_0_rgba(0,0,0,1)]"
          />
          {/* Future image upload UI would go here */}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {isThreadMode
            ? `${posts.length} parts`
            : `${posts[0].text.length} characters`}
        </span>
        <button
          onClick={handleSubmit}
          disabled={posts.every((p) => !p.text.trim())}
          className="flex items-center gap-2 px-6 py-2 border-2 border-gray-800 hover:bg-gray-100 shadow-[2px_2px_0_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
