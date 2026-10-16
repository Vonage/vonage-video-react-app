import isVcr from './isVcr';
import isVercel from './isVercel';

// Hosted platforms terminate TLS for us, so cookies can be marked `secure`.
const isHttpsDeployment = isVcr || isVercel;
export default isHttpsDeployment;
