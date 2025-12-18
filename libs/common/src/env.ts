type Mode = 'development' | 'production';

const mode = (process.env.NODE_ENV || 'development') as Mode;

const env = {
  mode,
  isProduction: mode === 'production',
  isDevelopment: mode !== 'production',
} as const;

export default env;
