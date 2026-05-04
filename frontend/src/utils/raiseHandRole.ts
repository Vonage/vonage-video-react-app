/**
 * Whether the current user may perform moderator actions on raised hands
 * (lower an individual hand, lower-all).
 *
 * v1 design — every participant is a moderator.
 *
 * VERA does not yet have a server-side role model, so we ship a permissive
 * v1: any participant may lower another participant's hand. This matches
 * Google Meet's small-meeting behavior and is intentional for the initial
 * release. Lowering is broadcast through the same signal channel as raise,
 * so no privileged backend path exists to abuse.
 *
 * When real role/permission support ships, update only this helper — every
 * raise-hand component already gates its moderator UI on this function and
 * will pick up the new model automatically.
 * @returns true while v1's permissive model is in effect.
 */
export const isModeratorRole = (): boolean => true;
