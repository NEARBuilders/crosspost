import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

const IMAGE_PLACEHOLDER = '[IMAGE]';

export function usePostManagement(posts, setPosts, saveAutoSave) {
  // Memoized function to get combined text for single post mode
  const getCombinedText = useMemo(() => {
    return posts
      .map((p, i) => {
        let text = p.text;
        // Only add [IMAGE] placeholder if post has media and it's not already there
        if (p.mediaId && i > 0 && !text.includes(IMAGE_PLACEHOLDER)) {
          text = `${IMAGE_PLACEHOLDER}\n${text}`;
        }
        return text;
      })
      .filter(t => t !== null && t !== undefined && t !== '')
      .join("\n---\n")
      .trim(); // Used when converting from thread mode to single mode
  }, [posts]);

  // Split text into posts while properly handling [IMAGE] placeholders
  const splitTextIntoPosts = useCallback((combinedText) => {
    // Split on "---" when it's on its own line
    const parts = combinedText
      .split(/\n---\n/)
      .map(t => t.trim()) // Trim each part to remove extra newlines
      .filter(t => t);

    // Create new posts array
    const newPosts = parts.map((text, index) => {
      // Check if text contains [IMAGE] placeholder exactly
      const hasImagePlaceholder = text.includes(IMAGE_PLACEHOLDER);
      
      // Clean the text by removing the exact [IMAGE] placeholder and any following newline
      const cleanText = hasImagePlaceholder 
        ? text.replace(`${IMAGE_PLACEHOLDER}\n`, '').replace(IMAGE_PLACEHOLDER, '').trim()
        : text;

      // Always preserve media from original posts if available
      if (index < posts.length) {
        return {
          text: cleanText,
          mediaId: posts[index].mediaId,
          mediaPreview: posts[index].mediaPreview
        };
      }

      return { text: cleanText, mediaId: null, mediaPreview: null };
    });

    // If we have fewer parts than original posts, preserve remaining posts' media
    if (parts.length < posts.length) {
      for (let i = parts.length; i < posts.length; i++) {
        if (posts[i].mediaId) {
          newPosts.push({
            text: "",
            mediaId: posts[i].mediaId,
            mediaPreview: posts[i].mediaPreview
          });
        }
      }
    }

    return newPosts.length > 0 ? newPosts : [{ text: "", mediaId: null, mediaPreview: null }];
  }, [posts]);

  // Debounced autosave function
  const debouncedAutoSave = useMemo(
    () => debounce((posts) => {
      saveAutoSave(posts);
    }, 1000),
    [saveAutoSave]
  );

  // Handle text changes
  const handleTextChange = useCallback((index, value) => {
    setPosts(currentPosts => {
      const newPosts = [...currentPosts];
      newPosts[index] = { ...newPosts[index], text: value };
      debouncedAutoSave(newPosts);
      return newPosts;
    });
  }, [setPosts, debouncedAutoSave]);

  // Convert between modes
  const convertToThread = useCallback((singleText) => {
    // Only split if there's a "---" surrounded by newlines
    if (singleText.includes("\n---\n")) {
      const newPosts = splitTextIntoPosts(singleText);
      setPosts(newPosts);
    } else {
      // If no splits, preserve the current post with its media preview and ID
      setPosts([{
        ...posts[0],
        mediaPreview: posts[0].mediaPreview,
        mediaId: posts[0].mediaId
      }]);
    }
  }, [splitTextIntoPosts, setPosts, posts]);

  const convertToSingle = useCallback(() => {
    // Preserve media preview and ID from the first post
    const firstPost = posts[0];
    const newPost = { 
      text: getCombinedText,
      mediaId: firstPost.mediaId,
      mediaPreview: firstPost.mediaPreview
    };
    setPosts([newPost]);
    debouncedAutoSave([newPost]);
  }, [getCombinedText, posts, setPosts, debouncedAutoSave]);

  // Thread management functions
  const addThread = useCallback(() => {
    setPosts(currentPosts => {
      const newPosts = [...currentPosts, { text: "", mediaId: null, mediaPreview: null }];
      debouncedAutoSave(newPosts);
      return newPosts;
    });
  }, [setPosts, debouncedAutoSave]);

  const removeThread = useCallback((index) => {
    setPosts(currentPosts => {
      if (currentPosts.length <= 1) return currentPosts;
      const newPosts = currentPosts.filter((_, i) => i !== index);
      debouncedAutoSave(newPosts);
      return newPosts;
    });
  }, [setPosts, debouncedAutoSave]);

  // Cleanup function
  const cleanup = useCallback(() => {
    debouncedAutoSave.cancel();
  }, [debouncedAutoSave]);

  return {
    handleTextChange,
    addThread,
    removeThread,
    cleanup,
    convertToThread,
    convertToSingle,
    getCombinedText
  };
}
