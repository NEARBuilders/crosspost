import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { ModalWindowControls } from "./modal-window-controls";
import { format } from "date-fns";

export function TwitterApiNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the notice
    const hasSeenNotice = localStorage.getItem('hasSeenTwitterApiNotice');
    
    if (!hasSeenNotice) {
      const timer = setTimeout(() => {
        setOpen(true);
        // Mark that user has seen the notice
        localStorage.setItem('hasSeenTwitterApiNotice', 'true');
      }, 800);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-none bg-transparent p-0 shadow-none">
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{
            opacity: 1,
            x: [0, -10, 10, -5, 5, 0],
            transition: {
              opacity: { duration: 0.1 },
              x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
            },
          }}
          className="relative border-2 border-gray-800 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]"
        >
          <ModalWindowControls onClose={() => setOpen(false)} />
          <div className="p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="font-mono text-xl font-semibold">
                We&apos;ve been ratelimited.
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                We exceeded our ration of 17 tweets per 24 hours... so while we
                wait until{" "}
                {format(new Date(1736524953 * 1000), "h:mm a 'on' MMM d, yyyy")}
                , we&apos;re raising funds to pay the absurd $200/month API fee.
              </DialogDescription>
              <div className="pt-2 flex gap-4">
                <Button asChild>
                  <a
                    href="https://app.potlock.org/?tab=project&projectId=crosspost.near"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    please donate
                  </a>
                </Button>
                <Button disabled>buy $XPOST</Button>
              </div>
            </DialogHeader>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
