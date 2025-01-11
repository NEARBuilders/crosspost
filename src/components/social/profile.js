import { Avatar } from "./avatar";
import ReactMarkdown from "react-markdown";
import { getImageUrl } from "../../lib/near-social";

export const ProfileView = ({ profile }) => (
  <div className="mb-4 bg-white p-4">
    <div
      className="h-40 rounded-t-lg bg-cover bg-center"
      style={{
        backgroundImage: profile.backgroundImage
          ? `url(${getImageUrl(profile.backgroundImage)})`
          : undefined,
      }}
    ></div>
    <div className="-mt-12 ml-4 flex items-center">
      <Avatar
        url={getImageUrl(profile.image)}
        alt={profile.name || "Profile"}
        size={128}
      />
    </div>
    <div className="mt-4">
      <h2 className="text-purple text-2xl font-bold">
        {profile.name || "Anonymous"}
      </h2>
      <div className="mt-2 text-gray-600 prose prose-sm max-w-none">
        <ReactMarkdown>{profile.description || ""}</ReactMarkdown>
      </div>
    </div>
  </div>
);
