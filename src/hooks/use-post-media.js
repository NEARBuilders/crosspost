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
      newPosts[index] = { 
        ...newPosts[index], 
        mediaId: null, 
        mediaPreview: null
      };
      saveAutoSave(newPosts);
      return newPosts;
    });
  }, [setPosts, saveAutoSave]);

  return { handleMediaUpload, removeMedia };
}
