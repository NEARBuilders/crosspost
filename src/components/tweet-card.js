import { MessageCircle, Repeat2, Heart } from "lucide-react";

export function TweetCard({ data, username, onQuote, isQuoted = false }) {
  // Handle both direct tweet data and nested tweet data
  const tweet = data?.data || data;

  const tweetText = tweet?.text;
  
  // Find quoted tweets in referenced_tweets
  const quotedTweetRef = tweet?.referenced_tweets?.find(ref => ref.type === 'quoted');
  const quotedTweet = quotedTweetRef && data?.includes?.tweets?.find(t => t.id === quotedTweetRef.id);
  const quotedUser = quotedTweet && data?.includes?.users?.find(u => u.id === quotedTweet.author_id);

  return (
    <div 
      className={`cursor-pointer border-2 border-gray-800 p-4 rounded-lg hover:bg-gray-50 transition-colors ${
        isQuoted ? "mt-4 mx-4" : "mb-6"
      }`}
      onClick={(e) => {
        // Prevent click from bubbling to parent tweet cards
        if (!isQuoted) {
          e.stopPropagation();
          onQuote();
        }
      }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold">@{username}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap">{tweetText}</p>
        <div className="mt-4 flex items-center gap-6 text-gray-500">
          <div className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <MessageCircle size={18} />
          </div>
          <div className="flex items-center gap-2 hover:text-green-500 transition-colors">
            <Repeat2 size={18} />
          </div>
          <div className="flex items-center gap-2 hover:text-red-500 transition-colors">
            <Heart size={18} />
          </div>
        </div>

        {/* Recursively render quoted tweet if it exists */}
        {quotedTweet && quotedUser && (
          <div className="mt-4 border-t-2 border-gray-200 pt-4">
            <TweetCard
              data={{ data: quotedTweet, includes: data.includes }}
              username={quotedUser.username}
              onQuote={onQuote}
              isQuoted={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
