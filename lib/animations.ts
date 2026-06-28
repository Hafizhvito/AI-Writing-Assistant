export const ANIMATIONS = {
  panelSlideIn: {
    initial: { x: 340, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 340, opacity: 0 },
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  toolbarFadeUp: {
    initial: { y: 8, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 8, opacity: 0 },
    transition: { duration: 0.15, ease: "easeOut" as const },
  },
  toastSlideIn: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { type: "spring" as const, stiffness: 400, damping: 35 },
  },
  bottomSheetSlideUp: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "spring" as const, stiffness: 300, damping: 35 },
  },
};

export const REDUCED_MOTION_TRANSITION = { duration: 0 };
