import { useCallback } from "react";

export function usePostMedia(setPosts, setError, saveAutoSave) {
  const handleMediaUpload = useCallback(
    async (index, file) => {
      if (!file) return;

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      setPosts((posts) => {
        const newPosts = [...posts];
        newPosts[index] = {
          ...newPosts[index],
          mediaPreview: previewUrl,
        };
        return newPosts;
      });

      // Upload to Twitter
      try {
        const formData = new FormData();
        formData.append("media", file);

        const response = await fetch("/api/twitter/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        const { mediaId } = data;

        setPosts((posts) => {
          const newPosts = [...posts];
          newPosts[index] = {
            ...newPosts[index],
            mediaId,
          };
          saveAutoSave(newPosts);
          return newPosts;
        });
      } catch (error) {
        console.error("Media upload error:", error);
        setError({
          title: "Media Upload Failed",
          description: error.message || "Failed to upload media",
          variant: "destructive",
        });

        // Remove preview on error
        setPosts((posts) => {
          const newPosts = [...posts];
          newPosts[index] = {
            ...newPosts[index],
            mediaPreview: null,
            mediaId: null,
          };
          return newPosts;
        });
      }
    },
    [setPosts, setError, saveAutoSave],
  );

  const removeMedia = useCallback(
    (index) => {
      setPosts((posts) => {
        const newPosts = [...posts];
        newPosts[index] = {
          ...newPosts[index],
          mediaId: null,
          mediaPreview: null,
        };
        saveAutoSave(newPosts);
        return newPosts;
      });
    },
    [setPosts, saveAutoSave],
  );

  return { handleMediaUpload, removeMedia };
}
