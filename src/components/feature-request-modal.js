import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useState } from "react";
import { usePostMedia } from "../hooks/use-post-media";
import { ModalWindowControls } from "./modal-window-controls";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const PREPEND_TEXT = "!submit @open_crosspost";

export function RequestFeatureButton({ post }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async ({ text, mediaId }) => {
    try {
      await post([{ text, mediaId }]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to post feature request:", err);
      throw err; // Let the modal handle the error
    }
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} size="sm">
        Request Feature
      </Button>

      <FeatureRequestModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
      />
    </>
  );
}

export function FeatureRequestModal({ isOpen, onOpenChange, onSubmit }) {
  const { toast } = useToast();
  const [type, setType] = useState("feature");
  const [text, setText] = useState("");
  const [posts, setPosts] = useState([
    { text: "", mediaId: null, mediaPreview: null },
  ]);

  const { handleMediaUpload, removeMedia } = usePostMedia(
    setPosts,
    toast,
    () => {}, // no-op for saveAutoSave since we don't need it
  );

  const getPrefix = (type) => `${PREPEND_TEXT} #${type} `;

  const handleTextChange = (value) => {
    setText(value);
  };

  const getFullText = () => {
    return getPrefix(type) + text;
  };

  const getRemainingChars = () => {
    const prefixLength = getPrefix(type).length;
    return 280 - prefixLength - text.length;
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty Request",
        description: "Please enter your request details",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit({
        text: getFullText().trim(),
        mediaId: posts[0]?.mediaId,
      });
      setText("");
      setPosts([{ text: "", mediaId: null, mediaPreview: null }]);
      onOpenChange(false);
      toast({
        title: "Request Submitted",
        description: "Your feature request has been posted.",
      });
    } catch (err) {
      console.error("Submit error:", err);
      toast({
        title: "Error",
        description: "Failed to submit feature request",
        variant: "destructive",
      });
    }
  };

  const handleMediaInputClick = () => {
    document.getElementById("feature-request-media").click();
  };

  const handleMediaUploadChange = (e) => {
    handleMediaUpload(0, e.target.files[0]);
  };

  const handleMediaRemove = () => {
    removeMedia(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-none bg-transparent p-0 shadow-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl border-2 border-gray-800 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]"
        >
          <ModalWindowControls onClose={() => onOpenChange(false)} />
          <div className="p-6">
            <DialogHeader className="mb-4">
              <VisuallyHidden.Root>
                <DialogTitle className="font-mono text-2xl font-bold">
                  Request Feature
                </DialogTitle>
              </VisuallyHidden.Root>
              <DialogDescription className="text-gray-600">
                Submit a feature request or report a bug
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <div className="text-sm text-gray-500">
                  Will be posted as:{" "}
                  <span className="font-mono">{getPrefix(type)}</span>
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Describe your feature request or bug report..."
                  className={`min-h-[200px] rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    getRemainingChars() < 0 ? "border-destructive" : ""
                  }`}
                />
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUploadChange}
                  className="hidden"
                  id="feature-request-media"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleMediaInputClick}
                    size="sm"
                    disabled={posts[0].mediaId !== null}
                  >
                    Add Media
                  </Button>
                  {posts[0].mediaPreview && (
                    <div className="relative">
                      <img
                        src={posts[0].mediaPreview}
                        alt="Preview"
                        className="h-10 w-10 object-cover rounded"
                      />
                      <Button
                        onClick={handleMediaRemove}
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span
                  className={`text-sm ${
                    getRemainingChars() < 0
                      ? "text-destructive"
                      : "text-gray-500"
                  }`}
                >
                  {getRemainingChars()} characters remaining
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!text.trim() || getRemainingChars() < 0}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
