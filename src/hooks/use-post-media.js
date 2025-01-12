import { useCallback } from "react";

export function usePostMedia(setPosts, setError, saveAutoSave) {
  const handleMediaUpload = useCallback(
    async (index, file) => {
      if (!file) return;

      let currentPosts;

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      setPosts((posts) => {
        currentPosts = [...posts];
        currentPosts[index] = {
          ...currentPosts[index],
          mediaPreview: previewUrl,
        };
        return currentPosts;
      });

      // Upload to Twitter
      try {
        // Validate file type based on Twitter's supported formats
        const supportedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const supportedVideoTypes = ['video/mp4'];
        
        if (!supportedImageTypes.includes(file.type) && !supportedVideoTypes.includes(file.type)) {
          throw new Error("Unsupported file type. Twitter supports JPEG, PNG, GIF, WebP images and MP4 videos");
        }

        // Check file size
        const isVideo = file.type === 'video/mp4';
        const maxSize = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024; // 15MB for video, 5MB for images
        
        if (file.size > maxSize) {
          throw new Error(`File size exceeds the ${isVideo ? '15MB' : '5MB'} limit`);
        }

        // Check media constraints using currentPosts
        const mediaCount = currentPosts.filter(p => p.mediaId).length;
        const isGif = file.type === 'image/gif';
        const isImage = supportedImageTypes.includes(file.type) && !isGif;
        
        const existingVideo = currentPosts.some(p => p.mediaId && p.mediaPreview?.includes('video/mp4'));
        const existingGif = currentPosts.some(p => p.mediaId && p.mediaPreview?.includes('image/gif'));
        const existingImages = currentPosts.filter(p => p.mediaId && !p.mediaPreview?.includes('video/') && !p.mediaPreview?.includes('image/gif')).length;

        if (isVideo || isGif) {
          if (mediaCount > 0) {
            throw new Error("Only 1 video or GIF can be attached to a Tweet");
          }
        } else if (isImage) {
          if (existingVideo || existingGif) {
            throw new Error("Cannot mix photos with videos or GIFs");
          }
          if (existingImages >= 4) {
            throw new Error("Maximum of 4 photos allowed per Tweet");
          }
        }

        const formData = new FormData();
        formData.append("media", file, file.name); // Include filename
        
        // Let browser handle multipart boundary
        const response = await fetch("/api/twitter/upload", {
          method: "POST",
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        const { mediaId } = data;

        currentPosts[index] = {
          ...currentPosts[index],
          mediaId,
        };
        saveAutoSave(currentPosts);
        setPosts(currentPosts);
      } catch (error) {
        console.error("Media upload error:", error);

        // Remove preview and show error
        currentPosts[index] = {
          ...currentPosts[index],
          mediaPreview: null,
          mediaId: null,
        };
        setPosts(currentPosts);

        setError({
          title: "Media Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [setPosts, setError, saveAutoSave],
  );

  const removeMedia = useCallback(
    (index) => {
      let currentPosts;
      setPosts((posts) => {
        currentPosts = [...posts];
        currentPosts[index] = {
          ...currentPosts[index],
          mediaId: null,
          mediaPreview: null,
        };
        saveAutoSave(currentPosts);
        return currentPosts;
      });
    },
    [setPosts, saveAutoSave],
  );

  return { handleMediaUpload, removeMedia };
}
