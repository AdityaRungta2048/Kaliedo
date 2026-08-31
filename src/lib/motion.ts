/**
 * One motion vocabulary for the whole app.
 *
 * Everything here is a tween, deliberately. Springs overshoot unless they are
 * critically damped, and the overshoot reads as a wobble when a row of cards or
 * a tab indicator settles. Motion should say "this moved", not "this is bouncy".
 */
export const EASE = [0.22, 1, 0.36, 1] as const

/** Press feedback and other movement the eye should barely register. */
export const T_FAST = { duration: 0.14, ease: EASE }
/** Tab pills, toggles, toasts — the default. */
export const T_BASE = { duration: 0.26, ease: EASE }
/** Sheets, layout morphs, anything crossing a lot of distance. */
export const T_SLOW = { duration: 0.36, ease: EASE }
