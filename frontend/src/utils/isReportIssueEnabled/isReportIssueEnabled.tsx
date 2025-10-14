import env from '../../env';

/**
 * Whether the Report Issue feature is enabled. See `frontend/env.example` for more information.
 * @returns {boolean} Whether the Report Issue feature is enabled.
 */
export default (): boolean => env.VITE_ENABLE_REPORT_ISSUE;
