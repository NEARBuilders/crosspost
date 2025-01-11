import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { useTwitterConnection } from "../store/twitter-store";
import { ModalWindowControls } from "./modal-window-controls";
import { Avatar } from "./social/avatar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function TwitterApiNotice({ post }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [hasShown, setHasShown] = useState(false);
  const { isConnected } = useTwitterConnection();

  useEffect(() => {
    if (true) {
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
    <>
      {showConfetti && open && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            onConfettiComplete={() => setShowConfetti(false)}
          />
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-none bg-transparent p-0 shadow-none">
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
          className="relative w-full max-w-2xl base-component"
        >
          <ModalWindowControls onClose={() => setOpen(false)} />
          <div className="p-6 relative ">
            <div className="flex gap-6">
              <TooltipProvider>
                <Tooltip open>
                  <TooltipTrigger asChild>
                    <div
                      className="cursor-pointer flex-shrink-0 mt-4"
                      onClick={() => router.push("/profile/davidmo.near")}
                    >
                      <Avatar accountId="davidmo.near" size={64} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    className="font-bold px-3 py-2 rounded-xl base-component animate-bounce"
                  >
                    {'"NEAR is the blockchain for AI!"'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex-grow space-y-4">
                <DialogHeader>
                  <VisuallyHidden.Root>
                    <DialogTitle className="font-mono text-2xl font-bold">
                      We&apos;re back in business!
                    </DialogTitle>
                  </VisuallyHidden.Root>
                </DialogHeader>

                <DialogTitle className="text-2xl font-bold">
                  We&apos;re back in business!
                </DialogTitle>

                <p className="text-gray-600">
                  The incredible David Morrison (davidmo.near) donated 40N to
                  pay the API fee! 🎉
                </p>

                <div className="flex justify-end">
                  <Button onClick={handleThanks}>say thanks!</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
