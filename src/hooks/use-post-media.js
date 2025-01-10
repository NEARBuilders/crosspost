import { useCallback } from 'react';

export function usePostMedia(setPosts, setError, saveAutoSave) {
  const handleMediaUpload = useCallback(async (index, file) => {
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setPosts(posts => {
      const newPosts = [...posts];
      newPosts[index] = { 
        ...newPosts[index], 
        mediaPreview: previewUrl
      };
      return newPosts;
    });

    // Upload to Twitter
    try {
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch('/api/twitter/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { mediaId } = await response.json();
      
      setPosts(posts => {
        const newPosts = [...posts];
        newPosts[index] = { 
          ...newPosts[index], 
          mediaId
        };
        saveAutoSave(newPosts);
        return newPosts;
      });
    } catch (error) {
      console.error('Media upload error:', error);
      setError('Failed to upload media');
      // Remove preview on error
      setPosts(posts => {
        const newPosts = [...posts];
        newPosts[index] = { 
          ...newPosts[index], 
          mediaPreview: null,
          mediaId: null
        };
        return newPosts;
      });
    }
  }, [setPosts, setError, saveAutoSave]);

  const removeMedia = useCallback((index) => {
    setPosts(posts => {
      const newPosts = [...posts];
      if (newPosts[index].mediaPreview) {
        if (newPosts[index].mediaPreview.startsWith('blob:')) {
          URL.revokeObjectURL(newPosts[index].mediaPreview);
        }
      }
      newPosts[index] = { 
        ...newPosts[index], 
        mediaId: null, 
        mediaPreview: null
      };
      saveAutoSave(newPosts);
      return newPosts;
    });
  }, [setPosts, saveAutoSave]);

  // Recreate preview URLs if needed
  const recreateMediaPreviews = useCallback(() => {
    // Since we're not storing base64 data anymore, this is mainly for cleanup
    setPosts(posts => {
      return [...posts]; // Trigger re-render while preserving existing previews
    });
  }, [setPosts]);

  // Cleanup function for object URLs
  const cleanupMediaPreviews = useCallback(() => {
    setPosts(posts => {
      posts.forEach(post => {
        if (post.mediaPreview && post.mediaPreview.startsWith('blob:')) {
          URL.revokeObjectURL(post.mediaPreview);
        }
      });
      return posts;
    });
  }, [setPosts]);

  return { handleMediaUpload, removeMedia, cleanupMediaPreviews, recreateMediaPreviews };
}
