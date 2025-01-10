import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

const IMAGE_PLACEHOLDER = '[IMAGE]';

export function usePostManagement(posts, setPosts, saveAutoSave) {
  // Memoized function to get combined text for single post mode
  const getCombinedText = useMemo(() => {
    return posts
      .map((p, i) => {
        let text = p.text.trim();
        // Only add [IMAGE] placeholder if post has media and it's not already there
        if (p.mediaId && i > 0 && !text.includes(IMAGE_PLACEHOLDER)) {
          text = `${IMAGE_PLACEHOLDER}\n${text}`;
        }
        return text;
      })
      .filter(t => t)
      .join("\n---\n");
  }, [posts]);

  // Split text into posts while properly handling [IMAGE] placeholders
  const splitTextIntoPosts = useCallback((combinedText) => {
    const parts = combinedText
      .split("---")
      .map(t => t.trim())
      .filter(t => t);

    // Create new posts array
    const newPosts = parts.map((text, index) => {
      // Check if text contains [IMAGE] placeholder exactly
      const hasImagePlaceholder = text.includes(IMAGE_PLACEHOLDER);
      
      // Clean the text by removing the exact [IMAGE] placeholder and any following newline
      const cleanText = hasImagePlaceholder 
        ? text.replace(`${IMAGE_PLACEHOLDER}\n`, '').replace(IMAGE_PLACEHOLDER, '').trim()
        : text;

      // If this index existed in original posts and had media, keep its media
      // only if the exact [IMAGE] placeholder is present
      if (index < posts.length && posts[index].mediaId && hasImagePlaceholder) {
        return {
          text: cleanText,
          mediaId: posts[index].mediaId,
          mediaPreview: posts[index].mediaPreview
        };
      }

      return { text: cleanText, mediaId: null, mediaPreview: null };
    });

    return newPosts.length > 0 ? newPosts : [{ text: "", mediaId: null, mediaPreview: null }];
  }, [posts]);

  // Debounced autosave function
  const debouncedAutoSave = useMemo(
    () => debounce((posts) => {
      saveAutoSave(posts);
    }, 1000),
    [saveAutoSave]
  );

  // Handle text changes in both modes
  const handleTextChange = useCallback((index, value, isThreadMode) => {
    if (isThreadMode) {
      setPosts(currentPosts => {
        const newPosts = [...currentPosts];
        newPosts[index] = { ...newPosts[index], text: value };
        debouncedAutoSave(newPosts);
        return newPosts;
      });
    } else {
      const newPosts = splitTextIntoPosts(value);
      setPosts(newPosts);
      debouncedAutoSave(newPosts);
    }
  }, [setPosts, splitTextIntoPosts, debouncedAutoSave]);

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
    getCombinedText,
    handleTextChange,
    addThread,
    removeThread,
    cleanup
  };
}
