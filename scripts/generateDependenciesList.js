const fs = require('fs');
const axios = require('axios');

const readFile = (path) => {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
};

const generateDependenciesList = async () => {
  const frontendPackageJson = readFile('./frontend/package.json');
  const backendPackageJson = readFile('./backend/package.json');

  const frontendDependencies = {
    ...frontendPackageJson.dependencies,
    ...frontendPackageJson.devDependencies,
  };

  const backendDependencies = {
    ...backendPackageJson.dependencies,
    ...backendPackageJson.devDependencies,
  };

  const frontendMarkdownList = await createMarkdownList(frontendDependencies);
  const backendMarkdownList = await createMarkdownList(backendDependencies);

  const frontendSection = `# Frontend Dependencies
${frontendMarkdownList.sort().join('\n')}
`;

  const backendSection = `
# Backend Dependencies
${backendMarkdownList.sort().join('\n')}
`;

  const markdownContent = frontendSection + backendSection;
  fs.writeFileSync('./docs/DEPENDENCIES.md', markdownContent, 'utf8');
};

const createMarkdownList = async (dependencies) => {
  const markdownList = [];
  for (const [name, version] of Object.entries(dependencies)) {
    try {
      const response = await axios.get(`https://registry.npmjs.org/${name}`);
      const data = await response.data;
      const description = data.description || '';
      markdownList.push(`- [${name}](https://www.npmjs.com/package/${name}) ${description}`);
    } catch (error) {
      console.error(`Error fetching data for ${name}:`, error);
    }
  }
  return markdownList;
};

generateDependenciesList();
