#!/usr/bin/env tsx
/**
 * Validates app-config.json, theme.json and theme.example.json against the JSON schemas in specs/.
 * Run: pnpm validate:config
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import type { AnySchema } from 'ajv';
import addFormats from 'ajv-formats';

type ValidationTarget = {
  schemaPath: string;
  dataPaths: string[];
};

const validationTargets: ValidationTarget[] = [
  { schemaPath: 'specs/app-config.schema.json', dataPaths: ['app-config.json'] },
  { schemaPath: 'specs/theme.schema.json', dataPaths: ['theme.json', 'theme.example.json'] },
];

function main() {
  const validator = new Ajv2020({ allErrors: true, strict: false });
  addFormats(validator);

  const invalidFilePaths = validationTargets.flatMap(function validateTarget({
    schemaPath,
    dataPaths,
  }) {
    const validate = validator.compile(readJson<AnySchema>(schemaPath));

    return dataPaths.filter(function isInvalidFile(dataPath) {
      if (validate(readJson(dataPath))) {
        console.log(`${dataPath} is valid`);
        return false;
      }

      console.error(`${dataPath} is invalid against ${schemaPath}:`);
      console.error(validator.errorsText(validate.errors, { dataVar: dataPath, separator: '\n' }));
      return true;
    });
  });

  if (invalidFilePaths.length > 0) process.exit(1);
}

function readJson<Parsed = unknown>(filePath: string): Parsed {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8')) as Parsed;
}

main();
