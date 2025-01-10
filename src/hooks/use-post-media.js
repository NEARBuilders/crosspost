import { useCallback } from 'react';

export function usePostMedia(setPosts, setError, saveAutoSave) {
  const handleMediaUpload = useCallback(async (index, file) => {
    if (!file) return;

    // Create preview URL and store file data
    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    
    reader.onload = async () => {
      const base64Data = reader.result;
      setPosts(posts => {
        const newPosts = [...posts];
        newPosts[index] = { 
          ...newPosts[index], 
          mediaPreview: previewUrl,
          mediaData: base64Data // Store base64 data for persistence
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
            mediaId,
          };
          return newPosts;
        });
      } catch (error) {
        console.error('Media upload error:', error);
        setError('Failed to upload media');
        // Remove preview and data on error
        setPosts(posts => {
          const newPosts = [...posts];
          newPosts[index] = { 
            ...newPosts[index], 
            mediaPreview: null,
            mediaData: null
          };
          return newPosts;
        });
      }
    };

    reader.readAsDataURL(file);
  }, [setPosts, setError]);

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
        mediaPreview: null,
        mediaData: null
      };
      saveAutoSave(newPosts);
      return newPosts;
    });
  }, [setPosts, saveAutoSave]);

  // Recreate preview URLs from stored data
  const recreateMediaPreviews = useCallback(() => {
    setPosts(posts => {
      const newPosts = posts.map(post => {
        if (post.mediaData) {
          return {
            ...post,
            mediaPreview: post.mediaData // Use stored base64 data as preview
          };
        }
        return post;
      });
      return newPosts;
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
