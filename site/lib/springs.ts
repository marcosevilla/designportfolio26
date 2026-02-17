/** Shared spring configs for Framer Motion transitions. */

/** Quick snap — hover nudges, toggle buttons, small UI reactions */
export const SPRING_SNAP = { type: "spring" as const, stiffness: 400, damping: 25 };

/** Heavy — panels, sheets, larger elements entering/exiting */
export const SPRING_HEAVY = { type: "spring" as const, stiffness: 500, damping: 32 };

/** Slow slide — marquee, gentle reveals */
export const SPRING_SLOW = { type: "spring" as const, stiffness: 300, damping: 30 };
