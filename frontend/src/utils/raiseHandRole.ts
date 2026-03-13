/**
 * isModeratorRole - returns whether the current user has moderator privileges.
 *
 * In v1 every participant is treated as a moderator.
 * When real user-role support ships, update only this helper — all raise-hand
 * components that gate moderator actions on this function will automatically
 * respect the new role model.
 * @returns {boolean} true if the current user may perform moderator actions
 */
export const isModeratorRole = (): boolean => true;
