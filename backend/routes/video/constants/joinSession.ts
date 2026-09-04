import type { HandlersConfig } from '@api-lib';
import { TokenRole } from '@api-lib';

// Video API tokens can be valid for up to 30 days, but we use 24 hours for security
// Each joinSession call generates a fresh token, so there's no benefit to longer TTLs
// 24 hours is sufficient to handle:
// - Typical video sessions (1-3 hours)
// - Server rotations (occur ~every 8 hours)
// - Reconnection scenarios
// Reference: https://api.support.vonage.com/hc/en-us/articles/26669850825116
const twentyFourHoursInSeconds = 24 * 60 * 60;

const joinSession: HandlersConfig['joinSession'] = {
  addDefaults: (payload) => {
    // SECURITY FIX: This addDefaults was changed to prevent security vulnerabilities.
    //
    // PREVIOUS IMPLEMENTATION (VULNERABLE):
    // Previously, we spread clientTokenOptions AFTER setting defaults:
    //   clientTokenOptions: {
    //     role: TokenRole.MODERATOR,
    //     expireTime: ...,
    //     ...payload.clientTokenOptions  // <-- This would OVERRIDE the defaults above!
    //   }
    //
    // SECURITY ISSUES WITH OLD APPROACH:
    // 1. Privilege Escalation: Client could send role='publisher' or 'subscriber' to override MODERATOR
    // 2. Token Expiration: Client could send expireTime to create never-expiring tokens
    // 3. The Zod schema validates TYPES but NOT VALUES - it accepts any valid string for role
    //
    // CURRENT IMPLEMENTATION (SECURE):
    // We now extract and discard security-critical fields BEFORE applying defaults.
    // The destructuring order guarantees that client values CANNOT override server values.
    //
    // Step 1: Extract and discard role/expireTime from client input
    const {
      role: _ignoredRole, // Prefix with _ to mark as intentionally unused
      expireTime: _ignoredExpireTime, // These are explicitly discarded for security
      ...safeClientOptions // Everything else (data, initialLayoutClassList) is safe
    } = payload.clientTokenOptions || {};

    return {
      ...payload,
      clientTokenOptions: {
        // Step 2: Apply safe client options first (data, initialLayoutClassList, etc.)
        ...safeClientOptions,

        // Step 3: Force server-controlled security-critical values LAST
        // These CANNOT be overridden because they come after the spread operator
        role: TokenRole.MODERATOR,

        // expireTime is an absolute UNIX time in seconds (the SDK writes it into the JWT `exp`).
        // Setting this to 24 hours from now ensures tokens work through server rotations.
        expireTime: Math.floor(Date.now() / 1000) + twentyFourHoursInSeconds,
      },
    };
  },
};

export default joinSession;
