import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { ModalWindowControls } from "./modal-window-controls";

export function TwitterApiNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 800);

    return () => clearTimeout(timer);
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
              x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
            }
          }}
          className="relative border-2 border-gray-800 bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]"
        >
          <ModalWindowControls onClose={() => setOpen(false)} />
          <div className="p-6">
            <DialogHeader className="text-left">
              <DialogTitle className="font-mono text-xl font-semibold">
                Twitter API Notice
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Due to Twitter&apos;s API rate limiting and increased pricing, Twitter integration has been temporarily disabled. We apologize for any inconvenience and are exploring alternative solutions.
              </DialogDescription>
            </DialogHeader>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
