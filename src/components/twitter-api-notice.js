import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactConfetti from "react-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ModalWindowControls } from "./modal-window-controls";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useTwitterConnection } from "../store/twitter-store";

export function TwitterApiNotice({ post }) {
  const [open, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [hasShown, setHasShown] = useState(false);
  const { isConnected } = useTwitterConnection();

  useEffect(() => {
    if (isConnected && !hasShown) {
      const timer = setTimeout(() => {
        setOpen(true);
        setHasShown(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isConnected, hasShown]);

  const handleThanks = () => {
    try {
      post([{ text: "thanks @David___Mo! we love you 🚀✨💖🎉" }]);
    } catch (e) {
      console.error("error posting", e);
      // I don't care
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-none bg-transparent p-0 shadow-none">
        {showConfetti && open && (
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: [0, -10, 10, -5, 5, 0],
            transition: {
              opacity: { duration: 0.1 },
              x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
            },
          }}
          className="relative w-full max-w-2xl border-2 border-gray-800 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]"
        >
          <ModalWindowControls onClose={() => setOpen(false)} />
          <div className="p-6">
            <DialogHeader>
              <VisuallyHidden.Root>
                <DialogTitle className="font-mono text-2xl font-bold">
                  We&apos;re back in business!
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  The incredible David Morrison (davidmo.near) donated 40N to pay the API fee! 🎉
                </DialogDescription>
              </VisuallyHidden.Root>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                The incredible David Morrison (davidmo.near) donated 40N to pay the API fee! 🎉
              </p>
              <div className="flex gap-4">
                <Button onClick={handleThanks}>say thanks!</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
