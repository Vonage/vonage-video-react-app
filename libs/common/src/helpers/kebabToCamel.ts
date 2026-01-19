/**
 * Converts a kebab-case string to camelCase.
 * Example: 'hello-world' -> 'helloWorld'
 */
function kebabToCamel(str: string): string {
  return str
    .split('-')
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
}

export default kebabToCamel;
