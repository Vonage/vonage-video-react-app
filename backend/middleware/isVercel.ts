// Vercel sets VERCEL=1 for builds and functions: https://vercel.com/docs/environment-variables/system-environment-variables
const isVercel = process.env.VERCEL === '1';
export default isVercel;
