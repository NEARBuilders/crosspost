import { useState } from 'react';
import { useXStore } from '../store/xStore';
import { useNearSocialPost } from '../store/near-social-store';

export function PostForm() {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const postToTwitter = useXStore((state) => state.post);
  const { post: postToNearSocial } = useNearSocialPost();

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please enter your post text');
      return;
    }

    try {
      setError('');
      // await postToTwitter(text);
      await postToNearSocial(text);
      setText('');
    } catch (err) {
      setError('Failed to send post');
      console.error('Post error:', err);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's happening?"
        maxLength={280}
        className="w-full min-h-[150px] p-4 border-2 border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-[2px_2px_0_rgba(0,0,0,1)]"
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {text.length}/280 characters
        </span>
        <button 
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex items-center gap-2 px-6 py-2 border-2 border-gray-800 hover:bg-gray-100 shadow-[2px_2px_0_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Post
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
