"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { duration, spring } from "@/lib/motion";

export function Modal({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="modal"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#f4f7fb]/75 px-6 backdrop-blur-[6px]"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : duration.fast }}
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={reduce ? { duration: 0.01 } : spring}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
