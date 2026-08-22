import dotenv from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../utils/prisma';
dotenv.config({
  path: path.resolve(process.cwd(), '../.env'),
});
console.log('DATABASE_URL:', process.env.DATABASE_URL);

type TranslationRecord = {
  key: string;
  language: string;
  value: string;
};

type TypeNode = {
  children: Map<string, TypeNode>;
  isLeaf: boolean;
};

const rootDir = path.resolve(__dirname, '../..');

const generatedDir = path.join(rootDir, 'generated');
const exportsDir = path.join(rootDir, 'exports');

const typesFile = path.join(generatedDir, 'translations.ts');
const jsonFile = path.join(exportsDir, 'translations.json');

function createTypeTree(translations: TranslationRecord[]): TypeNode {
  const root: TypeNode = {
    children: new Map(),
    isLeaf: false,
  };

  for (const translation of translations) {
    const parts = translation.key.split('.');

    let current = root;

    for (const part of parts) {
      if (!current.children.has(part)) {
        current.children.set(part, {
          children: new Map(),
          isLeaf: false,
        });
      }

      current = current.children.get(part)!;
    }

    current.isLeaf = true;
  }

  return root;
}

function generateType(node: TypeNode, indent = 2): string {
  const spaces = ' '.repeat(indent);

  const properties = [...node.children.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, child]) => {
      if (child.isLeaf && child.children.size === 0) {
        return `${spaces}${key}: string;`;
      }

      return `${spaces}${key}: ${generateType(child, indent + 2)};`;
    });

  return `{\n${properties.join('\n')}\n${' '.repeat(indent - 2)}}`;
}

function generateTypesFile(translations: TranslationRecord[]): string {
  const tree = createTypeTree(translations);

  const type = generateType(tree);

  return `/**
 * This file is auto-generated.
 * Do not edit manually.
 */

export interface TranslationData ${type}
`;
}

async function main() {
  console.log('Loading translations from database...');

  const translations = await prisma.translation.findMany({
    select: {
      key: true,
      language: true,
      value: true,
    },
    orderBy: [
      {
        language: 'asc',
      },
      {
        key: 'asc',
      },
    ],
  });

  console.log(`Found ${translations.length} translations.`);

  await mkdir(generatedDir, { recursive: true });
  await mkdir(exportsDir, { recursive: true });

  // --------------------------------------------------
  // Generate TypeScript types
  // --------------------------------------------------

  const typesContent = generateTypesFile(translations);

  await writeFile(typesFile, typesContent, 'utf8');

  console.log(`Generated: ${typesFile}`);

  // --------------------------------------------------
  // Generate JSON backup
  // --------------------------------------------------

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    translations,
  };

  await writeFile(jsonFile, JSON.stringify(backup, null, 2), 'utf8');

  console.log(`Generated: ${jsonFile}`);

  await prisma.$disconnect();

  console.log('Done.');
}

main().catch(async (error) => {
  console.error('Failed to generate translations:', error);

  await prisma.$disconnect();

  process.exit(1);
});
