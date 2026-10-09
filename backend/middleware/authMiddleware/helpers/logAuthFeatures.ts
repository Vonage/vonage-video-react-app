import loadConfig from '../../../helpers/config';

function logAuthFeatures(): void {
  const { authEnabled } = loadConfig();

  console.log(`Auth: ${authEnabled ? 'on' : 'off'}`);
}

export default logAuthFeatures;
