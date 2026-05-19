import path from 'path';
import { fileURLToPath } from 'url';

const getWorkspaceRootPath = (): string => {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  // Resolve from vera-studio/src/routes -> monorepo workspace root.
  return path.resolve(dirname, '../../..');
};

export default getWorkspaceRootPath;
